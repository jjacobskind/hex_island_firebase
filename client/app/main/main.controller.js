'use strict';

angular.module('settlersApp')
  .controller('MainCtrl', function ($scope, boardFactory) {
    var self = this;
    self.small_num = 3;
    self.big_num = 5;

    self.makeBoard = function(){
      boardFactory.newBoard(self.small_num, self.big_num);
    }
  });
