'use strict';

var MartaAPIKeys = {
  train: process.env.MARTA_TRAIN_API_KEY
};
var MartaURLs = {
  trainArrivals: 'http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apiKey=' 
};

var request = require('request');

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

  request(MartaURLs.trainArrivals + MartaAPIKeys.train, function (err, resp, body) {
    if (err) {
      callback(null, err);
      return;
    }
    reqCache.arrivals = JSON.parse(body);
    reqCache.time = new Date();
    callback(reqCache.arrivals);
  });
};

module.exports = marta;
