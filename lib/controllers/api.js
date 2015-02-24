'use strict';

var marta = require('../services/marta');

/**
 * Get awesome things
 */
exports.arrivals = function(req, res) {
  marta.getArrivals(function(arrivals, err) {
    if (err) {
      console.log('err: ' + err);
      res.status(400).json({error: err});
    } else { 
      /* you might be asking yourself, why isn't he just doing:
       * res.json(arrivals);
       * and that's because I don't want to incur the overhead of
       * JSON.parsing then stringifying the data I'm proxying from Marta.
       * and because Heroku's t1.micro instances are poop.
       */
      res.set('Content-Type', 'application/json').send(arrivals);
    }
  });
};

exports.schedule = function(req, res) {
  var station = req.params.station;
  if (!station) {
    res.status(400).json({error: 'station parameter required'});
  } else {
    res.json(marta.scheduledArrivals(station));
  }
};
