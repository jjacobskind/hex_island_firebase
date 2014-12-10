'use strict';

angular.module('settlersApp')
  .controller('MainCtrl', function ($scope, boardFactory, engineFactory, $q, $rootScope) {
    var self = this;
    self.small_num = 3;
    self.big_num = 5;
    var authData = undefined;
    var game;

    $scope.userIsLoggedIn = false;
    $scope.gameIsLoaded = false;
    $scope.previousGameIDs = undefined;
    $scope.userJoiningCurrentGame = false;
    $scope.currentUserData = authData;
    $rootScope.currentGameID = null;
    $scope.whatPlayerAmI = undefined;

    var dataLink = engineFactory.getDataLink();

    $scope.createNewGame = function() {
        engineFactory.newGame(3, 5);
        var gameID = engineFactory.getGameID();
        var game = engineFactory.getGame();
        var userArray = [];
        userArray.push(authData.uid);
        dataLink.child('games').child(gameID).child('users').push(authData.uid);
        dataLink.child('users').child(authData.uid).once('value', function (data) {
            var userData = data.val();
            if (!userData.currentGames) {
                var gameObject = {};
                gameObject.gameID = gameID;
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
                gameObject.playerNumber = 0
                gameArray.push(gameObject);
                dataLink.child('users').child(authData.uid).child('currentGames').set(gameArray)
            }            $scope.currentGameID = gameID;
        });
        engineFactory.addPlayer();
        $rootScope.whatPlayerAmI = 0;
        $rootScope.playerData = game.players[0];
        $scope.gameIsLoaded = true;
    };
    $scope.loadGameDataForUser = function(){
        dataLink.child('users').child(authData.uid).once('value', function (databaseData) {
            var snapData = databaseData.val();
            $scope.previousGameIDs = snapData.currentGames;
            $scope.$apply();
        });
    }
    $scope.loadPreviousGame = function(gameID, newPlayer) {
        // var deferred = $q.defer()
        
        engineFactory.restorePreviousSession(gameID)
            
        .then(function onSuccess(){
            engineFactory.gamePromise()
                .then(function(gameData){
                    game = gameData;
                    boardFactory.drawGame(game);
                    $scope.gameIsLoaded = true;
                    $rootScope.currentGameID = gameID;
                    $rootScope.whatPlayerAmI = game.players.length;
                    boardFactory.drawGame(game);
                    if (newPlayer)
                        {   
                            var player = engineFactory.addPlayer();
                            var gameObject = {};
                            gameObject.gameID = +gameID;
                            gameObject.playerNumber = $rootScope.whatPlayerAmI;
                            dataLink.child('users').child(authData.uid).child('currentGames').push(gameObject);
                            $rootScope.playerData = gameData.players[$rootScope.whatPlayerAmI];
                            $scope.gameIsLoaded = true;
                        }
                    else {
                        for (var game in $scope.previousGameIDs){
                            if ($scope.previousGameIDs[game].gameID === gameID) {
                                console.log($scope.previousGameIDs[game]);
                                $rootScope.whatPlayerAmI = $scope.previousGameIDs[game].playerNumber;
                                $rootScope.playerData = gameData.players[$rootScope.whatPlayerAmI];
                                $scope.gameIsLoaded = true;
                            }
                        }
                    }
            })
        });
    };
    $scope.loginOauth = function() {
        dataLink.authWithOAuthPopup("facebook", function(error, auth) {
            if (auth) {
                authData = auth;
                $scope.currentUserData = auth;
                $scope.userIsLoggedIn = true;
                $scope.$digest();
                dataLink.child('users').child(authData.uid).update(authData);
              } else {
                    console.log(error)
              }
            });
    };

    $scope.joinCurrentGame = function(){
        $scope.userJoiningCurrentGame = true;
    };

    $scope.joinGameID = function(id) {
        var game = null;
        dataLink.child('games').once('value', function(data){
            console.log(data);
            var existingGames = data.val();
            var gameData = existingGames[id];
            if (!existingGames[id]){
                console.log('no game exists by this id');
                return false;
            }
            else {
                console.log('gets here')
                $rootScope.currentGameID = id;
                $scope.loadPreviousGame(id, 'newPlayer');
                $scope.userJoiningCurrentGame = false;
            }
        }); 
        dataLink.child('games').child(id).child('users').push(authData.uid); 
    }
  });


