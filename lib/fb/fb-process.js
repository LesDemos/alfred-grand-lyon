'use strict';

/*
  fb-process.js

  FBProcess will take care of all the steps in a specific chat process.
  That includes handling user interaction and state-tracking.

  For example, the process of buying a gift in chat :
    - First, ask the user for the person who they're going to offer the gift to
    - Second, ask the user for his budget
    - Third, ask for credentials, etc.
  
  In that example, the current state of the process for the particular user needs
  to be known at all times. Thus, we make sure to keep, for each user in the current
  process, the state in which they're in.
*/

const uuid = require('uuid/v1');

// This is where we keep the names of all the processes
const PROCESS = {
  PROCESS: 'fb_process',
  GREETING: 'fb_greeting',
  MENU: 'fb_menu',
  REPORT: 'fb_report'
};

// States
const STATE = {
  // A process always starts at the initial state
  INITIAL: 'state_initial'
};

function FBProcess(options) {
  if (!(this instanceof FBProcess)) {
    return new FBProcess(options);
  }

  options = options || {};
  this.name = options.name || uuid();

  // The following properties will be set by FBBot when adding the process
  // MongoDB collection where process state will be stored.
  this.db_col = null;
  // FBBot
  this.bot = null;
}

// Handle incoming message
FBProcess.prototype.handleMessage = function(options) {
  options = options || {};

  // Search whether the user is already in this process
  this.db_col.findOne({user_id: options.user_id}, (err, user_proc_data) => {
    if (err) {
      throw err;
    }

    if (user_proc_data) {
      // user found
      options.state = user_proc_data.state;
      this.handleMessageState(options);
    } else {
      // user not found. The process shall begin in its initial state
      options.state = STATE.INITIAL;
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

// End the process and ask FBBot to fall back to the main process
FBProcess.prototype.endProcess = function(options) {
  options = options || {};

  this.db_col.remove({user_id: options.user_id}, (err, nb_user_proc_data) => {
    if (err) {
      throw err;
    }

    this.bot.endUserProcess(options);
  });
};

// End the process and ask FBBot to transition to another one
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