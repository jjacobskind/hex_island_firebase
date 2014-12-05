'use strict';

angular.module('settlersApp')
	.factory('engineFactory', function(boardFactory){
		var game;

		var gameID;
		var dataLink;
		var gameDatabase;
		var currentGameData;

		function parseJSON(data, callback) {
		    var tempData = JSON.parse(data);
		    var tempArr =  callback(tempData);
		    return tempArr;
		};

		function syncDatabase(game) {
		    currentGameData.child('players').set(JSON.stringify(game.players));
		    currentGameData.child('boardTiles').set(JSON.stringify(game.gameBoard.boardTiles));
		    currentGameData.child('boardVertices').set(JSON.stringify(game.gameBoard.boardVertices));
		};

		var _refreshDatabase = function(){
		    game = new GameEngine(3, 5);
		    syncDatabase(game);
		    console.log('the database and local board have been synched and refreshed')
		};

		function boardSync() {
		    currentGameData.once("value", function(snapshot) {
		    var persistedData = snapshot.val();
		    parseJSON(persistedData.players, function(data){game.players = data});
		    parseJSON(persistedData.boardTiles, function(data){game.gameBoard.boardTiles = data});
		    parseJSON(persistedData.boardVertices, function(data){game.gameBoard.boardVertices = data});
		    console.log('data loaded')
		  }, function (errorObject) {
		    console.log("The read failed: " + errorObject.code);
		  });
		};

		var updateFireBase = function(updates){
			for(var key in updates){
				currentGameData.child(key).set(updates[key]);
			}
		};

		var drawRoad = function(coords1, coords2){
			var game_view = boardFactory.getGame();
		  	var road = game_view.board.buildRoad(coords1, coords2);
		  	game_view.scene.add(road);
		};

		return {
			newGame: function(small_num, big_num){
				game = new GameEngine(small_num, big_num);
				gameID=567843;
				dataLink = new Firebase("https://flickering-heat-2888.firebaseio.com/");
				gameDatabase = dataLink.child('games').child(gameID);
				currentGameData = gameDatabase.child('data');
				currentGameData.on("child_changed", function(childSnapshot) {
				  var dataToSanitize = childSnapshot.val();
				  var keyName = childSnapshot.key();
				  switch (keyName) {
				    case "players":
				      var callback = function(data) {game.players = data};
				      break;
				    case "boardTiles":
				      callback = function(data) {game.gameBoard.boardTiles = data};
				      break;
				    case "boardVertices":
				      callback = function(data) { return game.findObjectDifferences(game.gameBoard.boardVertices, data)};//function(data) {game.gameBoard.boardVertices = data};
				      break;
				    default:
				      callback = function(data) {throw new Error ('incident occurred with this data: ', data)};
				      break;
				  };
				  var change = parseJSON(dataToSanitize, callback);
				  if(!change){
				  	return null;
				  }
				  var coords1 = [change[0].row, change[0].col];
				  if(change.length===2){
				  	var coords2 = [change[1].row, change[1].col];
				  	drawRoad(coords1, coords2);
				  } else if(change.length===1){
				  	console.log(change[0]);
				  	if(change[0].keys.indexOf("owner")!==-1) {
				  		boardFactory.placeSettlement(change[0].owner, coords1);
				  	}
				  	else if(change[0].keys.indexOf("hasSettlementOrCity")!==-1) {
				  		console.log(change[0]);
				  		var owner = game.gameBoard.boardVertices[coords1[0]][coords1[1]].owner;
				  		boardFactory.upgradeSettlementToCity(owner, coords1);
				  	}
				  }
				});
				syncDatabase(game);
				return game;	
			},
			getGame: function(){
				return game;
			},
			_refreshDatabase: _refreshDatabase, 
			buildSettlement: function(player, location){
				var updates = game.buildSettlement(player, location);
				if(updates.hasOwnProperty("err")){
					console.log(updates.err);
				}
				else {
					boardFactory.placeSettlement(player, location);
					updateFireBase(updates);
				}
			},
			upgradeSettlementToCity: function(player, location){
				var updates = game.upgradeSettlementToCity(player, location);
				if(updates.hasOwnProperty("err")){
					console.log(updates.err);
				}
				else {
					boardFactory.upgradeSettlementToCity(player, location);
					updateFireBase(updates);
				}
			},
			buildRoad: function(player, location, direction){
				var updates = game.buildRoad(player, location, direction);
				if(updates.hasOwnProperty("err")){
					console.log(updates.err);
				} else {
					var destination = game.gameBoard.getRoadDestination(location, direction);
					drawRoad(location, destination);
					updateFireBase(updates);
				}
			},
			addPlayer: function(){
				var updates = game.addPlayer();
				updateFireBase(updates);
			}
		}
	});