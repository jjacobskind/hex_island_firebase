'use strict';

angular.module('settlersApp')
  .factory('boardFactory', function() {

    var camera, scene, renderer, controls, light, water, game;
    var canvas_width = 1000;
    var canvas_height = 500;

    var init = function(small_num, big_num) {

      scene = new THREE.Scene();


      camera = new THREE.PerspectiveCamera( 45, canvas_width / canvas_height, 1, 700 );
      camera.position.set( 0, 200, -300 );

      $("#board_container").append( renderer.domElement );
      var canvas_element = $("#board-canvas");

      controls = new THREE.OrbitControls( camera, renderer.domElement );
      controls.addEventListener( 'change', render );
      // controls.autoRotate=true;
      controls.noPan = true;
      controls.maxPolarAngle = Math.PI/2.5;

      scene.add( new THREE.AmbientLight( 0x222222 ) );

      light = new THREE.PointLight( 0xffffff );
      light.position.copy( camera.position );
      scene.add( light );

      scene.add( renderWater() );

      game = new Game(scene, small_num, big_num);
  }

  var animate = function() {
      light.position.copy(camera.position);
      water.material.uniforms.time.value += 1.0 / 20.0;

    setTimeout(function(){
      requestAnimationFrame(animate);
      controls.update();

    }, 80);
  }

  var render = function(){

    
    water.render();
    renderer.render( scene, camera );
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
      // console.log(pos.x, pos.z);
      console.log(game.board.coordinatesToVertices([pos.x, pos.z]));
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
      new THREE.PlaneBufferGeometry( 1500, 1500 ),
      water.material
    );
    // mirrorMesh.position.set(0, tile_depth*-1, 0);

    mirrorMesh.rotation.x = - Math.PI * 0.5;
    return mirrorMesh;
  };

  var renderer = createRenderer();

  init(3, 5);
  animate();
  // setInterval(animate, 85);

  return {
    newBoard: function(small_num, big_num){
      renderer.delete;
      scene.delete;
      renderer = createRenderer();
      init(small_num, big_num);
      animate();
    },
    placeSettlement: function(playerID, location){
      // Need to refactor this so we can keep track of things built on board
      var row=location[0], col=location[1];
      if(!game.board.boardVertices[row][col].building){
        var coords = game.board.verticesToCoordinates(location);
        coords[1]-=game.board.building_depth/1.5;
        var settlement = new Building(game.board, "settlement", coords[0], coords[1], "red");
        game.board.boardVertices[row][col].building=settlement;
        scene.add(settlement.building);
      }
    },
    upgradeSettlementToCity: function(playerID, location){
      var row=location[0], col=location[1];
      var vertex_building = game.board.boardVertices[row][col].building;
      scene.remove(vertex_building.building);
      vertex_building.cityShape();
      scene.add(vertex_building.building);
    },
    getGame: function(){
      return game;
    }
  };
})
.controller('BoardCtrl', function(boardFactory){

}) 
.directive('board', function() {
    return {
      restrict: 'E',
      template: '<div id="board_container"></div>',
      controller: 'BoardCtrl',
      scope:true 
    };
  });