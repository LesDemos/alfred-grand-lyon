'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

const STATE = {
  INITIAL: FBProcess.CONST.STATE.INITIAL,
  PHOTO: 'state_photo'
};

function FBReport(options) {
  if (!(this instanceof FBReport)) {
    return new FBReport(options);
  }

  options = options || {};
  options.name = FBProcess.CONST.PROCESS.REPORT;
  FBProcess.call(this, options);
}

util.inherits(FBReport, FBProcess);

FBReport.prototype.handleMessageState = function(options) {
  options = options || {};

  switch (options.state) {
    case STATE.INITIAL:
      this.sendPhotoRequest(options);
      break;
    case STATE.PHOTO:
      switch (options.type) {
        case 'postback':
          // TODO: handle incoming photo
          break;
        default:
          this.unknownCommand(options);
      }
      break;
    default:
      this.unknownCommand(options);
  }
};

FBReport.prototype.sendPhotoRequest = function(options) {
  options = options || {};

  // TODO: change photo request's message
  /*
    NOTE: there's no need to send a form. Facebook will take care of
    the photo, we just have to expect a photo attachment.
  */

  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Veuillez prendre en photo l\'incident'
  });

  options.state = STATE.PHOTO;
  this.transitionState(options);
};

FBReport.prototype.unknownCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.GREETING;
  this.transitionProcess(options);
};

module.exports = FBReport;