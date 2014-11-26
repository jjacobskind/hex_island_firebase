'use strict';

angular.module('settlersApp')
  .factory('boardFactory', function() {

    var camera, scene, renderer, controls, light, water;
    var canvas_width = 1000;
    var canvas_height = 500;

    var init = function() {

      scene = new THREE.Scene();


      camera = new THREE.PerspectiveCamera( 45, canvas_width / canvas_height, 1, 1000 );
      camera.position.set( 0, 200, 300 );

      controls = new THREE.OrbitControls( camera );
      controls.addEventListener( 'change', render );
      controls.autoRotate=true;
      controls.noPan = true;
      controls.maxPolarAngle = Math.PI/2.5;

      scene.add( new THREE.AmbientLight( 0x222222 ) );

      light = new THREE.PointLight( 0xffffff );
      light.position.copy( camera.position );
      scene.add( light );

      scene.add( renderWater() );

      var game = new Game(scene);
  }

  var animate = function() {
    requestAnimationFrame( animate );
    controls.update();
  }

  var render = function(){
    light.position.copy(camera.position);

    water.material.uniforms.time.value += 1.0 / 60.0;
    water.render();

    renderer.render( scene, camera );
  }

  var createRenderer = function(){
    var renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setClearColor( 0xA1CEED );
    renderer.setSize( canvas_width, canvas_height );

    // Click event handler calculates the  x & z coordinates on the y=0 plane that correspond to where user clicked on canvas
    renderer.domElement.addEventListener('click', function(event){

      controls.autoRotate=false;

      var vector = new THREE.Vector3();

      vector.set(
          ( event.clientX / width ) * 2 - 1,
          - ( event.clientY / height ) * 2 + 1,
          0.5 );

      vector.unproject( camera );

      var dir = vector.sub( camera.position ).normalize();

      var distance = - camera.position.y / dir.y;

      var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
      console.log( [pos.x, pos.z]);
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
      new THREE.PlaneBufferGeometry( 10000, 10000 ),
      water.material
    );

    mirrorMesh.position.set(0, tile_depth*-1, 0);

    mirrorMesh.rotation.x = - Math.PI * 0.5;
    return mirrorMesh;
  };

  var renderer = createRenderer();

  init();
  animate();

  return {
    insert: function(){
          $("#board_container").append( renderer.domElement );
    }
  };
})
.controller('BoardCtrl', function(boardFactory){
  boardFactory.insert();
}) 
.directive('board', function() {
    return {
      restrict: 'E',
      template: '<div id="board_container"></div>',
      controller: 'BoardCtrl',
      scope:true 
    };
  });