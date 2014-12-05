'use strict';

angular.module('settlersApp')
	.factory('engineFactory', function(){
		var game;

		var gameID;
		var dataLink = new Firebase("https://flickering-heat-2888.firebaseio.com/");
		var gameDatabase;
		var currentGameData;

		function parseJSON(data, callback) {
		    var tempData = JSON.parse(data);
		    return callback(tempData);
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

		return {
			newGame: function(small_num, big_num){
				game = new GameEngine(small_num, big_num);
				// gameID=Date.now();
				gameID = 0;
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
				});
				boardSync();
				return game;	
			},
			getGame: function(){
				return game;
			},
			_refreshDatabase: _refreshDatabase, 
			buildSettlement: function(player, location){
				var updates = game.buildSettlement(player, location);
				updateFireBase(updates);
			},
			addPlayer: function(){
				var updates = game.addPlayer();
				updateFireBase(updates);
			},
			restorePreviousSession: function(gameID) {
				game = new GameEngine(3, 5);
				//test data
				gameID = 0;
				gameDatabase = dataLink.child('games').child(gameID);
				currentGameData = gameDatabase.child('data');
				//
				boardSync();
				return game;
			},
			getGameID: function(){
				return gameID;
			},
			getDataLink: function(){
				return dataLink;
			}
		}
	});