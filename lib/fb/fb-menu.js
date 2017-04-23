'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

function FBMenu(options) {
  if (!(this instanceof FBMenu)) {
    return new FBMenu(options);
  }

  let options = options || {};
  options.name = FBProcess.CONST.NAME.MENU;
  FBProcess.call(this, options);
}

util.inherits(FBMenu, FBProcess);

FBMenu.prototype.handleMessageState = function(options) {
  let options = options || {};
  console.log('Menu!');
  console.log('user_id: ' + optoins.user_id);
  console.log('state: ' + options.state);
  console.log('type: ' + options.type);

  switch (options.state) {
    case 0:
      this.sendMenu(options);
      options.state = 1;
      this.transitionState(options);
      break;
    case 1:
      switch (options.type) {
        case 'message':
          this.bot.botly.sendText({
            id: options.user_id,
            text: 'menu message : ' + options.data.text
          });
          break;
        case 'postback':
          this.bot.botly.sendText({
            id: options.user_id,
            text: 'menu postback'
          });
          break;
        default:
          this.unknownCommand(options);
      }
      break;
    default:
      this.unknownCommand(options);
  }
};

FBMenu.prototype.sendMenu = function(options) {
  let options = options || {};

  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Bienvenue au menu!'
  });
};

FBMenu.prototype.unknownCommand = function(options) {
  let options = options || {};

  options.proc = FBProcess.CONST.NAME.GREETING;
  this.transitionProcess(options);
};

module.exports = FBMenu;