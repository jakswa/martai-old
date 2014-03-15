'use strict';

angular.module('martaioApp').service('Marta', function ($http, $timeout) {
  var marta = {};
  marta.loadingArrivals = false;
  marta.dirMap = {
    s: 'south',
    n: 'north',
    e: 'east',
    w: 'west',
  };
  marta.autorefresh = true;
  marta.refreshInterval = 10000;
  marta.arrivals = [];
  marta.updateArrivals = function() {
    marta.loadingArrivals = true;
    return $http.get('/api/arrivals').then(function(resp) {
      marta.loadingArrivals = false;
      marta.arrivals = resp.data;
    });
  };
  marta.arrivalPromise = null;
  marta.arrivalTimeout = function() {
    $timeout.cancel(marta.arrivalPromise);
    var countdown = angular.element('#countdown');
    if (!marta.autorefresh) {
      return;
    }
    countdown.css({transition: (marta.refreshInterval / 1000) + 's width ease-in-out', width: '100%'});
    marta.arrivalPromise = $timeout(function () {
      countdown.css({transition: '0s', width: '0px'});
      marta.updateArrivals().then(function() {
        marta.arrivalTimeout();
      });
    }, marta.refreshInterval);
  };
  marta.updateArrivals().then(function() {
    marta.arrivalPromise = marta.arrivalTimeout();
  });
  return marta;
});
