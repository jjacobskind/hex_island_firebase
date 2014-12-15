'use strict';

angular.module('settlersApp')
    .factory('authFactory', function(){
        var auth_data, playerData, playerID, playerName, playerFirstName;
        return {
            setAuthData: function(data){
                playerName = data.facebook.displayName;
                playerFirstName = playerName.split(" ")[0];
                auth_data = data;
            },
            getAuthData: function() {
                return auth_data;
            },
            setPlayerID: function(id){
                playerID = id;
            },
            getPlayerID: function(){
                return playerID;
            },
            getPlayerName: function(full){
                if(full){
                    return playerName;
                } else {
                    return playerFirstName;
                }
            }
        };
    })
  .controller('MainCtrl', function ($scope, $state, authFactory, boardFactory, engineFactory, $q, $rootScope) {
    var self = this;
    self.player_name;
    self.small_num = 3;
    self.big_num = 5;

    $scope.previousGameIDs = undefined;
    $scope.userIsJoiningGame = false;

    var dataLink = engineFactory.getDataLink();

    $scope.createNewGame = function() {
        var authData = authFactory.getAuthData();
        engineFactory.newGame(3, 5);
        var gameID = engineFactory.getGameID();
        var game = engineFactory.getGame();
        var userArray = [];
        userArray.push(authData.uid);
        dataLink.child('games').child(gameID).child('users').push({playerID: authData.uid, playerNumber: 0});
        dataLink.child('users').child(authData.uid).once('value', function (data) {
            var userData = data.val();
            if (!userData.currentGames) {
                var gameObject = {};
                gameObject.gameID = gameID;
                $rootScope.currentGameID = gameID;
                gameObject.playerNumber = 0
                dataLink.child('users').child(authData.uid).child('currentGames').push(gameObject);
            }
            else {
                $scope.previousGameIDs = userData.currentGames;
                var gameArray = [];
                for (var game in $scope.previousGameIDs) {
                    gameArray.push($scope.previousGameIDs[game]);
                }
                var gameObject = {};
                gameObject.gameID = gameID;
                $rootScope.currentGameID = gameID;
                gameObject.playerNumber = 0
                gameArray.push(gameObject);
                dataLink.child('users').child(authData.uid).child('currentGames').set(gameArray)
            }            
            $scope.currentGameID = gameID;
        });
        engineFactory.addPlayer();
        authFactory.setPlayerID(0);
        $rootScope.playerData = game.players[0];
        $state.go('game');
    };
    $scope.loadGameDataForUser = function(){
        var authData = authFactory.getAuthData();
        dataLink.child('users').child(authData.uid).once('value', function (databaseData) {
            var snapData = databaseData.val();
            $scope.previousGameIDs = snapData.currentGames;
            $scope.$apply();
            $state.go('main.load');
        });
    }
    $scope.loadPreviousGame = function(gameID, newPlayer) {
        var authData = authFactory.getAuthData();
        engineFactory.restorePreviousSession(gameID)
        .then(function onSuccess(){
            engineFactory.gamePromise()
                .then(function(gameData){
                    game = gameData;
                    $scope.gameIsLoaded = true;
                    $rootScope.currentGameID = gameID;
                    boardFactory.drawGame(game);
                    if (newPlayer){
                        var player = engineFactory.addPlayer();
                        authFactory.setPlayerID(game.players.length-1);
                        var playerID = authFactory.getPlayerID();
                        var gameObject = {};
                        gameObject.gameID = gameID;
                        gameObject.playerNumber = playerID;
                        dataLink.child('games').child(gameID).child('users').push({playerID: authData.uid, playerNumber: playerID}); 
                        dataLink.child('users').child(authData.uid).child('currentGames').push(gameObject);
                        $rootScope.playerData = gameData.players[playerID];
                        $scope.gameIsLoaded = true;
                    } else {
                        for (var game in $scope.previousGameIDs){
                            if ($scope.previousGameIDs[game].gameID === gameID) {
                                authFactory.setPlayerID($scope.previousGameIDs[game].playerNumber);
                                $rootScope.playerData = gameData.players[authFactory.getPlayerID()];
                                $scope.gameIsLoaded = true;
                            }
                        }
                    }
                    $state.go('game');
            })
        });
    };
    $scope.loginOauth = function() {
        dataLink.authWithOAuthPopup("facebook", function(error, auth) {
            if (auth) {
                authFactory.setAuthData(auth);
                var authData = authFactory.getAuthData();
                self.player_name = authFactory.getPlayerName();
                $state.go('main.menu');
                $scope.$digest();
                dataLink.child('users').child(authData.uid).update(authData);

              } else {
                    console.log(error)
              }
            });
    };

    $scope.joinGameID = function(id) {
           if ($scope.userIsJoiningGame === false) {
               $scope.userIsJoiningGame = true;
               var game = null;
               dataLink.child('games').once('value', function(data){
                   var existingGames = data.val();
                   var gameData = existingGames[id];
                   if (!existingGames[id]){
                       console.log('no game exists by this id');
                       return false;
                   }
                   else {
                       $rootScope.currentGameID = id;
                       $scope.loadPreviousGame(id, 'newPlayer');
                   }
               }); 
           }
       }
  });


