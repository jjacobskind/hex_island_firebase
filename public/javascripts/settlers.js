// BOARD SETUP***********************************************************
var tile_depth = 5;

var border_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
var tile_material = new THREE.MeshLambertMaterial( { color: 0xff8000, wireframe: false } );
var materials = [ border_material, tile_material ];

var pts = [], numPts = 6;
var l = 30;

for ( var i = 0; i < numPts * 2; i+=2 ) {

	var a = i / numPts * Math.PI;

	pts.push( new THREE.Vector2 ( Math.cos( a ) * l, Math.sin( a ) * l ) );

}

var hex = new THREE.Shape( pts );



var extrudeSettings = {
	amount			: tile_depth,
	steps			: 1,
	material		: 1,
	extrudeMaterial : 0,
	bevelEnabled	: true,
	bevelThickness  : 1,
	bevelSize       : 4,
	bevelSegments   : 1,
};

var circlePts = [];
var numCirclePts = 32

for(i=0;i<numCirclePts*2;i++){
	var a = i/numCirclePts * Math.PI;
	circlePts.push(new THREE.Vector2(Math.cos(a)*l/4, Math.sin(a)*l/4));
}

chip_geometry = new THREE.ExtrudeGeometry(new THREE.Shape(circlePts), {amount:1,
																		bevelEnabled:false
																		});
var Game = function(scene) {
	this.board = new Board(this);
	this.scene = scene;

	this.scene.add(this.drawSettlement(30, 0, "blue"));
	this.scene.add(this.drawCity(-30,0, "red"));
	this.scene.add(this.drawRobber());
};

Game.prototype.shuffle = function(array) {
   for (var i = array.length - 1; i > 0; i--) {
       var j = Math.floor(Math.random() * (i + 1));
       var temp = array[i];
       array[i] = array[j];
       array[j] = temp;
   }
   return array;
};

Game.prototype.drawSettlement = function(x, z, color) {
	var pts = [];
	pts.push(new THREE.Vector2(-5, 0));
	pts.push(new THREE.Vector2(5, 0));
	pts.push(new THREE.Vector2(5, 7));
	pts.push(new THREE.Vector2(8, 7));
	pts.push(new THREE.Vector2(0, 13));
	pts.push(new THREE.Vector2(-8, 7));
	pts.push(new THREE.Vector2(-5, 7));
	pts.push(new THREE.Vector2(-5, 0));

	settlement_geometry = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {amount:15,
																bevelEnabled:false
																});

	var material = new THREE.MeshLambertMaterial( { color: colorConversion(color), wireframe: false } );

	var settlement = new THREE.Mesh(settlement_geometry, material);
	settlement.position.set( x, 0, z );
	return settlement;
};

Game.prototype.drawCity = function(x,z, color){
	var pts = [];
	pts.push(new THREE.Vector2(-10, 0));
	pts.push(new THREE.Vector2(7, 0));
	pts.push(new THREE.Vector2(7, 9));
	pts.push(new THREE.Vector2(0, 9));
	pts.push(new THREE.Vector2(0, 15));
	pts.push(new THREE.Vector2(-5, 20));
	pts.push(new THREE.Vector2(-10, 15));
	pts.push(new THREE.Vector2(-10, 0));

	settlement_geometry = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {amount:15,
																bevelEnabled:false
																});

	var material = new THREE.MeshLambertMaterial( { color: colorConversion(color), wireframe: false } );

	var settlement = new THREE.Mesh(settlement_geometry, material);
	settlement.position.set( x, 0, z );
	return settlement;
};

Game.prototype.drawRobber = function(){
	var points = [];
	var neck_width;
	for ( var i = 0; i < 30; i++ ) {
		if(i<3){
			points.push(new THREE.Vector3( l/5, 0, i ) );
		}
		else if (i>=3 && i<=4){
			points.push(new THREE.Vector3( l/5 - (i-2), 0, i ) );
		}
		else if (i>=5 && i<=20){
			points.push(new THREE.Vector3( l/5 + Math.sin((i-5)/10*Math.PI), 0, i*1.2 ) );
			neck_width = l/5 + Math.sin((i-5)/10*Math.PI);
		}
		else if (i>=21 && i<30){
			points.push(new THREE.Vector3( l/5 + Math.cos((i-21)/10*Math.PI), 0, i*1.2 ) );
		}
	}

	var geometry = new THREE.LatheGeometry( points);
	var material = new THREE.MeshLambertMaterial( { color: 0x111111 } );
	var lathe = new THREE.Mesh( geometry, material );
	lathe.rotation.set(Math.PI,Math.PI/2,0);
	lathe.position.set(0,20,0);
	return lathe;
};

var Board = function(game) {
	this.game = game;
	this.resources = game.shuffle([0xFFB13D, 0xFFB13D, 0xFFB13D, 0xFFB13D, 0x996600, 0x996600, 0x996600, 0x996600, 0xE0E0E0, 0xE0E0E0, 0xE0E0E0, 0xE0E0E0, 0x3D3D3D, 0x3D3D3D, 0x3D3D3D, 0xFF0000, 0xFF0000, 0xFF0000, 0xFFFFCC]);
	this.spaces = this.drawBoard();
};


Board.prototype.drawBoard = function() {
	var spaces = [];
	geometry = new THREE.ExtrudeGeometry( hex, extrudeSettings );
	var outer_middle_distance = Math.sqrt(Math.pow(l*4,2) - Math.pow(0.5*l*4, 2));
	var obj=new Tile(0,0, 0, this.resources.pop());
	var spaces=[obj.tile];
	var num_chips=[obj.num_chip];
	var count =0;
	for ( i = 0; i < numPts*2; i++ ) {
		if(i%2===0){
			for(var j=4;j>=2;j-=2) {
				count++;
				obj = new Tile(count, i, l*j, this.resources.pop());
				spaces.push(obj.tile);
				num_chips.push(obj.num_chip);
			}
		} else {
			count++;
			obj = new Tile(count, i, outer_middle_distance, this.resources.pop());
			spaces.push(obj.tile);
			num_chips.push(obj.num_chip);
		}

	}
	return spaces;
};

var Tile = function(count, i, dist, color) {
	this.tile = this.drawTile(count, i, dist, color).tile;
};


Tile.prototype.drawTile = function(count, i, dist, color) {
	var white_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
	var colored_material = new THREE.MeshLambertMaterial( { color: color, wireframe: false } );
	var materials = new THREE.MeshFaceMaterial([white_material, colored_material]);
	var tile = new THREE.Mesh( geometry, materials );
	var a = i / numPts * Math.PI;
	tile.position.set( Math.sin(a)*dist, 0, Math.cos(a)*dist );
	tile.rotation.set(Math.PI/2, 0, 0);
	scene.add( tile );


	var num_chip = new THREE.Mesh(chip_geometry, white_material);
	num_chip.rotation.set(Math.PI/2, 0, 0);
	num_chip.position.set( Math.sin(a)*dist, 2, Math.cos(a)*dist );
	scene.add(num_chip);
	return {tile: tile, num_chip:num_chip};
};

function colorConversion(color_string){
	switch(color_string){
		case "red":
			return 0xff0000;
		case "blue":
			return 0x0000ff;
		case "white":
			return 0xffffff;
		case "orange":
			return 0xf28100;
	}
};