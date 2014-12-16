'use strict';

angular.module('settlersApp')
  .factory('boardFactory', function($state, $rootScope, authFactory) {
    if(!authFactory.getAuthData()) {
      $state.go('main');
    }

    var camera, scene, renderer, controls, light, water, game_board, someAction, updateEngine;

    var canvas_width = $(window).width();
    var canvas_height = $(window).height();

    var init = function(game) {

      scene = new THREE.Scene();


      camera = new THREE.PerspectiveCamera( 45, canvas_width / canvas_height, 1, 700 );
      var camera_x = 0;
      var camera_z = -300;
      camera.position.set( camera_x, 200, camera_z );

      
      controls = new THREE.OrbitControls( camera, renderer.domElement );
      controls.noPan = true;
      controls.maxPolarAngle = Math.PI/2.5;
      controls.minDistance=5;
      controls.maxDistance=500;

      scene.add( new THREE.AmbientLight( 0x222222 ) );

      light = new THREE.PointLight( 0xffffff );
      light.position.copy( camera.position );
      scene.add( light );

      scene.add( renderWater() );

      game_board = new Game(scene, game);

      controls.addEventListener( 'change', function() {        
        var num_rows = game_board.board.tiles.length;
        var angle = Math.atan(camera.position.x/camera.position.z);
        if(camera.position.z>0){
          angle+= Math.PI;
        }

        for(var row=0; row<num_rows; row++){
          var num_cols = game_board.board.tiles[row].length;
          for(var col=0; col<num_cols; col++){
            if(!!game_board.board.tiles[row][col].chit){
              game_board.board.tiles[row][col].chit.rotation.set(Math.PI/2, Math.PI, angle);
            }
          }
        }

        for(var i=0, len=game_board.board.ports.length; i<len;i++){
          game_board.board.ports[i].rotation.set(Math.PI/2, Math.PI, angle);
        }
      });
  }

  var animate = function() {
      light.position.copy(camera.position);
      water.material.uniforms.time.value += 1.0 / 30.0;
      renderer.render( scene, camera );

    setTimeout(function(){
      requestAnimationFrame(animate);
      controls.update();

    }, 60);
  }

  var createRenderer = function(){
    var renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setClearColor( 0xA1CEED );
    renderer.setSize( canvas_width, canvas_height );

    renderer.domElement.id="board-canvas";

    // Click event handler calculates the  x & z coordinates on the y=0 plane that correspond to where user clicked on canvas
    renderer.domElement.addEventListener('click', function(event){

      controls.autoRotate=false;

      var vector = new THREE.Vector3();

      var canvas_position = $("#board-canvas").offset();
      vector.set(
          ((event.clientX - canvas_position.left) / canvas_width ) * 2 - 1,
          - ( (event.clientY - canvas_position.top) / canvas_height ) * 2 + 1,
          0.5 );

      vector.unproject( camera );

      var dir = vector.sub( camera.position ).normalize();

      var distance = - camera.position.y / dir.y;

      var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
      pos.x*= -1;
      var click_coordinates = [pos.x, pos.z];

      if(!!someAction){
        var success = someAction.call(game_board.board, click_coordinates, updateEngine);
        unset_someAction(success);
      }
    });
    return renderer;
  };

  var renderWater = function(){

    var waterNormals = new THREE.ImageUtils.loadTexture( 'assets/images/waternormals.jpg' );
    waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 

    water = new THREE.Water( renderer, camera, scene, {
      waterNormals: waterNormals,
      alpha:  0.8,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x3D50E0,
      distortionScale: 50.0,
    } );

    var mirrorMesh = new THREE.Mesh(
      new THREE.PlaneBufferGeometry( 2400, 2400 ),
      water.material
    );

    mirrorMesh.rotation.x = - Math.PI * 0.5;
    return mirrorMesh;
  };

  var renderer = createRenderer();

  $(window).on('resize', function(){
    canvas_width = $(window).width();
    canvas_height = $(window).height();
    $("#board_container").height(canvas_height);
    if(!!camera){
      camera.aspect = (canvas_width/canvas_height);
      camera.updateProjectionMatrix();
    }
    renderer.setSize(canvas_width, canvas_height);
  });

  function unset_someAction(success){
    if(success){
      someAction = null;
      updateEngine = null;
    }
  };

  return {
    buildRoad: function(player, vertex1, vertex2) {
      game_board.board.buildRoad(player, vertex1, vertex2);
    },
    drawGame: function(game) {
      init(game);
    },
    insert: function() {
      $("#board_container").height(canvas_height);
      $("#board_container").prepend( renderer.domElement );
      $("#board-canvas").addClass( 'full' );
      $("board-canvas").focus();

      $('#board-canvas').on('mousewheel', function(e) {
          e.preventDefault();
          e.stopPropagation();
      });
      animate();
    },
    set_someAction: function(action){
      var engine_factory = angular.element(document.body).injector().get('engineFactory');
      switch(action){
        case "road":
          if(updateEngine === engine_factory.buildRoad){
            unset_someAction();
          } else {
            someAction = game_board.board.getRoad;
            updateEngine = engine_factory.buildRoad;
          }
          break;
        case "building":
          if(updateEngine === engine_factory.buildSettlement){
            unset_someAction();
          } else {
            someAction = game_board.board.getVertex;
            updateEngine = engine_factory.buildSettlement;
          }
          break;
        case "robber":
          someAction = game_board.board.getTile;
          updateEngine = engine_factory.moveRobber;
          break;
      }
    },
    moveRobber: function(destination){
      game_board.board.moveRobber(destination);
    },
    newBoard: function(small_num, big_num){
      renderer.delete;
      scene.delete;
      renderer = createRenderer();
      init(small_num, big_num);
      animate();
    },
    placeSettlement: function(player, location){
      var row=location[0], col=location[1];
      if(!game_board.board.boardVertices[row][col].building){
        var settlement = new Building(game_board.board, "settlement", player, location);
        game_board.board.boardVertices[row][col].building=settlement;
        scene.add(settlement.building);
      }
    },
    upgradeSettlementToCity: function(player, location){
      var row=location[0], col=location[1];
      var vertex_building = game_board.board.boardVertices[row][col].building;
      scene.remove(vertex_building.building);
      vertex_building.cityShape();
      scene.add(vertex_building.building);
    },
    getGame: function(){
      return game_board;
    }
  };
})

.controller('BoardCtrl', function(boardFactory, engineFactory, authFactory, $scope, $rootScope){
  var self = this;
  self.setMode = boardFactory.set_someAction;
  self.textContent = "";
  $rootScope.currentTurn = engineFactory.getGame().turn;
  $scope.playerHasRolled = false;
  $rootScope.currentPlayer = engineFactory.getGame().currentPlayer;
  $rootScope.playerBoard = [];

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };

  function refreshPlayerBoard(game) {
  game.players.forEach(function (item) {
      $rootScope.playerBoard = $rootScope.playerBoard || [];
      var resourceCount = 0;
      for (var resource in item.resources){
        resourceCount += item.resources[resource]; 
      };
      $rootScope.playerBoard[item.playerID] = {playerName: item.playerName, playerID: item.playerID, resources: resourceCount};
   })
  };

  $scope.submitChat = function(){
    chatLink.push({name: authFactory.getPlayerName(), text: self.textContent});
    self.textContent="";
  };

  function printChatMessage(name, text, systemMessage) {
    if (systemMessage !== undefined){
      $('<div style="color:#bb5e00; font-size:0.8em; font-weight: 900;"/>').text(text).prepend($('<b/>').text('')).appendTo($('.textScreen'));
    }
    else {
      $('<div/>').text(text).prepend($('<b/>').text(name+': ')).appendTo($('.textScreen'));
    }
    $('.textScreen')[0].scrollTop = $('.textScreen')[0].scrollHeight;
  };
  
  $scope.nextTurn = function(){
    if (
      ($scope.playerHasRolled === true
     && authFactory.getPlayerID() === $scope.currentPlayer) ||
      ($rootScope.currentTurn < (engineFactory.getGame().players.length * 2) && 
            authFactory.getPlayerID() === $rootScope.currentPlayer))
    {
      engineFactory.endTurn()
      $scope.playerHasRolled = false;
      $rootScope.currentPlayer = engineFactory.getGame().currentPlayer;
      $rootScope.currentTurn = engineFactory.getGame().turn;
    }  
  };
  $scope.rollDice = function(){
     if ($scope.playerHasRolled === false && $rootScope.currentPlayer === authFactory.getPlayerID())
       {
         $scope.playerHasRolled = true;
         engineFactory.rollDice();
         $rootScope.currentRoll = engineFactory.getGame().diceNumber;
         chatLink.push({name: 'GAME', text: "On turn " + $rootScope.currentTurn + ", " + engineFactory.getGame().players[$rootScope.currentPlayer].playerName + " has rolled a " + $rootScope.currentRoll, systemMessage: true});
       }
       $rootScope.currentRoll = engineFactory.getGame().diceNumber;
      if($rootScope.currentRoll===7){
        boardFactory.set_someAction("robber");
      }
   };

  $rootScope.currentRoll = engineFactory.currentDiceRoll();
  $scope.currentGameID = $rootScope.currentGameID;

  var dataLink = engineFactory.getDataLink();
  var chatLink = dataLink.child('games').child($rootScope.currentGameID).child('chats');
  var gameLink = dataLink.child('games').child($rootScope.currentGameID).child('data');
  var userLink = dataLink.child('games').child($rootScope.currentGameID);
  var userDB = dataLink.child('users');

  // monitor for new chats

  chatLink.on('child_added', function(snapshot) {
    var message = snapshot.val();
    console.log(message)
    if (!!message.systemMessage) {
      printChatMessage(message.name, message.text, message.systemMessage);
    }
      else {printChatMessage(message.name, message.text)};
  });

  function pullCurrentUsers(){
    userLink.once('value', function (snapshot) {
      var snapData = snapshot.val();
      var userData = snapData.users;
      $rootScope.playerBoard = $rootScope.playerBoard || [];
      for (var user in userData){
        userDB.child(userData[user].playerID).once('value', function(snap){
          var retrievedAuthData = snap.val();
          console.log(userData[user].playerNumber)
          var tempObj = {
            playerName: retrievedAuthData.facebook.displayName,
            playerID: userData[user].playerNumber
          }
          $rootScope.playerBoard[tempObj.playerID]= tempObj;
        })
      }      
    })
  };

  userLink.on('child_changed', function(){
    pullCurrentUsers();
    $rootScope.$apply();
  });

  pullCurrentUsers();

}) 
.directive('board', function(boardFactory) {
    return {
      restrict: 'E',
      templateUrl: 'components/board-view/board_template.html',
      controller: 'BoardCtrl as board_ctrl',
      link: function(){
        boardFactory.insert();
      }
    };
  });
