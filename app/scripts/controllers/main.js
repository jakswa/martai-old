'use strict';

angular.module('martaioApp')
  .controller('MainCtrl', function ($scope, $http, Marta) {
    $scope.Marta = Marta;
  });
