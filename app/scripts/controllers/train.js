'use strict';

angular.module('martaioApp')
  .controller('TrainCtrl', function ($scope, $rootScope, $http, $routeParams, Marta) {
    $scope.train = $routeParams.train;
    $scope.Marta = Marta;
  });
