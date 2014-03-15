'use strict';

angular.module('martaioApp')
  .controller('StationCtrl', function ($scope, $http, $routeParams, Marta) {
  	$scope.Marta = Marta;
  });
