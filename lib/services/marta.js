'use strict';

var MartaAPIKeys = {
  train: process.env.MARTA_TRAIN_API_KEY
};
var MartaURLs = {
  trainArrivals: 'http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apiKey=' 
};


var request = require('request');
var Q = require('q');

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
    reqCache.arrivals = JSON.parse(body.toLowerCase());
    reqCache.time = new Date();
    callback(reqCache.arrivals);
    marta.deferredReq.resolve(reqCache.arrivals);
  });
};

module.exports = marta;
