
/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
var path = require('path');

var JSONCov = require('./json-cov')
  , fs = require('fs');

/**
 * Expose `OnDemandJSONCov`.
 */

exports = module.exports = OnDemandJSONCov;

/**
 * Initialize a new `JsCoverage` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function OnDemandJSONCov(runner) {
  var self = this;

  process.on('SIGUSR2', function() {
    var mockRunner = new EventEmitter();

    JSONCov.call(self, mockRunner, false);

    mockRunner.on('end', function() {
      var jsonOutput = JSON.stringify(self.cov, null, 4);

      // write out the JSON to a file
      var outputFile = "coverage-report-" + process.pid + "-" + Date.now() + ".json";
      fs.writeFileSync(path.join(process.cwd(), outputFile), jsonOutput);
      self.emit('output', outputFile);
    });

    // trigger the output
    mockRunner.emit('end');
  });
}

// inherit from EventEmitter
OnDemandJSONCov.prototype.__proto__ = EventEmitter.prototype;
