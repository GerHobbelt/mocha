
/**
 * Module dependencies.
 */
var EventEmitter = require('events').EventEmitter
var path = require('path');

var JSONCov = require('./json-cov')
  , fs = require('fs');

/**
 * Expose `OnDemandOnDemandHTMLCov`.
 */

exports = module.exports = OnDemandHTMLCov;

/**
 * Initialize a new `JsCoverage` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function OnDemandHTMLCov(runner) {
  var jade = require('jade')
    , file = __dirname + '/templates/coverage.jade'
    , str = fs.readFileSync(file, 'utf8')
    , fn = jade.compile(str, { filename: file })
    , self = this;

  process.on('SIGUSR1', function() {
    var mockRunner = new EventEmitter();

    JSONCov.call(self, mockRunner, false);

    mockRunner.on('end', function() {
      var html = fn({
          cov: self.cov
        , coverageClass: coverageClass
      });

      // write out the HTML to a file
      var outputFile = "coverage-report-" + process.pid + "-" + Date.now() + ".html";
      fs.writeFileSync(path.join(process.cwd(), outputFile), html);
      self.emit('output', outputFile);
    });

    // trigger the output
    mockRunner.emit('end');
  });
}

// inherit from EventEmitter
OnDemandHTMLCov.prototype.__proto__ = EventEmitter.prototype;

/**
 * Return coverage class for `n`.
 *
 * @return {String}
 * @api private
 */

function coverageClass(n) {
  if (n >= 75) return 'high';
  if (n >= 50) return 'medium';
  if (n >= 25) return 'low';
  return 'terrible';
}