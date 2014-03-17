'use strict';

angular.module('martaioApp').service('Marta', function ($http, $timeout, $q, stationLocations, User) {
  var arrivalsDefer = $q.defer();
  var marta = {};
  marta.getPosition = function() {
    var d = $q.defer();
    var pos = User.session('userPosition');
    if (pos) {
      d.resolve(pos);
    } else if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        User.session('userPosition', position);
        d.resolve(position);
      });
    }
    return d.promise;
  };
  marta.closestArrival = function(position) {
    var nearest = {dist: Infinity, station: null};
    var curPos = position.coords;
    for (var s in stationLocations) {
      var pos = stationLocations[s];
      var latDiff = pos.latitude - curPos.latitude;
      var lngDiff = pos.longitude - curPos.longitude;
      var dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
      if (dist < nearest.dist) {
        nearest.dist = dist;
        nearest.station = s;
      }
    }
    return _.find(marta.arrivals, function(i) {
      return i.station === nearest.station
    });
  };
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
  marta.arrivalsPromise = arrivalsDefer.promise;
  marta.updateArrivals = function() {
    marta.loadingArrivals = true;
    return $http.get('/api/arrivals').then(function(resp) {
      marta.loadingArrivals = false;
      marta.arrivals = resp.data;
      marta.getPosition().then(marta.closestArrival).then(function(arrival) {
        marta.nearest = arrival;
      });
    });
  };
  marta.arrivalPromise = null;
  marta.arrivalTimeout = function() {
    $timeout.cancel(marta.arrivalPromise);
    var countdown = angular.element('#countdown');
    if (!marta.autorefresh) {
      return;
    }
    marta.arrivalPromise = $timeout(function () {
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
