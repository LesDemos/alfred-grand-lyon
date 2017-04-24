'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

const STATE = {
  INITIAL: FBProcess.CONST.STATE.INITIAL,
  MENU: 'state_menu'
};

const CMD = {
  REPORT: {
    TEXT: ['SIGNALER', 'SIGNALE', 'INCIDENT']
  }
};

function FBMenu(options) {
  if (!(this instanceof FBMenu)) {
    return new FBMenu(options);
  }

  options = options || {};
  options.name = FBProcess.CONST.PROCESS.MENU;
  FBProcess.call(this, options);
}

util.inherits(FBMenu, FBProcess);

FBMenu.prototype.handleMessageState = function(options) {
  options = options || {};

  switch (options.state) {
    case STATE.INITIAL:
      console.log('menu initial state');
      this.sendMenu(options);
      break;
    case STATE.MENU:
      switch (options.type) {
        case 'message':
          console.log('menu message : ' + options.data.text);
          this.handleUserMessage(options);
          break;
        case 'postback':
          console.log('menu postback');
          this.handlePostback(options);
          break;
        default:
          console.log('menu default type');
          this.unknownCommand(options);
      }
      break;
    default:
      console.log('menu default state');
      this.unknownCommand(options);
  }
};

FBMenu.prototype.sendMenu = function(options) {
  options = options || {};

  // TODO: send the real menu (template etc.)

  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Bienvenue au menu!'
  });

  options.state = STATE.MENU;
  this.transitionState(options);
};

FBMenu.prototype.handleUserMessage = function(options) {
  options = options || {};
  const text = options.data.text.toUpperCase();

  console.log('menu searching for cmd with text: ' + text);

  for (let i = 0; i < CMD.REPORT.TEXT.length; ++i) {
    if (text.includes(CMD.REPORT.TEXT[i])) {
      console.log('greetings cmd found : ' + CMD.REPORT.TEXT[i]);
      this.reportCommand(options);
      return;
    }
  }

  console.log('menu didn\'t find report cmd');

  this.unknownCommand(options);
};

FBMenu.prototype.handlePostback = function(options) {
  options = options || {};

  // TODO: handler postback (menu options)
};

FBMenu.prototype.reportCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.REPORT;
  this.transitionProcess(options);
};

FBMenu.prototype.unknownCommand = function(options) {
  options = options || {};

  console.log('menu command unknown: ' + options.data.text);

  options.proc = FBProcess.CONST.PROCESS.GREETING;
  this.transitionProcess(options);
};

module.exports = FBMenu;