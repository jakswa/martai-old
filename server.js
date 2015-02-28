'use strict';

require('newrelic');
var express = require('express');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

var app = express();

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);

// Start server
var server = app.listen(config.port, function () {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
  // naught support
  if (process.send) process.send('online');
});

// naught support
process.on('message', function(message) {
  if (message === 'shutdown') {
    process.exit();
  }
});

// Expose app
exports = module.exports = app;
