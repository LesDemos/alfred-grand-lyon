'use strict';

/*
  fb-bot.js

  FBBot is a Facebook ChatBot manager. It handles communicating with FB API,
  and takes care of chat processes for each user using the chat.
*/

const FBProcess = require('./fb-process');
const Botly = require('botly');
const uuid = require('uuid/v1');
const mongojs = require('mongojs');

function FBBot(options) {
  if (!(this instanceof FBBot)) {
    return new FBBot(options);
  }

  // List of processes to manage(eg: FBGreeting, FBMenu, etc.)
  this.procs = {};

  /*
    Default process. All other processes will fall back to this one if need be.
    This is the first process a new user will interact with. 
  */
  this.main_proc = {};

  options = options || {};

  // MongoDB database connection where user process data will reside.
  this.db = mongojs(options.db_uri || process.env.MONGODB_URI);

  /*
    MongoDB database collection where user process data will be kept.
    The data will link a Facebook user id with a process id, so that each time we
    receive a message from a user, we're able to retrieve the process in which he's in.
  */  
  this.db_col = this.db.collection(options.db_col || FBProcess.CONST.PROCESS.PROCESS);
  
  // Facebook bot that will take care of communication with the FB API
  this.botly = new Botly({
    accessToken: options.access_token || process.env.FB_TOKEN,
    verifyToken: options.verify_token || process.env.FB_VERIFY
  });

  // Events emitted by the FB bot
  this.botly.on('error', (err) => {
    console.log('Error: ' + err.message);
  });

  this.botly.on('message', (user_id, message, data) => {
    console.log('received message');
    console.log('user_id: ' + user_id);
    console.log('text: ' + data.text);
    const options = {
      type: 'message',
      user_id: user_id,
      message: message,
      data: data
    };

    this.handleMessage(options);
  });

  this.botly.on('postback', (user_id, message, postback) => {
    console.log('received postback');
    console.log('user_id: ' + user_id);
    console.log('postback: ' + postback);
    const options = {
      type: 'postback',
      user_id: user_id,
      message: message,
      postback: postback
    };

    this.handleMessage(options);
  });
}

// Add a process to the list of available processes
FBBot.prototype.addProcess = function(options) {
  options = options || {};
  const proc = options.proc || {};

  // The process should be derived from FBProcess
  if (proc instanceof FBProcess) {
    // MongoDB collection to store user state in the process
    proc.db_col = this.db.collection(proc.name);
    proc.bot = this;
    // Add the newly created process to the list
    this.procs[proc.name] = proc;

    // See whether this should be the main process (fall-back)
    if (options.is_main) {
      this.main_proc = proc;
    }
  }
};

// Register user process and handle the incoming message
FBBot.prototype.startUserProcess = function(options) {
  options = options || {};

  this.db_col.insert({
    user_id: options.user_id,
    proc: options.proc
  }, (err, user_proc_id) => {
    if (err) {
      throw err;
    }

    this.procs[options.proc].handleMessage(options);
  });
}

// Unregister user process
FBBot.prototype.endUserProcess = function(options) {
  options = options || {};

  this.db_col.remove({user_id: options.user_id}, (err, nb_user_proc) => {
    if (err) {
      throw err;
    }
  });
};

// Update user process info (happens when a process has ended and is leading to another)
FBBot.prototype.transitionUserProcess = function(options) {
  options = options || {};

  this.db_col.update(
    {user_id: options.user_id},
    {$set: {proc: options.proc}},
    {upsert: true},
    (err, nb_user_proc, status) => {
      if (err) {
        throw err;
      }

      this.procs[options.proc].handleMessage(options);
    }
  );
};

FBBot.prototype.handleMessage = function(options) {
  options = options || {};

  // Send cues to notify user that their message is being processed
  this.notifyMessageSeen(options.user_id);
  this.notifyWritingMessage(options.user_id);

  // Search for user
  this.db_col.findOne({user_id: options.user_id}, (err, user_proc) => {
    if (err) {
      throw err;
    }

    if (user_proc) {
      // user was found, which means they are in a process
      if (this.procs[user_proc.proc]) {
        this.procs[user_proc.proc].handleMessage(options);
      } else {
        this.main_proc.handleMessage(options);
      }
    } else {
      // user not found, which will trigger the main process
      options.proc = this.main_proc.name;
      this.startUserProcess(options);
    }
  });
};

FBBot.prototype.notifyMessageSeen = function (user_id) {
  this.botly.sendAction({
    id: user_id,
    action: Botly.CONST.ACTION_TYPES.MARK_SEEN
  }, (err, data) => {
    if (err) {
      throw err;
    }
  });
};

FBBot.prototype.notifyWritingMessage = function (user_id) {
  this.botly.sendAction({
    id: user_id,
    action: Botly.CONST.ACTION_TYPES.TYPING_ON
  }, (err, data) => {
    if (err) {
      throw err;
    }
  });
};

module.exports = FBBot;