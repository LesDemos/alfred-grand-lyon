'use strict';

const uuid = require('uuid/v1');

const NAME = {
    MENU: 'fb_menu',
    REPORT: 'fb_report'
};

function FBProcess(options) {
  if (!(this instanceof FBProcess)) {
    return new FBProcess(options);
  }

  const options = options || {};
  this.name = options.name || uuid();
  this.db_col = null;
  this.bot = null;
}

FBProcess.prototype.handleMessage = function(options) {
  console.log('Base FBProcess message handler');
  console.log('Received message type : ' + options.type);
};

FBProcess.CONST = {
  NAME: NAME
};

module.exports = FBProcess;