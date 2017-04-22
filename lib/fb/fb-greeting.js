'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

function FBGreeting(options) {
  if (!(this instanceof FBGreeting)) {
    return new FBGreeting(options);
  }

  const options = options || {};
  options.name = FBProcess.CONST.NAME.GREETING;
  FBProcess.call(this, options);
}

util.inherits(FBGreeting, FBProcess);

FBGreeting.prototype.handleMessage = function(options) {
  console.log('FBGreeting message handler');
  console.log('Received message type : ' + options.type);
};

module.exports = FBGreeting;