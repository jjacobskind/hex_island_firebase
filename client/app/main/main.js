'use strict';

angular.module('settlersApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main', {
        abstract:true,
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl as main_ctrl'
      })
      .state('main.login', {
        url: '/',
        templateUrl: 'app/main/menu_templates/main_login.html',
        scope:false
      })
      .state('main.menu', {
      	url: 'menu',
      	templateUrl: 'app/main/menu_templates/main_menu.html',
      	scope:false
      })
      .state('main.load', {
      	url: 'load_game', 
      	templateUrl: 'app/main/menu_templates/main_load.html',
      	scope:false
      })
      .state('main.join', {
      	url: 'join_game',
      	templateUrl: 'app/main/menu_templates/main_join.html',
      	scope: false
      });
  });
