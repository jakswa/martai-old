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
      var trainCounts = {};
      for (var i = 0; i < arrivals.length; i++) {
        var arrival = arrivals[i];
        if (!trainCounts[arrival.station])
          trainCounts[arrival.station] = [];
        if (trainCounts[arrival.station].indexOf(arrival.direction) === -1)
          trainCounts[arrival.station].push(arrival.direction);
      }
      for (var train in trainCounts) {
        if (trainCounts[train].length === 1) {
          var dir;
          switch (trainCounts[train][0]) {
            case 'n': dir = 's'; break;
            case 's': dir = 'n'; break;
            case 'e': dir = 'w'; break;
            default: dir = 'e';
          }

          var schedArr = marta.scheduledArrival(train, dir);
          if (schedArr) {
            arrivals.push(schedArr);
          }
        }
      }
      res.json(arrivals);
    }
  });
};
