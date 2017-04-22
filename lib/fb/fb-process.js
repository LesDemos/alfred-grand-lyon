'use strict';

const uuid = require('uuid/v1');

const NAME = {
  GREETING: 'fb_greeting',
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
  const options = options || {};
  console.log('Received message type : ' + options.type);

  switch (options.type) {
    case 'message':
      this.handleUserMessage(options);
      break;
    case 'postback':
      this.handlePostback(options);
      break;
    default:
      console.log('Unrecognized message type!');
  }
};

FBProcess.prototype.handleUserMessage = function(options) {
  console.log('Handling user message');
};

FBProcess.prototype.handlePostback = function(options) {
  console.log('Handling postback');
};

FBProcess.CONST = {
  NAME: NAME
};

module.exports = FBProcess;