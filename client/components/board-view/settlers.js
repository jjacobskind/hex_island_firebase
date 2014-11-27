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
var Game = function(scene, small_num, big_num) {
	this.scene = scene;
	// if(typeof small_num !== number){
	// 	small_num = 3;
	// }
	// if(typeof small_num !== number){
	// 	big_num = 5;
	// }
	this.board = new Board(this, small_num, big_num);

	// this.scene.add(this.drawSettlement(30, 0, "blue"));
	// this.scene.add(this.drawCity(-30,0, "red"));
	// this.scene.add(this.drawRobber());
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

var Board = function(game, small_num, big_num) {
	this.game = game;
	var src_arr = [0xFFB13D, 0xFFB13D, 0xFFB13D, 0xFFB13D, 0x996600, 0x996600, 0x996600, 0x996600, 0xE0E0E0, 0xE0E0E0, 0xE0E0E0, 0xE0E0E0, 0x3D3D3D, 0x3D3D3D, 0x3D3D3D, 0xFF0000, 0xFF0000, 0xFF0000, 0xFFFFCC];
	var sum=0;
	var iterator = 1;
	for(var i=small_num;i>=small_num;i+=iterator){
		sum+=i;
		if(i===big_num){
			iterator=-1;
		}
	}
	while(src_arr.length<sum){
		src_arr = src_arr.concat(src_arr);
	}
	this.resources = game.shuffle(src_arr);
	this.spaces = this.drawBoard(small_num, big_num);
};


Board.prototype.drawBoard = function(small_num, big_num) {
	var num_rows = (2*(big_num-small_num)) + 1;
	var outer_middle_distance = Math.sqrt(Math.pow(l*4,2) - Math.pow(0.5*l*4, 2));
	var count =0;
	var iterator=0;
	for(var row=0; row<num_rows;row++){
		var num_cols = small_num + iterator;
		if(row<Math.floor(num_rows/2)){
			iterator++;
		} else {
			iterator--;
		}


		for(var col=0;col<num_cols; col++){
			var coordinates = this.indicesToCoordinates(small_num, big_num, [row, col]);
			var obj=new Tile(this, coordinates, this.resources.pop());
			this.game.scene.add(obj.tile);
			this.game.scene.add(obj.chit);
		}
	}
};

Board.prototype.indicesToCoordinates = function(small_num, big_num, indices){
	var num_rows = (2*(big_num-small_num)) + 1;
	var row = indices[0];
	var col = indices[1];
	var middle_row = Math.floor(num_rows/2);
	var x_pos = 0;
	if(row!==middle_row){
		if(row<=middle_row){
			var half_col = (small_num+(row%middle_row))/2;
		}else if(row===num_rows-1){
			half_col = small_num/2;
		} else {
			half_col = (big_num-(row%middle_row))/2;
		}
	} else {
		half_col = big_num/2;
	}
	if(big_num%2===1){
		x_pos=(col-half_col)*l*2;
	} else {
		x_pos=(col-half_col+0.5)*l*2;
	}
	var z_pos = (row-middle_row) * l * 2;
	z_pos-=(row-middle_row)*10;
	return [x_pos,z_pos];
};

Board.prototype.coordinatesToIndices = function(coordinates){
	var x = coordinates[0];
	var z = coordinates[1];
	var indices;


	return indices;
};

var Tile = function(board, coordinates, color) {
	this.board = board;
	this.tile = this.drawTile(coordinates, color);
	this.chit = this.drawChit(coordinates, color);
};


Tile.prototype.drawTile = function(coordinates, color) {
	var tile_geometry = new THREE.ExtrudeGeometry( hex, extrudeSettings );
	var scene = this.board.game.scene;
	var white_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
	var colored_material = new THREE.MeshLambertMaterial( { color: color, wireframe: false } );
	var materials = new THREE.MeshFaceMaterial([white_material, colored_material]);
	var tile = new THREE.Mesh( tile_geometry, materials );

	tile.position.set( coordinates[0], 0, coordinates[1] );
	tile.rotation.set(Math.PI/2, 0, Math.PI/6);
	return tile;
};

Tile.prototype.drawChit = function(coordinates, color) {
	var white_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
	var num_chip = new THREE.Mesh(chip_geometry, white_material);
	num_chip.rotation.set(Math.PI/2, 0, 0);
	num_chip.position.set( coordinates[0], 2, coordinates[1] );
	return num_chip;
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