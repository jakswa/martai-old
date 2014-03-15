'use strict';

angular.module('martaioApp', [
  'ngCookies',
  'ngResource',
  'ui.filters',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/station/:station', {
          controller: 'StationCtrl',
          templateUrl: 'partials/station'
      })
      .otherwise({
        redirectTo: '/'
      });
      
    $locationProvider.html5Mode(true);
  });