'use strict';

var MartaAPIKeys = {
  train: process.env.MARTA_TRAIN_API_KEY
};
var MartaURLs = {
  trainArrivals: 'http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apiKey=' 
};

var request = require('request');
var Q = require('q');
var moment = require('moment-timezone');
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
  // two users hitting at the same time will wait for a single request to finish
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
  var reqURL = MartaURLs.trainArrivals + MartaAPIKeys.train; 
  request(reqURL, function (err, resp, body) {
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

// loop through routes (ie 'GOLD', 'RED') to find nearest scheduled arrival time
// currentTime = 'HH:mm:ss'
function closestArrival(currentTime, routes) {
  var result;
  for(var route in routes) {
    var times = routes[route]; // sorted list of strings as 'HH:mm:ss'
    for(var b = 0; b < times.length; b++) {
      if (currentTime < times[b]) {
        var beatsCurrent = !result || result.time > times[b];
        if (beatsCurrent) {
          result = {
            time: times[b],
            route: route
          };
        }
        break;
      }
    }
  }
  return result;
}

// return scheduled arrival time
marta.scheduledArrival = function(station, direction) {
  direction = direction.toUpperCase();
  // in NY on digital ocean, but just to make sure...
  var now = moment.tz('America/New_York');
  // subtract 4 hours because GTFS rolls services past midnight ಠ_ಠ
  var dow = now.clone().subtract({hours: 4}).format('ddd').toLowerCase();

  // requiring in service-specific JSON file, containing schedule
  // format is {station: {direction: {route: [time1, time2, ...]}}}
  var service_id = require('../schedule/calendar')[dow];
  var service = require('../schedule/service' + service_id);

  var time = now.format('HH:mm:ss');
  var hour = now.hour();
  var postMidnightService = hour >= 0 && hour <= 3;

  // if time between 12am and 4am, adjust for GTFS
  // ie '00:13:00' neeeds to become '24:13:00' ಠ_ಠ
  if (postMidnightService) {
    time = (hour + 24).toString().concat(time.slice(2));
  }

  var routes = service[station][direction];
  var arrival = closestArrival(time, routes);

  if (!arrival) {
    return; // hopefully never, but just in case
  }

  var estimate = arrival.time; // 'HH:mm:ss'
  var estHour = estimate.slice(0,2);
  var estTime;

  // if estimate is after midnight (>= 24:00:00 ಠ_ಠ), 
  // we need to turn it into a valid time for comparison
  if (estHour >= '24') {
    estHour = (parseInt(estHour, 10) - 24).toString();
    estTime = moment(estHour + estimate.slice(2), 'HH:mm:ss');
    // make sure this estTime is *after* now
    // happens when now = 11:55PM and arrival is after midnight
    // ugh ugh ugh ugh ಠ_ಠ
    if (!postMidnightService) {
      estTime.add({days: 1});
    }
  } else {
    estTime = moment(estimate, 'HH:mm:ss');
  }

  var minutes = estTime.diff(now, 'minutes');

  // no one cares about trains scheduled hours away
  if (minutes > 60) {
    return;
  }

  return {
    direction: direction.toLowerCase(),
    station: station,
    scheduled: true,
    line: arrival.route.toLowerCase(),
    // instead of showing 0 or 'arriving' (possibly confusing),
    // just keep showing a 1, I guess
    waiting_time: (minutes || 1) + ' min'
  };
};

module.exports = marta;
