'use strict';

const uuid = require('uuid/v1');

const PROCESS = {
  PROCESS: 'fb_process',
  GREETING: 'fb_greeting',
  MENU: 'fb_menu',
  REPORT: 'fb_report'
};

const STATE = {
  INITIAL: 'state_initial'
};

function FBProcess(options) {
  if (!(this instanceof FBProcess)) {
    return new FBProcess(options);
  }

  options = options || {};
  this.name = options.name || uuid();
  this.db_col = null;
  this.bot = null;
}

FBProcess.prototype.handleMessage = function(options) {
  options = options || {};

  this.db_col.findOne({user_id: options.user_id}, (err, user_proc_data) => {
    if (err) {
      throw err;
    }

    if (user_proc_data) {
      options.state = user_proc_data.state;
      this.handleMessageState(options);
    } else {
      options.state = 0;
      this.db_col.insert({
        user_id: options.user_id,
        state: options.state
      }, (err, user_proc_data_id) => {
        if (err) {
          throw err;
        }

        this.handleMessageState(options);
      });
    }
  });
};

FBProcess.prototype.handleMessageState = function(options) {
  options = options || {};
};

FBProcess.prototype.endProcess = function(options) {
  options = options || {};

  this.db_col.remove({user_id: options.user_id}, (err, nb_user_proc_data) => {
    if (err) {
      throw err;
    }

    this.bot.endUserProcess(options);
  });
};

FBProcess.prototype.transitionProcess = function(options) {
  options = options || {};

  this.db_col.remove({user_id: options.user_id}, (err, nb_user_proc_data) => {
    if (err) {
      throw err;
    }

    this.bot.transitionUserProcess(options);
  });
};

FBProcess.prototype.transitionState = function(options) {
  options = options || {};

  this.db_col.update(
    {user_id: options.user_id},
    {$set: {state: options.state}},
    {upsert: true},
    (err, nb_user_proc, status) => {
      if (err) {
        throw err;
      }
    }
  );
};

FBProcess.CONST = {
  PROCESS: PROCESS,
  STATE: STATE
};

module.exports = FBProcess;