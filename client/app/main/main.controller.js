'use strict';

angular.module('settlersApp')
    .factory('authFactory', function(){
        var auth_data, playerData;
        return {
            setAuthData: function(data){
                auth_data = data;
            },
            getAuthData: function() {
                return auth_data;
            }
        };
    })
  .controller('MainCtrl', function ($scope, $state, authFactory, boardFactory, engineFactory, $q, $rootScope) {
    var self = this;
    self.player_name;
    self.small_num = 3;
    self.big_num = 5;

    $scope.previousGameIDs = undefined;
    $rootScope.currentGameID = null;
    $scope.whatPlayerAmI = undefined;
    $scope.playerData = null;

    var dataLink = engineFactory.getDataLink();

    $scope.createNewGame = function() {
        var authData = authFactory.getAuthData();
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
            $scope.currentGameID = gameID;
        });
        engineFactory.addPlayer();
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
        // var deferred = $q.defer()
        var authData = authFactory.getAuthData();
        
        engineFactory.restorePreviousSession(gameID)
        .then(function onSuccess(){
            console.log('game loaded')
            var game = engineFactory.getGame();
            $rootScope.currentGameID = gameID;
            boardFactory.drawGame(game);
            if (newPlayer)
                {   
                    engineFactory.addPlayer();
                    $scope.whatPlayerAmI = engineFactory.getGame().players.length-1;
                    var gameObject = {};
                    gameObject.gameID = +gameID;
                    gameObject.playerNumber = $scope.whatPlayerAmI;
                    dataLink.child('users').child(authData.uid).child('currentGames').push(gameObject);
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
        })
        .then(function(){
            var game = engineFactory.getGame();
            $rootScope.playerData = game.players[$scope.whatPlayerAmI];
            $scope.playerData = game.players[$scope.whatPlayerAmI];
            $state.go('game');
        })
    };
    $scope.loginOauth = function() {
        dataLink.authWithOAuthPopup("facebook", function(error, auth) {
            if (auth) {
                authFactory.setAuthData(auth);
                self.player_name = auth.facebook.displayName.split(" ")[0];
                var authData = authFactory.getAuthData();
                $state.go('main.menu');
                $scope.$digest();
                dataLink.child('users').child(authData.uid).update(authData);

              } else {
                    console.log(error)
              }
            });
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
                $rootScope.currentGameID = gameID;
                $state.go('game');
            }
        }); 
        dataLink.child('games').child(id).child('users').push(authData.uid); 
    }
  });


