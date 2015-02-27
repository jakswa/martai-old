'use strict';

var MartaAPIKeys = {
  train: process.env.MARTA_TRAIN_API_KEY
};
var MartaURLs = {
  trainArrivals: 'http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apiKey=' 
};

var request = require('request');
var Q = require('q');
var moment = require('moment');
var _ = require('lodash');

/**
 * Marta API interaction
 */

var marta = {};

var reqCache = {};

marta.getArrivals = function(callback) {
  if (!MartaAPIKeys.train) {
    callback(null, "No API key :(");
    return;
  }
  if (reqCache.arrivals && (new Date()) - reqCache.time < 10000) {
    callback(reqCache.arrivals);
    return;
  }
  // singleton request going out that prevents race conditions.
  // two users hitting at the same time will wait for a single request to finish.
  // (to test this, I used setTimeout to similate a 5s request from marta)
  if (marta.deferredReq) {
    marta.deferredReq.promise.then(function(arrivals) {
      callback(arrivals);
    });
    return;
  }

  marta.deferredReq = Q.defer();
  marta.deferredReq.promise.fin(function() {
    marta.deferredReq = null;
  });
  request(MartaURLs.trainArrivals + MartaAPIKeys.train, function (err, resp, body) {
    if (err) {
      callback(null, err);
      return;
    }
    // toLowerCase because I'm tired of dealing with Marta's uppercase keys
    reqCache.arrivals = JSON.parse(body.toLowerCase());
    reqCache.time = new Date();
    callback(reqCache.arrivals);
    marta.deferredReq.resolve(reqCache.arrivals);
  });
};

// return upcoming arrival times (in 'minutes from now')
marta.scheduledArrival = function(station, direction) {
  direction = direction.toUpperCase();
  // in NY on digital ocean, but just to make sure...
  var now = moment().utcOffset(-5);
  var dow = now.clone().subtract({hours: 4}).format('ddd').toLowerCase();

  // requiring in service-specific JSON file, containing schedule
  var service_id = require('../schedule/calendar')[dow];
  var service = require('../schedule/service' + service_id);

  // fetching latest schedule items for station
  var time = now.format('HH:mm:ss');
  // if time between 12am and 4am, assume prev day
  var hour = now.hour();
  if (hour >= 0 && hour <= 3) {
    time = (hour + 24).toString().concat(time.slice(2));
    console.log("time:", time);
  }
  var resp;
  var routes = service[station][direction];
  for(var route in routes) {
    var times = routes[route];
    var est;
    // find the closest time in the route
    for(var b = 0; b < times.length; b++) {
      if (time < times[b]) {
        est = times[b];
        break;
      }
    }
    // make sure it's the closest, across routes
    if (est && (!resp || resp.time > est)) {
      var estHour = est.slice(0,2);
      if (estHour >= '24') {
        estHour = parseInt(estHour, 10) - 24;
        est = estHour.toString() + est.slice(2);
      }
      var minDiff = moment(est, 'HH:mm:ss').diff(now, 'minutes');
      if (minDiff > 60) continue;
      resp = {
        direction: direction.toLowerCase(),
        station: station,
        scheduled: true,
        line: route.toLowerCase(),
        waiting_time: (minDiff || 1) + ' min'
      };
    }
  }
  return resp;
};

module.exports = marta;
