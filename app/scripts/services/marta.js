'use strict';

angular.module('martaioApp').service('Marta', function ($http) {
  var marta = {};
  marta.arrivals = [];
  marta.arrivalGet = $http.get('/api/arrivals').then(function(data) {
    marta.arrivals = data;
  });
  return marta;
});
