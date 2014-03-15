'use strict';

angular.module('martaioApp')
  .controller('MainCtrl', function ($scope, $http, Marta) {
  	$scope.Marta = Marta;
    $scope.toggleAutorefresh = function() {
      Marta.autorefresh = !Marta.autorefresh;
      Marta.arrivalTimeout();
    };
  });
