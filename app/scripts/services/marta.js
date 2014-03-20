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
  marta.stationDist = function(compare, position) {
    var curPos = compare.coords;
    var latDiff = position.latitude - curPos.latitude;
    var lngDiff = position.longitude - curPos.longitude;
    var dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    return dist;
  };
  marta.loadingArrivals = false;
  marta.autorefresh = true;
  marta.refreshInterval = 10000;
  marta.arrivals = [];
  marta.dirMap = {
    s: 'south',
    n: 'north',
    e: 'east',
    w: 'west',
  };
  marta.arrivalsPromise = arrivalsDefer.promise;
  marta.stationName = function(station) {
    return station.replace(/ station/i, '');
  };
  marta.updateArrivals = function() {
    marta.loadingArrivals = true;
    return $http.get('/api/arrivals').then(function(resp) {
      marta.loadingArrivals = false;
      marta.arrivals = resp.data;
      marta.getPosition().then(function(position) {
        var locs  = _.map(stationLocations, function(val, key) {
          return _.extend({}, {
            station: key, 
            dist: marta.stationDist(position, val)
          }, val);
        });
        var nearbyStations = _.sortBy(locs, 'dist').slice(0,3);
        nearbyStations = _.pluck(nearbyStations, 'station');
        marta.nearbyArrivals = _.filter(marta.arrivals, function(i) {
          return nearbyStations.indexOf(i.station) >= 0;
        });
      });
    });
  };
  marta.arrivalPromise = null;
  marta.arrivalTimeout = function() {
    $timeout.cancel(marta.arrivalPromise);
    // var countdown = angular.element('#countdown');
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
