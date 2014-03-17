'use strict';

angular.module('martaioApp')
  .controller('HeaderCtrl', function ($scope, $location, Marta) {
    $scope.location = $location;
    $scope.Marta = Marta;
    $scope.openMenu = false;
    $scope.showBackBtn = false;

    $scope.$watch('location.path()', function (val) {
      $scope.showBackBtn = (val !== '/');
    });

    $scope.toggleAutorefresh = function() {
      Marta.autorefresh = !Marta.autorefresh;
      Marta.arrivalTimeout();
    };
  });
