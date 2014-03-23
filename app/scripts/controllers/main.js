'use strict';

var _ = window._;

angular.module('martaioApp')
  .controller('MainCtrl', function ($scope, $http, Marta) {
    $scope.Marta = Marta;
  });
