'use strict';

angular.module('martaioApp')
  .controller('HeaderCtrl', function ($scope, $location, $window, Marta, User) {
    $scope.location = $location;
    $scope.Marta = Marta;
    $scope.user = User.data();
    $scope.openMenu = false;
    $scope.showBackBtn = false;
    $scope.$window = $window;

    $scope.$watch('location.path()', function (val) {
      $scope.showBackBtn = (val !== '/');
    });

    $scope.toggleLocationLock = function() {
      var locked = User.data('locationLock', !User.data('locationLock'));
      if (!locked) {
        Marta.locateUser();
      }
    };

    $scope.toggleAutorefresh = function() {
      Marta.autorefresh = !Marta.autorefresh;
      Marta.arrivalTimeout();
    };
  });
