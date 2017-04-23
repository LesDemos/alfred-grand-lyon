'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

function FBGreeting(options) {
  if (!(this instanceof FBGreeting)) {
    return new FBGreeting(options);
  }

  options = options || {};
  options.name = FBProcess.CONST.NAME.GREETING;
  FBProcess.call(this, options);
}

util.inherits(FBGreeting, FBProcess);

FBGreeting.prototype.handleMessageState = function(options) {
  options = options || {};
  console.log('Greetings!');
  console.log('user_id: ' + options.user_id);
  console.log('state: ' + options.state);
  console.log('type: ' + options.type);

  switch (options.type) {
    case 'message':
      this.handleUserMessage(options);
      break;
    case 'postback':
      this.handlePostback(options);
      break;
    default:
      this.unknownCommand(options);
  }
};

FBGreeting.prototype.handleUserMessage = function(options) {
  options = options || {};
  console.log('Handling user message');

  const text = options.data.text;
  if (text) {
    switch (text.toUpperCase()) {
      case 'MENU':
        this.menuCommand(options);
        break;
      case 'SIGNALER':
        this.reportCommand(options);
        break;
      default:
        this.unknownCommand(options);
    }
  }
};

FBGreeting.prototype.handlePostback = function(options) {
  options = options || {};
  console.log('Handling postback');
};

FBGreeting.prototype.menuCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.NAME.MENU;
  this.transitionProcess(options);
};

FBGreeting.prototype.reportCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.NAME.REPORT;
  this.transitionProcess(options);
};

FBGreeting.prototype.unknownCommand = function(options) {
  options = options || {};

  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Je ne comprends pas.'
  });
};

module.exports = FBGreeting;