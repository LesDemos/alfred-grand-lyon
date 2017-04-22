'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

function FBMenu(options) {
  if (!(this instanceof FBMenu)) {
    return new FBMenu(options);
  }

  const options = options || {};
  options.name = FBProcess.CONST.NAME.MENU;
  options.is_main = true;
  FBProcess.call(this, options);
}

util.inherits(FBMenu, FBProcess);

FBMenu.prototype.handleMessage = function(user_id, options) {
  console.log('FBMenu message handler');
  console.log('Received message type : ' + options.type);
};

module.exports = FBMenu;