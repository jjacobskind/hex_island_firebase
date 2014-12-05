'use strict';

angular.module('settlersApp')
  .controller('MainCtrl', function ($scope, boardFactory, engineFactory) {
    var self = this;
    self.small_num = 3;
    self.big_num = 5;

    // engineFactory._refreshDatabase();
    $scope.game = engineFactory.newGame(3, 5);

    engineFactory.addPlayer();

    //*****
    $scope.game.players[0].resources = {
        brick:10,
        grain:10,
        lumber:10, 
        wool:10,
        ore:10
    };
    //***
    // engineFactory.buildSettlement(0, [0,0]);

  });
