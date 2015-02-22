'use strict';

angular.module('martaioApp')
  .controller('HeaderCtrl', function ($scope, $location, $window, Marta, User) {
    $scope.location = $location;
    $scope.Marta = Marta;
    $scope.user = User.data();
    $scope.openMenu = false;
    $scope.showBackBtn = false;
    $scope.$window = $window;

    $scope.$on('$routeChangeSuccess', function(event, curr, prev) {
      $scope.showBackBtn = curr.loadedTemplateUrl !== 'partials/main.html';
    });

    var beginning = $window.history.length;
    $scope.goBack = function() {
      if ($window.history.length > beginning) {
        $window.history.back();
      } else {
        $location.path('/');
      }
    };

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
