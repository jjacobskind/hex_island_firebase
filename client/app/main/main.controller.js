'use strict';

angular.module('settlersApp')
  .controller('MainCtrl', function ($scope, boardFactory, engineFactory) {
    var self = this;
    self.small_num = 3;
    self.big_num = 5;
    var authData = undefined;
    $scope.userIsLoggedIn = false;
    $scope.gameIsLoaded = false;
    $scope.addPlayer = function() {
        engineFactory.addPlayer();
    }
    var dataLink = engineFactory.getDataLink();

    $scope.createNewGame = function() {
        console.log('new game has been created!')
        engineFactory.newGame(3, 5);
        var gameID = engineFactory.getGameID();
        var game = engineFactory.getGame();
        dataLink.child('users').child(authData.uid).set(authData);
        dataLink.child('users').child(authData.uid).child('currentGames').set({gameIDs: gameID});
        engineFactory.addPlayer();
        console.log(game);
        $scope.gameIsLoaded = true;
    };
    $scope.loadPreviousGame = function() {
        console.log('previous game has been restored!')
        engineFactory.restorePreviousSession();
        var game = engineFactory.getGame();
        console.log(game);
        $scope.gameIsLoaded = true;
    };
    $scope.loginOauth = function() {
        dataLink.authWithOAuthPopup("facebook", function(error, auth) {
            if (auth) {
            authData = auth;
            $scope.userIsLoggedIn = true;
            $scope.$digest();
          } else {
            console.log(error)
          }
        })};

    //if user hits 'create new game'

    //push new gameID to their profile, then pull players.length-1, assign them the user



    //***
    // engineFactory.buildSettlement(0, [0,0]);
    // engineFactory._refreshDatabase();

  });
