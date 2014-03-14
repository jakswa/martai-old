'use strict';

angular.module('martaioApp')
  .controller('StationCtrl', function ($scope, $http) {
  	$scope.trains = [
  		{ id: 1, name: "Redline North Springs", time_out: 5 },
  		{ id: 2, name: "Goldline North Doraville", time_out: 12 }
  	];
  });
