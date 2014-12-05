'use strict';

angular.module('settlersApp')
  .controller('LoginCtrl', function ($scope, Auth, $location, engineFactory) {
    $scope.user = {};
    $scope.errors = {};
    var dataLink = engineFactory.getDataLink();

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.loginOauth = function() {
        dataLink.authWithOAuthPopup("facebook", function(error, authData) {
            if (authData) {
            // the access token will allow us to make Open Graph API calls
            
          }
        }).then(function() {
          // Logged in, redirect to home
        })
      };

  });
