'use strict';

angular.module('settlersApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('game', {
        url: '/game',
        templateUrl: 'app/game/game.html',
        controller: 'MainCtrl as main_ctrl'
      });
  });