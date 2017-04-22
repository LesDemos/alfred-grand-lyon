'use strict';

const uuid = require('uuid/v1');

function FBProcess(options) {
  if (!(this instanceof FBProcess)) {
    return new FBProcess(options);
  }

  const options = options || {};
  this.name = options.name || uuid();
  this.is_main = options.is_main || false;
}

FBProcess.prototype.handleMessage = function(user_id, options) {
  console.log('Base FBProcess message handler');
  console.log('Received message type : ' + options.type);
};

module.exports = FBProcess;