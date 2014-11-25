var Game = require('../engines/game-engine');

describe("Game class", function() {
	beforeEach(function(){
		small_num= 3;
		large_num= 5;
		game = new Game(small_num, large_num);
		game.addPlayer();
		game.addPlayer();
	});

	it("returns the length of the longest road on the board", function(){
		var i=0;
		game.gameBoard.constructRoad(game.players[0],[0,1], 'left');
		i++;
		game.gameBoard.constructRoad(game.players[0],[1,1], 'left');
		i++;


		game.gameBoard.placeSettlement(game.players[1],[0,0]);


		game.gameBoard.constructRoad(game.players[0],[0,0], 'left');
		i++;
		game.gameBoard.constructRoad(game.players[0],[1,0], 'vertical');
		i++;

		game.gameBoard.constructRoad(game.players[0],[3,0], 'vertical');
		expect(game.findLongestRoad()).toEqual(2);
	});

	it("finds the index of a nested array", function(){
		var arr1 = [ [0, 1], [3, 4], [1, 2] ];
		console.log(arr1.indexOf([3, 4]));
		expect(game.getNestedArrayIndex(arr1, [3, 4])).toEqual(1);
	});

	it("returns -1 if the nested array is not contained in the parent", function(){
		var arr1 = [ [0, 1], [3, 4], [1, 2] ];
		expect(game.getNestedArrayIndex(arr1, [3, 5])).toEqual(-1);
	});
});