'use strict';

angular.module('martaioApp')
  .controller('StationCtrl', function ($scope, $rootScope, $http, $routeParams, Marta) {
    $scope.station = $routeParams.station;
    $scope.stationFilters = {station: $scope.station};
    $scope.toggleFilter = function(filter, value) {
      if ($scope.stationFilters[filter] === value) {
        delete $scope.stationFilters[filter];
      } else {
        $scope.stationFilters[filter] = value;
      }
    };
    $scope.Marta = Marta;
  });
