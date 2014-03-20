'use strict';

angular.module('martaioApp', [
  'ngCookies',
  'ngResource',
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
  }).filter('jsUnique', function () {
    return function (input, key) {
      return _.values(_.indexBy(input.reverse(), key));
    };
  }).filter('waitTime', function(){
    return function(text){
      var minutes = parseInt(text, 10);
      if (isNaN(minutes)) {
        return text;
      } else {
        if (minutes >= 10) {
          minutes = minutes.toString();
        } else {
          minutes = '0' + minutes.toString();
        }
        return ':' + minutes;
      }
    };
  });
