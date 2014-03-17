'use strict';

angular.module('martaioApp')
  .controller('MainCtrl', function ($scope, $http, Marta, User) {
  	$scope.Marta = Marta;
    $scope.user = User.data();
    $scope.session = User.session();
    $scope.toggleAutorefresh = function() {
      Marta.autorefresh = !Marta.autorefresh;
      Marta.arrivalTimeout();
    };
  });
