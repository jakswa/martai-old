'use strict';

var marta = require('../services/marta');

/**
 * Get awesome things
 */
exports.arrivals = function(req, res) {
  marta.getArrivals(function(arrivals, err) {
    if (err) {
        console.log('err: ' + err)
      res.status(400).json({error: err});
    } else { 
      res.json(arrivals);
    }
  });
};