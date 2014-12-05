'use strict';

angular.module('settlersApp')
	.factory('engineFactory', function($q){
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

		function boardSync(currentGameData) {
			var deferred = $q.defer();
			game = new GameEngine(3,5);
		    currentGameData.once("value", function(snapshot) {
		    var persistedData = snapshot.val();
		    parseJSON(persistedData.players, function(data){game.players = data});
		    parseJSON(persistedData.boardTiles, function(data){game.gameBoard.boardTiles = data});
		    parseJSON(persistedData.boardVertices, function(data){game.gameBoard.boardVertices = data});
		    console.log('data loaded')
		    return deferred.promise;
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
				gameID = 123;
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
				syncDatabase(game);
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
				console.log(game);
				var updates = game.addPlayer();
				if(updates.hasOwnProperty("err")){
					console.log(updates.err);
				} else {
					updateFireBase(updates);
				}
			},
			restorePreviousSession: function(gameID) {
				gameDatabase = dataLink.child('games').child(gameID);
				currentGameData = gameDatabase.child('data');
				var syncData = boardSync(currentGameData);
				return syncData
			},
			getGameID: function(){
				return gameID;
			},
			getDataLink: function(){
				return dataLink;
			}
		}
	});