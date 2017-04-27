'use strict';

/*
  fb-menu.js
  
  Menu process
*/

const FBProcess = require('./fb-process');
const util = require('util');

// States
const STATE = {
  INITIAL: FBProcess.CONST.STATE.INITIAL,
  MENU: 'state_menu'
};

// Commands
const CMD = {
  REPORT: {
    TEXT: ['SIGNALER', 'SIGNALE', 'INCIDENT'],
    POSTBACK: "MENU_REPORT"
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
      this.sendMenu(options);
      break;
    case STATE.MENU:
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

// Send the menu form to the user
FBMenu.prototype.sendMenu = function(options) {
  options = options || {};

  // TODO: send the real menu form (template etc.)


  this.bot.botly.sendGeneric({
    id: options.user_id,
    elements: [{
      title:"Bienvenue au menu",
      buttons: [{
        type: "postback",
        title: "Signaler",
        payload: CMD.REPORT.POSTBACK
      }]
    }]
  });

  options.state = STATE.MENU;
  this.transitionState(options);
};

FBMenu.prototype.handleUserMessage = function(options) {
  options = options || {};
  const text = options.data.text.toUpperCase();

  // Search whether or not the incoming message has a specifi command
  /*
  for (let i = 0; i < CMD.REPORT.TEXT.length; ++i) {
    if (text.includes(CMD.REPORT.TEXT[i])) {
      this.reportCommand(options);
      return;
    }
  }

  this.unknownCommand(options);*/
};

FBMenu.prototype.handlePostback = function(options) {
  options = options || {};

  switch(options.postback) {
    case CMD.REPORT.POSTBACK:
      this.reportCommand(options);
      break;
    default:
      this.unknownCommand(options);
  }


};

// Report command => transition to report process
FBMenu.prototype.reportCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.REPORT;
  this.transitionProcess(options);
};

// Unknown/Unexpected command
FBMenu.prototype.unknownCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.MENU;
  this.transitionProcess(options);
};

module.exports = FBMenu;