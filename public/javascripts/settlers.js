// BOARD SETUP***********************************************************
var tile_depth = 5;
var material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );

var pts = [], numPts = 6;
var l = 30;

for ( var i = 0; i < numPts * 2; i+=2 ) {

	var a = i / numPts * Math.PI;

	pts.push( new THREE.Vector2 ( Math.cos( a ) * l, Math.sin( a ) * l ) );

}

var shape = new THREE.Shape( pts );

var material2 = new THREE.MeshLambertMaterial( { color: 0xff8000, wireframe: false } );

var materials = [ material, material2 ];

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


	var Game = function() {
		this.board = new Board(this);
	};

   Game.prototype.shuffle = function(array) {
   		console.log("test");
       for (var i = array.length - 1; i > 0; i--) {
           var j = Math.floor(Math.random() * (i + 1));
           var temp = array[i];
           array[i] = array[j];
           array[j] = temp;
       }
       return array;
   };

	var Board = function(game) {
		this.game = game;
		this.resources = game.shuffle([0xFFB13D, 0xFFB13D, 0xFFB13D, 0xFFB13D, 0x996600, 0x996600, 0x996600, 0x996600, 0xE0E0E0, 0xE0E0E0, 0xE0E0E0, 0xE0E0E0, 0x3D3D3D, 0x3D3D3D, 0x3D3D3D, 0xFF0000, 0xFF0000, 0xFF0000, 0xFFFFCC]);
		this.spaces = this.drawBoard();
	};


	Board.prototype.drawBoard = function() {
		console.log("drawBoard");
		var spaces = [];
		geometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );
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
		console.log("Tile");
		this.tile = this.drawTile(count, i, dist, color).tile;
	};


	Tile.prototype.drawTile = function(count, i, dist, color) {
		console.log("draw tile");
		var colored_material = new THREE.MeshLambertMaterial( { color: color, wireframe: false } );
		var materialshere = [material, colored_material];

		var tile = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materialshere ) );
		var a = i / numPts * Math.PI;
		tile.position.set( Math.sin(a)*dist, 0, Math.cos(a)*dist );
		tile.rotation.set(Math.PI/2, 0, 0);
		scene.add( tile );


		var num_chip = new THREE.Mesh(chip_geometry, new THREE.MeshFaceMaterial(materials));
		num_chip.rotation.set(Math.PI/2, 0, 0);
		num_chip.position.set( Math.sin(a)*dist, 2, Math.cos(a)*dist );
		scene.add(num_chip);
		return {tile: tile, num_chip:num_chip};
	};