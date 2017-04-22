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

FBGreeting.prototype.handleUserMessage = function(options) {
  const options = options || {};
  console.log('Handling user message');

  if (options.data.text) {
    switch (options.data.text.toUpperCase()) {
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
  const options = options || {};
  console.log('Handling postback');
};

FBGreeting.prototype.menuCommand = function(options) {
  const options = options || {};
  console.log('Menu command');

  this.db_col.insert({
    user_id: options.user_id,
    text: options.data.text
  }, (err, greeting_id) => {
    if (err) {
      throw err;
    }
  });

  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Tu veux le menu !'
  });
};

FBGreeting.prototype.reportCommand = function(options) {
  const options = options || {};
  console.log('Report command');

  this.db_col.insert({
    user_id: options.user_id,
    text: options.data.text
  }, (err, greeting_id) => {
    if (err) {
      throw err;
    }
  });

  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Tu aimes signaler !!!'
  });
};

FBGreeting.prototype.unknownCommand = function(options) {
  const options = options || {};
  console.log('Unknown command');

  this.db_col.insert({
    user_id: options.user_id,
    text: options.data.text
  }, (err, greeting_id) => {
    if (err) {
      throw err;
    }
  });

  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Pas compris...'
  });
};

module.exports = FBGreeting;