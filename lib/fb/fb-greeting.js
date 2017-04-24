'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

const STATE = {
  INITIAL: FBProcess.CONST.STATE.INITIAL
};

const CMD = {
  MENU: {
    TEXT: ['MENU', 'OPTIONS', 'CHOIX']
  },
  REPORT: {
    TEXT: ['SIGNALER', 'SIGNALE', 'INCIDENT']
  }
};

const UNKNOWN_CMD_MSG = [
  'Je n\'ai pas compris',
  'Comment puis-je vous aider ?',
  'Veuillez indiquer l\'action souhaitée',
];

function FBGreeting(options) {
  if (!(this instanceof FBGreeting)) {
    return new FBGreeting(options);
  }

  options = options || {};
  options.name = FBProcess.CONST.PROCESS.GREETING;
  FBProcess.call(this, options);
}

util.inherits(FBGreeting, FBProcess);

FBGreeting.prototype.handleMessageState = function(options) {
  options = options || {};

  switch (options.state) {
    case STATE.INITIAL:
      console.log('greetings initial state');
      switch (options.type) {
        case 'message':
          console.log('greetings message : ' + options.data.text);
          this.handleUserMessage(options);
          break;
        case 'postback':
          console.log('greetings postback');
          this.handlePostback(options);
          break;
        default:
          console.log('greetings default type behaviour');
          this.unknownCommand(options);
      }
      break;
    default:
      console.log('greetings default state behaviour');
      this.unknownCommand(options);
  }
};

FBGreeting.prototype.handleUserMessage = function(options) {
  options = options || {};
  const text = options.data.text.toUpperCase();

  console.log('greetings searching for cmd with text: ' + text);

  CMD.MENU.TEXT.forEach((cmdText) => {
    if (text.includes(cmdText)) {
      console.log('greetings cmd found : ' + cmdText);
      this.menuCommand(options);
      return;
    }
  });

  console.log('greetings didn\'t find menu cmd');

  CMD.REPORT.TEXT.forEach((cmdText) => {
    if (text.includes(cmdText)) {
      this.reportCommand(options);
      return;
    }
  });

  console.log('greetings didn\'t find report cmd');

  this.unknownCommand(options);
};

FBGreeting.prototype.handlePostback = function(options) {
  options = options || {};

  // TODO: handler postback (quick replies)
};

FBGreeting.prototype.menuCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.MENU;
  this.transitionProcess(options);
};

FBGreeting.prototype.reportCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.REPORT;
  this.transitionProcess(options);
};

FBGreeting.prototype.unknownCommand = function(options) {
  options = options || {};
  const text = UNKNOWN_CMD_MSG[Math.floor(Math.random() * UNKNOWN_CMD_MSG.length)];

  console.log('greetings unknow command : ' + text);
  console.log('greetings message was: ' + options.data.text);

  this.bot.botly.sendText({
    id: options.user_id,
    text: text
  });

  // TODO: Send quick replies
};

module.exports = FBGreeting;