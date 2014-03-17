'use strict';

angular.module('martaioApp').service('User', function User($q, stationLocations, Marta, $rootScope) {
  var data = JSON.parse(localStorage.getItem('martaio:user')) || {};
  var session = JSON.parse(sessionStorage.getItem('martaio:user')) || {};
  var nearestDefer = $q.defer();

  var user = {};
  // quick sessionStorage/localStorage interface generator thingy
  user.store = function(type) {
   return function(key, val, noPersist) {
      var store = type === 'local' ? localStorage : sessionStorage;
      var storeData = type === 'local' ? data : session;
      if (val === undefined) {
        return key ? storeData[key] : storeData;
      }
      storeData[key] = val;
      if (!noPersist) {
        store.setItem("martaio:user", JSON.stringify(storeData)); 
      }
      return key ? storeData[key] : storeData;
   }
  };
  user.data = user.store('local');
  user.session = user.store('session');
  user.updatePosition = function() {
    var d = $q.defer();
    if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(function(position) {
        d.resolve(user.data('lastPosition', position));
      });
    }
    return d.promise;
  };
  user.updateNearestStation = function() {
    var d = $q.defer();
    if (data.lastPosition) {
      var nearest = {dist: Infinity, station: null};
      var curPos = data.lastPosition.coords;
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
      if (nearest.station) {
        d.resolve(user.data('nearestStation', nearest.station));
      }
    }
    return d.promise;
  };

  user.updateNearestArrival = function() {
    var match = _.find(Marta.arrivals, function(i) {
      return i.station === data.nearestStation
    });
    if (match) {
      user.session('nearest', match);
    }
  };

  var nearestDefer = user.updatePosition().then(user.updateNearestStation);
  $q.all([Marta.arrivalsPromise, nearestDefer]).then(user.updateNearestArrival);

  return user;
});
