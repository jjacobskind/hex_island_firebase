// BOARD SETUP***********************************************************
var tile_depth = 5;

var border_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
var tile_material = new THREE.MeshLambertMaterial( { color: 0xff8000, wireframe: false } );
var materials = [ border_material, tile_material ];

var Game = function(scene, small_num, big_num, scale) {
	this.scene = scene;
	// if(typeof small_num !== number){
	// 	small_num = 3;
	// }
	// if(typeof small_num !== number){
	// 	big_num = 5;
	// }
	this.board = new Board(this, small_num, big_num, scale);

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


var Board = function(game, small_num, big_num, scale) {
	this.game = game;
	this.boardVertices = this.createVertices(small_num, big_num);
	console.log(this.boardVertices);
	this.small_num = small_num;
	this.big_num = big_num;
	if(!!scale){
		this.scale = scale;
	} else {
		this.scale = 1;
	}
	this.building_depth = 15 * this.scale;
	this.side_length = 30 * this.scale;

	// Create shape for hex tile geometry
	var pts = [], numPts = 6;
	for ( var i = 0; i < numPts * 2; i+=2 ) {
		var a = i / numPts * Math.PI;
		pts.push( new THREE.Vector2 ( Math.cos( a ) * this.side_length, Math.sin( a ) * this.side_length ) );
	}
	var hex = new THREE.Shape( pts );

	// Set extrude settings to be applied to hex tile shape
	this.extrudeSettings = {
		amount			: tile_depth,
		steps			: 1,
		material		: 1,
		extrudeMaterial : 0,
		bevelEnabled	: true,
		bevelThickness  : this.scale,
		bevelSize       : 4 * this.scale,
		bevelSegments   : 1,
	};
	this.tile_geometry = new THREE.ExtrudeGeometry( hex, this.extrudeSettings );

	// Create geometry for number chits
	var circlePts = [];
	var numCirclePts = 32
	for(i=0;i<numCirclePts*2;i++){
		var a = i/numCirclePts * Math.PI;
		circlePts.push(new THREE.Vector2(Math.cos(a)* this.side_length / 4, Math.sin(a)* this.side_length /4));
	}

	this.chip_shape = new THREE.Shape(circlePts);

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
	this.tiles = this.drawBoard();
};

Board.prototype.createVertices = function(small_num, large_num, board) {
    if(!board) {
        board = [];
        large_num++;
        var first_or_last = true;
    }

    if(small_num>large_num){
        return board;
    }
    board.push(this.createRow(small_num));

    if(!first_or_last && (small_num!==large_num)){
        board.push(this.createRow(small_num));
    }

    board = this.createVertices(small_num+1, large_num, board);
    board.push(this.createRow(small_num));
    if(!first_or_last  && (small_num!==large_num)){
        board.push(this.createRow(small_num));
    }
    this.gameIsInitialized = true;
    return board;

};

Board.prototype.createRow = function(num_elements) {
    var row = [];
    for(var i=0; i<num_elements;i++) {
        row.push({
            building:null,
            port: null
        });
    }
    return row;
};


Board.prototype.drawBoard = function() {
	var small_num = this.small_num;
	var big_num = this.big_num;
	var num_rows = (2*(big_num-small_num)) + 1;
	var outer_middle_distance = Math.sqrt(Math.pow(this.side_length*4,2) - Math.pow(0.5*this.side_length*4, 2));
	var count =0;
	var iterator=0;
	var tiles = [];
	for(var row=0; row<num_rows;row++){
		var tile_row = [];
		var num_cols = small_num + iterator;
		if(row<Math.floor(num_rows/2)){
			iterator++;
		} else {
			iterator--;
		}


		for(var col=0;col<num_cols; col++){
			var coordinates = this.indicesToCoordinates([row, col]);
			var obj=new Tile(this, coordinates, this.resources.pop());
			this.game.scene.add(obj.tile);
			this.game.scene.add(obj.chit);
			tile_row.push(obj);
		}
		tiles.push(tile_row);
	}
	return tiles;
};

Board.prototype.indicesToCoordinates = function(indices){
	var small_num = this.small_num;
	var big_num = this.big_num;
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
	half_col-=0.5;
	x_pos=(col-half_col) * this.side_length * 2;
	var z_pos = (row-middle_row) * this.side_length * 2;
	z_pos-=(row-middle_row)*10*this.scale;
	return [x_pos, z_pos];
};

Board.prototype.coordinatesToVertices = function(coordinates){
	var small_num = this.small_num;
	var big_num = this.big_num;
	var num_rows = (4*(big_num-small_num)) + 4;
	var x = coordinates[0];
	var z = coordinates[1];

	var side_length = this.side_length + this.extrudeSettings.bevelSize;
	var half_length = side_length/2;
	var short_distance = side_length * Math.cos(Math.PI/3);
	
	// Calculate row
	var remainder = Math.abs(z) - short_distance;

	var intervals = [short_distance, side_length];
	var i=0;
	while(remainder>=-10){
		remainder-= intervals[i%2];
		i++;
	}
	if(z!==Math.abs(z)){
		z_index = (num_rows/2) + i -1;
	} else {
		z_index = (num_rows/2) - i;
	}

	if(z_index<0 || z_index>num_rows){
		return -1;
	}

	// Calculate column
	var middle_radius = (side_length * Math.sin(Math.PI/3));
	var x_index = Math.round(x/middle_radius);

	if(z_index===0 || z_index===num_rows-1){
		var num_cols= small_num;
	}
	else if(z_index===num_rows/2 || z_index===(num_rows/2)-1){
		num_cols = big_num+1;
	} else if(z_index<=num_rows/2) {
		num_cols = Math.ceil(z_index/2)+small_num;
	} else {
		num_cols = Math.floor((num_rows-z_index)/2) + small_num;
	}
	var half_col = num_cols/2;
	var col = Math.floor(half_col + (x_index/2));
	
	if(col<0 || col>num_cols){
		return -1;
	}
	return [z_index, col];
};

Board.prototype.verticesToCoordinates = function(location){
	var z = location[0];
	var x = location[1];
	var small_num = this.small_num;
	var big_num = this.big_num;
	var num_rows = (4*(big_num-small_num)) + 4;

	// Calculate x-coordinate of vertex
	var side_length = this.side_length + this.extrudeSettings.bevelSize;
	if(z===0 || z===num_rows-1){
		var num_cols = small_num;
		var offset = num_cols-1;
	}
	else if(z===num_rows/2 || z===(num_rows/2)-1){
		num_cols = big_num+1;
		offset = big_num;
	} else if(z<=num_rows/2) {
		num_cols = Math.ceil(z/2)+small_num;
	} else {
		num_cols = Math.floor((num_rows-z)/2) + small_num;
	}

	if(!offset){
		offset = Math.ceil(num_cols/2) + 1;
	}
	var middle_radius = (side_length * Math.sin(Math.PI/3));
	var left_edge = middle_radius*offset;
	var x_coord = left_edge - (middle_radius * x * 2);

	// Calculate z-coordinate of vertex
	var short_distance = side_length * Math.cos(Math.PI/3);
	var temp_row = (num_rows-1)/2;
	if(z>temp_row){
		var direction = -1;
	} else {
		direction = 1;
	}
	
	//Board coordinates drop as row gets higher, so z_offset and temp_row need to iterate in opposite directions
	var z_offset = side_length*0.5*direction;
	temp_row -= 0.5 * direction;

	var intervals = [short_distance, side_length];
	var i=0;


	while(temp_row!==z){
		temp_row-=direction;
		z_offset += direction * intervals[i%2];
		i++;
	}

	return [x_coord, z_offset];
};

Board.prototype.buildRoad = function(location1, location2){
	var edge = 5 * this.scale;
	var depth = this.side_length*0.7;
	var pts = [new THREE.Vector2(0, 0)];
	pts.push(new THREE.Vector2(edge/2, 0));
	pts.push(new THREE.Vector2(edge/2, edge));
	pts.push(new THREE.Vector2(edge/-2, edge));
	pts.push(new THREE.Vector2(edge/-2, 0));
	pts.push(new THREE.Vector2(0, 0));
	var shape = new THREE.Shape(pts);
	var geometry = new THREE.ExtrudeGeometry(shape,{amount:depth, bevelEnabled:false});
	var road = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: 0xbb0000, wireframe:false}));
	var coords1 = this.verticesToCoordinates(location1);
	var coords2 = this.verticesToCoordinates(location2);

	// Set road angle
	var x_diff = coords2[0] - coords1[0];
	var angle = Math.asin(x_diff/(this.side_length + this.extrudeSettings.bevelSize));
	road.rotation.set(0, angle, 0);

	// Set road position
	var x_avg = (coords1[0] + coords2[0])/2;
	var x_offset = (Math.sin(angle)*depth)/2;
	var z_avg = (coords1[1] + coords2[1])/2;
	var z_offset = Math.cos(angle)*depth/2;
	road.position.set(x_avg - x_offset,0,z_avg - z_offset);

	return road;
};

var Tile = function(board, coordinates, color) {
	this.board = board;
	this.tile = this.drawTile(coordinates, color);
	this.chit = this.drawChit(coordinates, color);
};


Tile.prototype.drawTile = function(coordinates, color) {
	var white_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
	var colored_material = new THREE.MeshLambertMaterial( { color: color, wireframe: false } );
	var materials = new THREE.MeshFaceMaterial([white_material, colored_material]);
	var tile = new THREE.Mesh( this.board.tile_geometry, materials );
	tile.position.set( coordinates[0], 0, coordinates[1] );
	tile.rotation.set(Math.PI/2, 0, Math.PI/6);
	return tile;
};

Tile.prototype.drawChit = function(coordinates, color) {
	var white_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false} );

	var texture = new THREE.ImageUtils.loadTexture( 'assets/images/6.jpg' );
	texture.repeat.x = 3/this.board.side_length;
	texture.repeat.y = 3/this.board.side_length;
	texture.offset.x = (this.board.side_length/6) * texture.repeat.x;
	texture.offset.y = (this.board.side_length/6) * texture.repeat.y;

	var number_material = new THREE.MeshLambertMaterial({map: texture});
	var materials = [number_material, white_material];

	var chip_geometry = new THREE.ExtrudeGeometry(this.board.chip_shape, {amount:1, bevelEnabled:false});

	
	for(var i=0; i<252; i++){
		if(i===62){
			i=124;
		}
		chip_geometry.faces[i].materialIndex = 1;
	}

	var num_chip = new THREE.Mesh(chip_geometry, new THREE.MeshFaceMaterial(materials));
	num_chip.position.set(coordinates[0], 0.5, coordinates[1]);
	num_chip.rotation.set(Math.PI/2, Math.PI, 0);

	return num_chip;
};

var Building = function(board, building_type, x, z, color){
	this.board = board;
	this.x = x;
	this.z = z;
	this.color = color;
	this.building = null;

	switch(building_type){
		case "settlement":
			this.settlementShape();
			break;
		case "city":	
			this.cityShape();
			break;
		default:
			throw ("Invalid building type!");
			break;
	}
};

Building.prototype.settlementShape = function() {
	var scale = this.board.scale;
	var pts = [];
	pts.push(new THREE.Vector2(-5 * scale, 0));
	pts.push(new THREE.Vector2(5 * scale, 0));
	pts.push(new THREE.Vector2(5 * scale, 7 * scale));
	pts.push(new THREE.Vector2(8 * scale, 7 * scale));
	pts.push(new THREE.Vector2(0, 13 * scale));
	pts.push(new THREE.Vector2(-8 * scale, 7 * scale));
	pts.push(new THREE.Vector2(-5 * scale, 7 * scale));
	pts.push(new THREE.Vector2(-5 * scale, 0));

	var shape = new THREE.Shape(pts);
	var geometry = this.makeGeometry(shape);
	this.building = geometry;
};

Building.prototype.cityShape = function(){
	var scale = this.board.scale;
	var pts = [];
	pts.push(new THREE.Vector2(-10 * scale, 0));
	pts.push(new THREE.Vector2(7 * scale, 0));
	pts.push(new THREE.Vector2(7 * scale, 9 * scale));
	pts.push(new THREE.Vector2(0, 9 * scale));
	pts.push(new THREE.Vector2(0, 15 * scale));
	pts.push(new THREE.Vector2(-5 * scale, 20 * scale));
	pts.push(new THREE.Vector2(-10 * scale, 15 * scale));
	pts.push(new THREE.Vector2(-10 * scale, 0));

	var shape = new THREE.Shape(pts);
	var geometry = this.makeGeometry(shape);
	this.building = geometry;
};

Building.prototype.makeGeometry = function(shape){
	var building_geometry = new THREE.ExtrudeGeometry(shape, {amount:this.board.building_depth,
																bevelEnabled:false
																});

	var material = new THREE.MeshLambertMaterial( { color: colorConversion(this.color), wireframe: false } );

	var building = new THREE.Mesh(building_geometry, material);
	building.position.set( this.x, 0, this.z );
	building.rotation.set(0, (Math.PI/6)*Math.floor(Math.random()*6), 0);
	return building;
};

Board.prototype.drawRobber = function(){
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