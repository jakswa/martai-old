'use strict';

var _ = window._;

angular.module('martaioApp').service('Marta', function ($http, $timeout, $q, stationLocations, User) {
  var arrivalsDefer = $q.defer();
  var supportsGeolocation = 'geolocation' in navigator;
  var marta = {};
  marta.updatePosition = function() {
    var dfr = $q.defer();
    marta.determiningPosition = true;
    if(supportsGeolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        marta.determiningPosition = false;
        User.data('userPosition', position);
        dfr.resolve(position);
      }, function(err) { 
        dfr.reject({error: err.message}); 
      });
    } else {
      dfr.reject('geolocation not supported');
      marta.determiningPosition = false;
    }
    return dfr.promise.then(marta.determineNearest);
  };

  /* we determine their nearest stations when:
   * - their position coordinates get updated (in updatePosition)
   * - we receive a new set of arrivals from the API (in updateArrivals)
   */
  marta.determineNearest = function() {
    marta.positionFound.then(function() {
      // position might change in future, don't use resolved value
      var position = User.data('userPosition');
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
      if (supportsGeolocation) {
        marta.determineNearest();
      }
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

  // for when a user turns on auto-locating in the UI
  marta.locateUser = function() {
    var posPromise = marta.updatePosition();
    marta.positionFound = $q.when(User.data('userPosition') || posPromise);
  };

  // kick everything off
  if (User.data('locationLock')) { // if user opts to lock location
    if (User.data('userPosition')) { // use their current location, if set
      marta.positionFound = $q.when(User.data('userPosition'));
    } else { // cancel all geolocation-based features
      var dfr = $q.defer();
      dfr.reject({error: 'not auto-locating'});
      marta.positionFound = dfr.promise;
    }
  } else {
    marta.locateUser();
  }
  marta.updateArrivals().then(function() {
    marta.arrivalPromise = marta.arrivalTimeout();
  });
  return marta;
});
