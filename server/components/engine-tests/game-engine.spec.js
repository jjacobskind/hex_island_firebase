var Game = require('../engines/game-engine');

describe("Game class", function() {
	beforeEach(function(){
		small_num= 3;
		large_num= 5;
		game = new Game(small_num, large_num);
		game.addPlayer();
		game.addPlayer();
		game.players[0].resources['grain'] = 5;
		game.players[0].resources['lumber'] = 1;
		game.players[0].resources['wool'] = 4;
	});

	it("returns the length of the longest road on the board", function(){
		var i=0;
		game.gameBoard.constructRoad(game.players[0],[0,1], 'left');
		i++;
		game.gameBoard.constructRoad(game.players[0],[1,1], 'left');
		i++;


		game.gameBoard.placeSettlement(game.players[1],[1,1]);


		game.gameBoard.constructRoad(game.players[0],[0,0], 'left');
		i++;
		game.gameBoard.constructRoad(game.players[0],[1,0], 'vertical');
		i++;

		game.gameBoard.constructRoad(game.players[0],[3,0], 'vertical');
		expect(game.findLongestRoad()).toEqual(3);
	});

	it("finds the index of a nested array", function(){
		var arr1 = [ [0, 1], [3, 4], [1, 2] ];
		expect(game.getNestedArrayIndex(arr1, [3, 4])).toEqual(1);
	});

	it("returns -1 if the nested array is not contained in the parent", function(){
		var arr1 = [ [0, 1], [3, 4], [1, 2] ];
		expect(game.getNestedArrayIndex(arr1, [3, 5])).toEqual(-1);
	});

	it("enables players to trade with the bank", function() {
		game.bankTrading(game.players[0], [{resource: 'grain', quantity: 4}], [{resource: 'brick', quantity: 1}]);
		expect(game.players[0].resources['grain']).toEqual(1);
		expect(game.players[0].resources['brick']).toEqual(1);
	});

	it("prevents players from conducting trades they don't have enough resources to conduct", function() {
		var result = game.bankTrading(game.players[0], [{resource: 'lumber', quantity: 4}], [{resource: 'brick', quantity: 1}]);
		expect(game.players[0].resources['lumber']).toEqual(1);
		expect(game.players[0].resources['brick']).toEqual(0);
		expect(result).toBe(false);
	});

	it("uses player's tradingCosts object to determine the ratio for a trade", function() {
		game.players[0].tradingCosts['grain']=2;
		game.bankTrading(game.players[0], [{resource: 'grain', quantity: 4}], [{resource: 'brick', quantity: 2}]);
		expect(game.players[0].resources['grain']).toEqual(1);
		expect(game.players[0].resources['brick']).toEqual(2);
	});

	it("manages complex trades with the bank", function() {
		game.players[0].tradingCosts['grain']=2;
		game.bankTrading(game.players[0], [{resource: 'grain', quantity: 4}, {resource:'wool', quantity:4}], [{resource: 'brick', quantity: 3}]);
		expect(game.players[0].resources['grain']).toEqual(1);
		expect(game.players[0].resources['wool']).toEqual(0);
		expect(game.players[0].resources['brick']).toEqual(3);
	});
});