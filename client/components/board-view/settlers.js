// BOARD SETUP***********************************************************
var tile_depth = 5;

var border_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
var tile_material = new THREE.MeshLambertMaterial( { color: 0xff8000, wireframe: false } );
var materials = [ border_material, tile_material ];

var Game = function(scene, game, scale) {
	this.scene = scene;

	this.board = new Board(this, game.gameBoard.getRoadDestination, game.gameBoard.boardVertices, game.gameBoard.boardTiles, scale);

};

var Board = function(game, getRoadDestination, vertices, tiles, scale) {
	this.game = game;
	this.boardVertices=vertices; 
	this.robbers = [];
	this.small_num = tiles[0].length;
	this.big_num = tiles[Math.floor(tiles.length/2)].length;
	this.getRoadDestination = getRoadDestination;
	if(!!scale && scale>10) {
		this.scale=10;
	} 
	else if(!!scale){
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

	this.tiles = this.drawBoard(tiles);
	this.populateBoard(getRoadDestination, tiles);
};

Board.prototype.drawBoard = function(tiles) {
	var outer_middle_distance = Math.sqrt(Math.pow(this.side_length*4,2) - Math.pow(0.5*this.side_length*4, 2));
	var count =0;
	var board_tiles = [];
	for(var row=0, num_rows=tiles.length; row<num_rows;row++){
		var board_tile_row = [];

		for(var col=0, num_cols=tiles[row].length;col<num_cols; col++){
			var coordinates = this.indicesToCoordinates([row, col]);
			var obj=new Tile(this, coordinates, tiles[row][col].resource, tiles[row][col].chit);
			this.game.scene.add(obj.tile);
			if(!!obj.chit){
				this.game.scene.add(obj.chit);
			}
			board_tile_row.push(obj);
		}
		board_tiles.push(board_tile_row);
	}

	// DRAW PORTS

	// compile array of all outer vertices
	var outer_vertices = [];
	var cur_vertex = [0,0];
	while(!!cur_vertex){
		outer_vertices.push(cur_vertex);
		cur_vertex = this.getRoadDestination(cur_vertex, "right");
	}
	var left_vertices =[];
	num_rows = this.boardVertices.length;
	for(row=2;row<num_rows;row++){
		col = this.boardVertices[row].length-1;
		outer_vertices.push([row, col]);
		left_vertices.push([row, 0]);
	}
	left_vertices.pop();
	left_vertices = left_vertices.reverse();
	cur_vertex = [--row, col];
	outer_vertices.pop();

	while(!!cur_vertex){
		outer_vertices.push(cur_vertex);
		cur_vertex = this.getRoadDestination(cur_vertex, "left");
	}
	outer_vertices.pop();
	outer_vertices = outer_vertices.concat(left_vertices);
	outer_vertices.push([1, 0]);

	for(i=0, len=outer_vertices.length; i<len; i++) {
		var row=outer_vertices[i][0], col = outer_vertices[i][1];
		if(i<len-1){
			var row_next= outer_vertices[i+1][0], col_next= outer_vertices[i+1][1];
		}
		if(!!this.boardVertices[row][col].port && (i===0 || i===len-1 || !!this.boardVertices[row_next][col_next].port)) {
			if(!this.boardVertices[row_next][col_next].port){
				this.drawPort(outer_vertices[i], undefined);
			} else {
				this.drawPort(outer_vertices[i], outer_vertices[++i]);
			}
		}
	}
	return board_tiles;
};

Board.prototype.drawPort = function(location1, location2){
	var side_length=this.side_length;
	if(!!location1 && !!location2){
		var coords1 = this.verticesToCoordinates(location1);
		var coords2 = this.verticesToCoordinates(location2);
	} else if(location1!==[1, 0]) {
		coords1 = this.verticesToCoordinates([1, 0]);
		coords2 = this.verticesToCoordinates([0, 0]);
	}
	var x_avg = (coords1[0] + coords2[0])/2;
	var z_avg = (coords1[1] + coords2[1])/2;

	var white_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false} );
	var port_geometry = new THREE.ExtrudeGeometry(this.chip_shape, {amount:5, bevelEnabled:false});
	var port = new THREE.Mesh(port_geometry, white_material);
	if(coords1[0]===coords2[0]){
		if(location1[1]===0){
			x_avg+=side_length/2;
		} else {
			x_avg-=side_length/2;
		}
	} else {
		var abs_max_x = Math.max(Math.abs(coords1[0]), Math.abs(coords2[0]));
		var abs_min_x = Math.min(Math.abs(coords1[0]), Math.abs(coords2[0]));
		if(coords1[0]<0){
			abs_max_x*=-1;
			abs_min_x*=-1;
		}
		x_avg = (abs_max_x + (abs_min_x*2))/3;

		var abs_max_z = Math.max(Math.abs(coords1[1]), Math.abs(coords2[1]));
		var abs_min_z = Math.min(Math.abs(coords1[1]), Math.abs(coords2[1]));
		if(coords1[1]<0){
			abs_max_z*=-1;
			abs_min_z*=-1;
		}
		z_avg = ((abs_max_z*3) + abs_min_z)/4;
		z_avg*=1.05
	}
	port.position.set(x_avg, 1, z_avg);
	port.rotation.set(Math.PI/2, 0, 0);
	this.game.scene.add(port);
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
	return [-x_pos, -z_pos];
};

// Board.prototype.coordinatesToIndices = function(coordinates) {
// 	var x=coordinates[0], z=coordinates[1];
// 	var small_num = this.small_num;
// 	var big_num = this.big_num;
// 	var num_rows = (big_num-small_num)*2 +1;
	
// };

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


	while(temp_row!==z && z !== undefined){
		temp_row-=direction;
		z_offset += direction * intervals[i%2];
		i++;
	}
	return [x_coord, z_offset];
};

Board.prototype.buildRoad = function(playerID, location1, location2){
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
	var road = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({color: this.playerColor(playerID), wireframe:false}));
	var coords1 = this.verticesToCoordinates(location1);
	var coords2 = this.verticesToCoordinates(location2);

	// Set road angle
	if(coords1[0]<coords2[0]) {		//If road is going left
		if(location1[0] % 2 === 0){		//If row # is even
			var angle = Math.PI * 2 /3;
		} else {
			angle = Math.PI /3;
		}
	}
	else if(coords1[0]>coords2[0]) {	//If road is going right
		if(location1[0] % 2 === 0){
			angle = Math.PI /3;
		} else {
			angle = Math.PI * 2 /3;
		}
	} else {							//If road is vertical
		angle = 0;
	}
	road.rotation.set(0, angle, 0);

	// Set road position
	var x_avg = (coords1[0] + coords2[0])/2;
	var x_offset = (Math.sin(angle)*depth)/2;
	var z_avg = (coords1[1] + coords2[1])/2;
	var z_offset = Math.cos(angle)*depth/2;
	road.position.set(x_avg - x_offset,0,z_avg - z_offset);
	this.game.scene.add(road);

	return road;
};

//Draws roads and buildings on board for game in progress
Board.prototype.populateBoard = function(getRoadDestination, tiles) {
	var vertices=[];
	for(var row=0, num_rows=this.boardVertices.length; row < num_rows; row++) {
		var vertices_row=[];
		for(var col=0, num_cols=this.boardVertices[row].length; col < num_cols; col++){
			var obj = {};
			var settlement_or_city = this.boardVertices[row][col].hasSettlementOrCity;
			var owner = this.boardVertices[row][col].owner
			if(!!settlement_or_city){
				obj.building = new Building(this, settlement_or_city, owner, [row, col]);
				this.game.scene.add(obj.building.building);
			}
			for(var key in this.boardVertices[row][col].connections){
				if(this.boardVertices[row][col].connections[key] !== null){
					obj[key] = this.boardVertices[row][col].connections[key];
					var destination = getRoadDestination.call(this, [row, col], key);
					if(!!destination && (row<destination[0] || col<destination[1])){
						obj.connections = {};
						owner = this.boardVertices[row][col].connections[key];
						obj.connections[key] = this.buildRoad(owner, [row, col], destination);
						this.game.scene.add(obj.connections[key]);
					}
				}
			}

			if(!!tiles[row] && !!tiles[row][col] && tiles[row][col].robber === true){
				this.drawRobber([row, col]);
			}
			vertices_row.push(obj);
		}
		vertices.push(vertices_row);
	}
	this.boardVertices = vertices;
};

// Returns color associated with this player
Board.prototype.playerColor = function(playerID){
	switch(playerID) {
		case 0:
			return 0xff0000;
		case 1:
			return 0x0000ff;
		case 2:
			return 0xffffff;
		case 3:
			return 0xf28100;
	}
};

var Tile = function(board, coordinates, resource, number) {
	this.board = board;
	this.tile = this.drawTile(coordinates, resource);
	if(resource!=="desert"){
		this.chit = this.drawChit(coordinates, number);
	}
};


Tile.prototype.drawTile = function(coordinates, resource) {
	var white_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false } );
	var colored_material = new THREE.MeshLambertMaterial( { color: this.paintResource(resource), wireframe: false } );
	var materials = new THREE.MeshFaceMaterial([white_material, colored_material]);
	var tile = new THREE.Mesh( this.board.tile_geometry, materials );
	tile.position.set( coordinates[0], 0, coordinates[1] );
	tile.rotation.set(Math.PI/2, 0, Math.PI/6);
	return tile;
};

Tile.prototype.drawChit = function(coordinates, chit_number) {
	var white_material = new THREE.MeshLambertMaterial( { color: 0xffffff, wireframe: false} );

	var texture = new THREE.ImageUtils.loadTexture( 'assets/images/' + chit_number + '.jpg' );
	texture.repeat.x = 3/this.board.side_length;
	texture.repeat.y = 3/this.board.side_length;
	texture.offset.x = (this.board.side_length/6) * texture.repeat.x;
	texture.offset.y = (this.board.side_length/6) * texture.repeat.y;

	var number_material = new THREE.MeshLambertMaterial({map: texture});
	var materials = [number_material, white_material];

	var chip_geometry = new THREE.ExtrudeGeometry(this.board.chip_shape, {amount:1, bevelEnabled:false});

	// Applies white_material to all faces other than those facing upwards
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

// Returns tile texture based on the resource passed into it
Tile.prototype.paintResource = function(resource){
	switch(resource){
		case "desert":
			return 0xFFFFCC;
		case "ore":
			return 0x3D3D3D;
		case "lumber":
			return 0x996600;
		case "wool":
			return 0xE0E0E0;
		case "brick":
			return 0xFF0000;
		case "grain":
			return 0xFFB13D;
	}
};

var Building = function(board, building_type, owner, location){
	this.board = board;
	var coords = this.board.verticesToCoordinates(location);
	this.x = coords[0];
	this.z = coords[1];
	this.color = this.board.playerColor(owner);
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
	var depth = this.board.building_depth;
	var building_geometry = new THREE.ExtrudeGeometry(shape, {amount:depth,
																bevelEnabled:false
																});

	var material = new THREE.MeshLambertMaterial( { color: this.color, wireframe: false } );

	var building = new THREE.Mesh(building_geometry, material);
	var rotation_angle = (Math.PI/6)*Math.floor(Math.random()*6);
	building.position.set( this.x, 0, this.z - (depth/2) );
	// building.rotation.set(0, rotation_angle, 0);
	return building;
};

Board.prototype.drawRobber = function(location){
	var points = [];
	var prev_width;
	var side_length = this.side_length;
	points_length = 35;
	for ( var i = 0; i < points_length; i++ ) {
		if(i<3){
			points.push(new THREE.Vector3( side_length/5, 0, i ) );
		}
		else if (i>=3 && i<=4){
			points.push(new THREE.Vector3( side_length/5 - (i-2), 0, i ) );
		}
		else if (i>=5 && i<=20){
			points.push(new THREE.Vector3( side_length/5 + Math.sin((i-5)/10*Math.PI), 0, i*1.2 ) );
		}
		else if (i>=21 && i<30){
			points.push(new THREE.Vector3( side_length/5 + Math.cos((i-21)/10*Math.PI), 0, i*1.2 ) );
			prev_width = side_length/5 + Math.cos((i-21)/10*Math.PI);
		}
		else if(i>=31 && i<points_length){
			var percent = (i-30)/(points_length-30);
			points.push(new THREE.Vector3(prev_width-(prev_width*Math.sin(percent*Math.PI/2)), 0, i));
		}
	}
	points.push(new THREE.Vector3(0, 0, i));

	var geometry = new THREE.LatheGeometry( points);
	var material = new THREE.MeshLambertMaterial( { color: 0x111111 } );
	var robber = new THREE.Mesh( geometry, material );
	var coords = this.indicesToCoordinates(location);
	robber.rotation.set(Math.PI/-2,0,0);
	robber.position.set(coords[0],0,coords[1]);
	this.game.scene.add(robber);
	this.robbers.push(robber);

};

Board.prototype.getTile = function(coords, cb){
	var x=-coords[0], z=coords[1];
	var side_length = this.side_length + this.extrudeSettings.bevelSize;
	for(var row=0, num_rows=this.tiles.length; row<num_rows; row++){
		for(var col=0, num_cols=this.tiles[row].length; col<num_cols; col++){
			var tile_center = this.indicesToCoordinates([row, col]);
			var dist_from_tip = side_length - Math.abs(tile_center[1]-z);
			if(dist_from_tip<side_length){		//Checking if z coordinate is within the highest/lowest tip of tile
				var dist_from_center = Math.abs(tile_center[0]-x);

				// Set meximum x offset portion of tile can have from its center for a given vertical coordinate
				var horizontal_range = Math.tan(Math.PI/6) * dist_from_tip;

				// Limit horizontal range for the center "rectangle" portion of tile
				if(horizontal_range> side_length*Math.sin(Math.PI/6)) {
					horizontal_range = side_length*Math.sin(Math.PI/6);
				}

				if(dist_from_center < horizontal_range*2){
					cb([row, col]);
					return null;
				}
			}
		}
	}
	return null;
};

Board.prototype.getVertex = function(coords, cb){
	var x=-coords[0], z=coords[1];
	var radius = 15 * this.scale;
	for(var row=0, num_rows=this.boardVertices.length; row<num_rows; row++){
		for(var col=0, num_cols=this.boardVertices[row].length; col<num_cols; col++){
			var vertex_coords = this.verticesToCoordinates([row, col]);
			var x_diff = vertex_coords[0]-x;
			var z_diff = vertex_coords[1]-z;
			var distance_from_vertex = Math.sqrt(Math.pow(x_diff, 2) + Math.pow(z_diff, 2));
			if(distance_from_vertex<radius){
				cb([row, col]);
				return null;
			}
		}
	}
	return null;
};

Board.prototype.getRoad = function(coords, cb){
	var x=-coords[0], z=coords[1];
	var bevel_width = this.extrudeSettings.bevelSize;
	var road_width = bevel_width * 2;
	var road_length = this.side_length + (this.extrudeSettings.bevelSize*2);
	var vertex1, vertex2;
	for(var row=0, num_rows=this.boardVertices.length; !vertex1 && row<num_rows; row++){
		for(var col=0, num_cols=this.boardVertices[row].length; !vertex1 && col<num_cols; col++){
			var vertex_coords = this.verticesToCoordinates([row, col]);
			var x_diff = vertex_coords[0]-x;
			var z_diff = vertex_coords[1]-z;
			var distance_from_vertex = Math.sqrt(Math.pow(x_diff, 2) + Math.pow(z_diff, 2));
			if(distance_from_vertex<road_length){
				vertex1 = [row, col];

			}
		}
	}

	if(!vertex1){
		return null;
	}

	// Determine whether the vertical road was clicked
	vertex2 = this.getRoadDestination(vertex1, "vertical");
	var coords1 = this.verticesToCoordinates(vertex1);
	if(!!vertex2){ 
		var coords2 = this.verticesToCoordinates(vertex2);
		if(x<=(coords1[0] + bevel_width) && x>=(coords1[0] - bevel_width) 		//checking if x click coordinate lies within road width
		&& (z<=coords1[1] && z>=coords2[1]))	{							//vertex1 z-coordinate will always be higher than vertex2 due to top-down iteration through vertices
			cb(vertex1, "vertical");
		}
	}

	// Vertical road wasn't clicked, so rule out the left or right road based on x-coordinates
	var adjacent_vertices = [this.getRoadDestination(vertex1, "left")];
	adjacent_vertices.push(this.getRoadDestination(vertex1, "right"));
	var count = 2;
	while(adjacent_vertices.length){
		count--;
		var temp_vertex = adjacent_vertices.pop();
		coords2 = this.verticesToCoordinates(temp_vertex);
		if(x>= Math.min(coords1[0], coords2[0]) && x<= Math.max(coords1[0], coords2[0])){
			vertex2 = temp_vertex;
			break;
		}
	}


	// Since vertex 1 always has higher z than vertex2, find how far click-x is from vertex1-x, 
	// calculate z-offset for center of road at that x-offset, and subtract from vertex-z
	x_diff = Math.abs(coords1[0] - x);
	bevel_width*=1.5; //factoring in extra wiggle room for clicking
	var road_vertical_center = coords1[1] - (Math.tan(Math.PI/6) * x_diff);
	if(z>=road_vertical_center - bevel_width && z<=road_vertical_center + bevel_width){
		switch(count){
			case 1:
				var direction = "right";
				break;
			case 0:
				direction = "left";
		}
		cb(vertex1, direction);
	}

};

// Function to move the robber
// Refactor this later on to provide for multiple robbers,using a two-click process to select the correct robber and select the destination
Board.prototype.moveRobber = function(destination){
	var tile_center = this.indicesToCoordinates(destination);
	if(this.robbers.length===1){
		this.robbers[0].position.set(tile_center[0], 0, tile_center[1]);
	}
	return null;
};