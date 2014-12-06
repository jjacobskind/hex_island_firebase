'use strict';

angular.module('settlersApp')
  .controller('MainCtrl', function ($scope, boardFactory, engineFactory, $q) {
    var self = this;
    self.small_num = 3;
    self.big_num = 5;
    var authData = undefined;

    $scope.userIsLoggedIn = false;
    $scope.gameIsLoaded = false;
    $scope.previousGameIDs = undefined;
    $scope.userJoiningCurrentGame = false;
    $scope.currentUserData = authData;
    $scope.currentGameID = null;
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
            }
            $scope.game = game;
            $scope.currentGameID = gameID;
            engineFactory.addPlayer();
            $scope.gameIsLoaded = true;
            $scope.whatPlayerAmI = 0;
            $scope.$digest();
        })
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
            console.log('game loaded')
            $scope.gameIsLoaded = true;
            if (newPlayer)
                {   
                    engineFactory.addPlayer();
                    $scope.whatPlayerAmI = engineFactory.getGame().players.length-1;
                    var gameObject = {};
                    gameObject.gameID = +gameID;
                    gameObject.playerNumber = $scope.whatPlayerAmI;
                    dataLink.child('users').child(authData.uid).child('currentGames').push(gameObject)
                }
            else {
                for (var game in $scope.previousGameIDs){
                    if ($scope.previousGameIDs[game].gameID === gameID) {
                        $scope.whatPlayerAmI = $scope.previousGameIDs[game].playerNumber;
                    }
                }
            }
        }, function onError() {
            console.log('error in loadPreviousGame')
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

    //push new gameID to their profile, then pull players.length-1, assign them the user

    $scope.joinCurrentGame = function(){
        $scope.userJoiningCurrentGame = true;
    };

    $scope.joinGameID = function(id) {
        var game = null;
        dataLink.child('games').once('value', function(data){
            var existingGames = data.val();
            var gameData = existingGames[id];
            if (!existingGames[id]){
                console.log('no game exists by this id');
                return false;
            }
            else {
                $scope.loadPreviousGame(id, 'newPlayer');
            }
        }); 
        dataLink.child('games').child(id).child('users').push(authData.uid); 
    }
  });


