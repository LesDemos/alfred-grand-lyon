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
    REPLY: 'Signaler',
    POSTBACK: 'MENU_REPORT'
  },
  MY_REPORTS: {
    REPLY: 'Mes signalements',
    POSTBACK: 'MENU_MY_REPORTS'
  },
  MAP: {
    REPLY: 'Carte signalements',
    URL: 'http://alfred-grand-lyon.herokuapp.com/api/map'
  },
  INFOS: {
    REPLY: 'Services Grand Lyon',
    URL: 'https://www.grandlyon.com/services/tous-nos-services.html'
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

  const buttons = [];
  buttons.push(this.bot.botly.createPostbackButton(CMD.REPORT.REPLY, CMD.REPORT.POSTBACK));
  buttons.push(this.bot.botly.createPostbackButton(CMD.MY_REPORTS.REPLY, CMD.MY_REPORTS.POSTBACK));
  buttons.push(this.bot.botly.createWebURLButton(CMD.MAP.REPLY, CMD.MAP.URL));
  buttons.push(this.bot.botly.createWebURLButton(CMD.INFOS.REPLY, CMD.INFOS.URL));

  this.bot.botly.sendGeneric({
    id: options.user_id,
    elements: [{
      title:"Bienvenue au menu",
      buttons: buttons
    }]
  });

  options.state = STATE.MENU;
  this.transitionState(options);
};

FBMenu.prototype.handlePostback = function(options) {
  options = options || {};

  switch(options.postback) {
    case CMD.REPORT.POSTBACK:
      this.reportCommand(options);
      break;
    case CMD.MY_REPORTS.POSTBACK:
      this.myReportsCommand(options);
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

// My reports command => Display user's reports
FBMenu.prototype.myReportsCommand = function(options) {
  options = options || {};

  
};

// Unknown/Unexpected command
FBMenu.prototype.unknownCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.MENU;
  this.transitionProcess(options);
};

module.exports = FBMenu;