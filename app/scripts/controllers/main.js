'use strict';

angular.module('martaioApp')
  .controller('MainCtrl', function ($scope, $http, Marta) {
  	$scope.stations = Marta.stations.map(function(i) {
  		return i.toLowerCase();
  	});
  });
