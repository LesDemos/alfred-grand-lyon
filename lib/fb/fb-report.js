'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

function FBReport(options) {
  if (!(this instanceof FBReport)) {
    return new FBReport(options);
  }

  const options = options || {};
  options.name = options.name || 'report';
  FBProcess.call(this, options);
}

util.inherits(FBReport, FBProcess);

FBReport.prototype.handleMessage = function(user_id, options) {
  console.log('FBReport message handler');
  console.log('Received message type : ' + options.type);
};

module.exports = FBReport;