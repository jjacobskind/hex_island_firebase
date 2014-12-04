'use strict';

angular.module('settlersApp')
  .controller('MainCtrl', function ($scope, boardFactory, engineFactory) {
    var self = this;
    var game = undefined;
    self.small_num = 3;
    self.big_num = 5;
    $scope.userIsLoggedIn = false;
    $scope.gameIsLoaded = false;
    var dataLink = engineFactory.getDataLink();
    var authData = dataLink.getAuth();
    
    if (authData) {
        $scope.userIsLoggedIn = true; 
    };
    
    $scope.facebookLoginFunction = function() {
        dataLink.authWithOAuthPopup("facebook", function(error, authData) {
            })

        if (authData){$scope.$digest()};
    };
    
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

    //if user hits 'create new game'

    //push new gameID to their profile, then pull players.length-1, assign them the user

    

    //***
    // engineFactory.buildSettlement(0, [0,0]);
    // engineFactory._refreshDatabase();

  });
