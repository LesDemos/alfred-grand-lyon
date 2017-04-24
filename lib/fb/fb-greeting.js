'use strict';

/*
  fb-greeting.js
  
  This process shall be the first process encountered by a new user of the chat.
  This is the process all other processes will fall back to.
*/

const FBProcess = require('./fb-process');
const util = require('util');

// States
const STATE = {
  INITIAL: FBProcess.CONST.STATE.INITIAL
};

// Commands
const CMD = {
  MENU: {
    TEXT: ['MENU', 'OPTIONS', 'CHOIX']
  },
  REPORT: {
    TEXT: ['SIGNALER', 'SIGNALE', 'INCIDENT']
  }
};

// Messages to send to the user if the command was not understood/expected
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
      break;
    default:
      this.unknownCommand(options);
  }
};

FBGreeting.prototype.handleUserMessage = function(options) {
  options = options || {};
  const text = options.data.text.toUpperCase();

  // Search whether or not the incoming message has a specifi command

  for (let i = 0; i < CMD.MENU.TEXT.length; ++i) {
    if (text.includes(CMD.MENU.TEXT[i])) {
      this.menuCommand(options);
      return;
    }
  }

  for (let i = 0; i < CMD.REPORT.TEXT.length; ++i) {
    if (text.includes(CMD.REPORT.TEXT[i])) {
      this.reportCommand(options);
      return;
    }
  }

  this.unknownCommand(options);
};

FBGreeting.prototype.handlePostback = function(options) {
  options = options || {};

  // TODO: handler postback (quick replies)
};

// Menu command => transition to menu process
FBGreeting.prototype.menuCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.MENU;
  this.transitionProcess(options);
};

// Report command => transition to report process
FBGreeting.prototype.reportCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.REPORT;
  this.transitionProcess(options);
};

// Unknown/Unexpected command
FBGreeting.prototype.unknownCommand = function(options) {
  options = options || {};
  const text = UNKNOWN_CMD_MSG[Math.floor(Math.random() * UNKNOWN_CMD_MSG.length)];

  this.bot.botly.sendText({
    id: options.user_id,
    text: text
  });

  // TODO: Send quick replies
};

module.exports = FBGreeting;