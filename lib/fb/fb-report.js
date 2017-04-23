'use strict';

const FBProcess = require('./fb-process');
const util = require('util');

function FBReport(options) {
  if (!(this instanceof FBReport)) {
    return new FBReport(options);
  }

  options = options || {};
  options.name = FBProcess.CONST.NAME.REPORT;
  FBProcess.call(this, options);
}

util.inherits(FBReport, FBProcess);

FBReport.prototype.handleMessageState = function(options) {
  options = options || {};
  console.log('Report!');
  console.log('user_id: ' + options.user_id);
  console.log('state: ' + options.state);
  console.log('type: ' + options.type);

  switch (options.state) {
    case 0:
      this.bot.botly.sendText({
        id: options.user_id,
        text: 'Prenez une photo'
      });
      options.state = 1;
      this.transitionState(options);
      break;
    case 1:
      switch (options.type) {
        case 'message':
          this.bot.botly.sendText({
            id: options.user_id,
            text: 'report message (jattendais une photo) : '
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

FBReport.prototype.unknownCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.NAME.GREETING;
  this.transitionProcess(options);
};

module.exports = FBReport;