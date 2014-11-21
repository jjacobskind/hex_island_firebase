var Game = require('../engines/game-engine');

describe("Board class", function() {
	beforeEach(function(){
		small_num= 3;
		large_num= 5;
		game = new Game(small_num, large_num);
	});

	it("should create a board that corresponds to input dimensions", function(){
		//*** This test is currently breaking on larger dimensions than (3, 5) 
			// because the array of tiles to be distributed is not dynamic and runs out
		var dimensions=[];
		var k=0;
		for(var i=0, len=game.gameBoard.boardTiles.length;i<len; i++){
			if(i<len/2){
				expect(game.gameBoard.boardTiles[i].length).toEqual(i+small_num);
			}
			else {
				k+=2;	//Needed since row lengths shrink after halfway point
				expect(game.gameBoard.boardTiles[i].length).toEqual(i+small_num-k);
			}
		}
		expect(game.gameBoard.boardTiles.length).toEqual((large_num-small_num)*2+1);
	});


	it("should list each tile first in the adjacent_tiles array on its top vertex", function(){
		for(var row=0, num_rows=game.gameBoard.boardTiles.length; row<num_rows;row++){
			for(var col=0, num_cols=game.gameBoard.boardTiles[row].length; col<num_cols; col++){
				if(row<num_rows/2){
					expect(game.gameBoard.boardVertices[row*2][col].adjacent_tiles[0]).toEqual(game.gameBoard.boardTiles[row][col]);
				}
				else {
					expect(game.gameBoard.boardVertices[row*2][col+1].adjacent_tiles[0]).toEqual(game.gameBoard.boardTiles[row][col]);
				}
			}
		}
	});

	it("should attribute resource tiles to adjacent vertices", function() {
		var num_rows= game.gameBoard.boardTiles.length;

		for(var count=0;count<=200;count++){

			// Get a row from vertices array that contains the top vertices of tiles
				// (all even-numbered rows except the last two)
			var control_row = Math.floor(Math.random()*num_rows)*2;
			var num_vertex_rows = game.gameBoard.boardVertices.length;

			// Pick a random vertex in that row, as long as that vertex is the top of a resource tile
			if(control_row<num_vertex_rows/2){
				var control_col = Math.floor(Math.random()*game.gameBoard.boardVertices[control_row].length);
			} else {
				control_col = Math.ceil(Math.random()*(game.gameBoard.boardVertices[control_row].length-2));
			}

			// This tile spans three additional rows. Pick one of those rows
			var test_row = Math.ceil(Math.random()*3) + control_row;

			// If one of the two middle rows is picked, select one of the two vertices at random
			if(test_row-control_row<3){
				if(control_row<num_vertex_rows/2){
					var test_col = control_col + Math.round(Math.random());
				} else {
					test_col = control_col - Math.round(Math.random());
				}
			}
			else {
				if(control_row===(num_vertex_rows/2)-2){
					test_col = control_col;
				}
				else if(control_row<num_vertex_rows/2){
					test_col = control_col+1;
				} else {
					test_col = control_col-1;
				}
			}
			// console.log("Control: ", control_row, control_col);
			// console.log("Test: ", test_row, test_col);
			// console.log(control_row, control_col, game.gameBoard.boardVertices[control_row][control_col].adjacent_tiles[0]);
			// console.log("---------------");
			// console.log(test_row, test_col, game.gameBoard.boardVertices[test_row][test_col].adjacent_tiles);
			expect(game.gameBoard.boardVertices[test_row][test_col].adjacent_tiles.indexOf(game.gameBoard.boardVertices[control_row][control_col].adjacent_tiles[0])).toNotEqual(-1);
		}
	});
});