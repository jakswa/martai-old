'use strict';

angular.module('martaioApp').service('Marta', function ($http, $timeout) {
  var marta = {};
  marta.loadingArrivals = false;
  marta.arrivals = [];
  marta.updateArrivals = function() {
    marta.loadingArrivals = true;
    return $http.get('/api/arrivals').then(function(resp) {
      marta.loadingArrivals = false;
      marta.arrivals = resp.data;
    });
  };
  marta.arrivalPromise = marta.updateArrivals();
  marta.arrivalTimeout = $timeout(marta.updateArrivals, 10000);
  return marta;
});
