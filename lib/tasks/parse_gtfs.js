// Here lies my janky CSV parser for Google Transit Feed Spec files.
// It parses out scheduled times, intended to help the near-end stations.
// This initial pass relies on:
// - the gtfs files existing in a 'google_transit' folder in app root
//   - unzip them after downloading from marta's website
// - route IDs currently starting with '8' for trains
// - various hard-coded indices in the CSV files (watch these change)

var fs = require('fs');
var _ = require('lodash');
var promise = require('q');

var readFile = promise.nfbind(fs.readFile);

// of course they couldn't use the same station names
// as in the realtime API
var station_name_mapping = {
  'LAKEWOOD-FT MCPHERSON  STATION': 'LAKEWOOD STATION',
  'EDGEWOOD-CANDLER PARK STATION': 'EDGEWOOD CANDLER PARK STATION',
  'INMAN PARK-REYNOLDSTOWN STATION': 'INMAN PARK STATION',
  'DOME-GWCC-PHILIPS ARENA-CNN STATION': 'OMNI DOME STATION',
  'LINDBERGH CENTER STATION': 'LINDBERGH STATION',
  'NORTH AVENUE STATION': 'NORTH AVE STATION',
  'BROOKHAVEN-OGLETHORPE STATION': 'BROOKHAVEN STATION'
};
var stationNameFor = function(name) {
  return (station_name_mapping[name] || name).toLowerCase();
};

var dow = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
var getDates = readFile('./google_transit/calendar.txt', {encoding: 'utf8'}).then(function(data) {
  var ret = {};
  data.split('\r\n').forEach(function(c) {
    c = c.split(',');
    for (var i = 0; i < dow.length; i++) {
      if (c[i+1] === '1') {
        ret[dow[i]] = c[0];
      }
    }
  });
  return ret;
});

var findTrips = readFile('./google_transit/trips.txt', {encoding: 'utf8'}).then(function(trips) {
  var filtered_trips = _.filter(trips.split("\r\n"), function(r) {
    return r.indexOf('8') === 0; 
  });
  var res = {};
  filtered_trips.forEach(function(t) {
    t = t.split(',');
    var desc = t[3].split(' ');
    res[t[2]] = {id: t[2], dir: desc[1][0], line: desc[0], service: t[1], stops: []};
  });
  return res;
});

var stopTimes = findTrips.then(function(trips) {
  var resolve;
  // bluebird compatible, I'll switch at some point
  var defer = new promise.Promise(function(res, rej) {
    resolve = res;
  });
  var stop_ids = {};
  // this file is 30-something-goddamn megabytes, guess I'll stream this one
  var stop_time_stream = fs.createReadStream('./google_transit/stop_times.txt', {encoding: 'utf8'});
  var lastPiece;
  stop_time_stream.on('data', function(chunk) {
    var lines = chunk.split("\r\n");
    lines[0] = (lastPiece || '') + lines[0];
    lastPiece = lines.pop();
    lines.forEach(function(l) {
      var trip_id = l.slice(0,l.indexOf(','));
      if (trips[trip_id]) {
        l = l.split(',');
        // replace '9:45:00' with '09:45:00'
        // for sorting purposes
        if (l[1].indexOf(':') === 1) {
          l[1] = '0' + l[1];
        }
        trips[trip_id].stops.push({
          time: l[1], 
          stop_id: l[3]
        });
        stop_ids[l[3]] = true;
      }
    });
  });
  stop_time_stream.on('end', function() {
    resolve({
      trips: trips,
      stop_ids: stop_ids
    });
  });
  return defer;
});

var timeIndex = function(times, time) {
  return _.indexOf(times, function (t) {
    return t > time;
  });
};
var stationData = {};
var completeData = promise.all([
    stopTimes,
    readFile('./google_transit/stops.txt', {encoding: 'utf8'})
]).spread(function(stopTimes, stop_data) {
    var stop_ids = stopTimes.stop_ids;
    var trips = stopTimes.trips;

    stop_data.split('\r\n').forEach(function(s) {
      var stop_id = s.slice(0, s.indexOf(','));
      if (stop_ids[stop_id]) {
        s = s.split(',');
        var stop_name = stationNameFor(s[2]);

        // now that I have the relevant station names (ffs!),
        // let's (NxM) loop through all the trips, looking at their stops,
        // and build the final result for our JSON files
        _.each(trips, function(trip, trip_id) {
          for (var i = 0; i < trip.stops.length; i++) {
            var trip_stop = trip.stops[i];
            var ts_id = trip.stops[i].stop_id;
            if (ts_id !== stop_id) continue;
            if (!stationData[trip.service]) {
              stationData[trip.service] = {};
            }
            if (!stationData[trip.service][stop_name]) {
              stationData[trip.service][stop_name] = {};
            }
            var service = stationData[trip.service][stop_name];
            if (!service[trip.dir])
              service[trip.dir] = {};
            if (!service[trip.dir][trip.line])
              service[trip.dir][trip.line] = [];
            var ind = timeIndex(service[trip.dir][trip.line], trip_stop.time);
            service[trip.dir][trip.line].splice(ind, 0, trip_stop.time);
          }
        });
      }
    });
    for(var i2 in stationData)
      for (var j in stationData[i2])
        for (var k in stationData[i2][j])
          for (var l in stationData[i2][j][k])
            stationData[i2][j][k][l].sort();
    return stationData;
});

promise.all([getDates, completeData]).spread(function(dates, data) {
  // creating service files
  var file;
  _.each(data, function(data, service) {
    file = fs.openSync('./lib/schedule/service' + service + '.json', 'w');
    fs.writeSync(file, JSON.stringify(data));
  });
  file = fs.openSync('./lib/schedule/calendar.json', 'w');
  fs.writeSync(file, JSON.stringify(dates, null, ' '));
  module.exports.data = {};
  return data;
}).done();
