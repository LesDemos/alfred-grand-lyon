'use strict';

const FBProcess = require('./fb-process');
const Botly = require('botly');
const uuid = require('uuid/v1');
const mongojs = require('mongojs');

function FBBot(options) {
  if (!(this instanceof FBBot)) {
    return new FBBot(options);
  }

  this.procs = {};
  this.main_proc = {};

  options = options || {};

  this.db = mongojs(options.db_uri || process.env.MONGODB_URI);
  this.db_col = this.db.collection(options.db_col || FBProcess.CONST.PROCESS.PROCESS);
  this.botly = new Botly({
    accessToken: options.access_token || process.env.FB_TOKEN,
    verifyToken: options.verify_token || process.env.FB_VERIFY
  });

  this.botly.on('error', (err) => {
    console.log('Error: ' + err.message);
  });

  this.botly.on('delivery', (user_id, message, mIds) => {
    console.log('delivery');
    console.log('user_id: ' + user_id);
    console.log('message: ' + message);
    console.log('mIds: ' + mIds);
  });

  this.botly.on('optin', (user_id, message, optin) => {
    console.log('optin');
    console.log('user_id: ' + user_id);
    console.log('message: ' + message);
    console.log('optin: ' + optin);
  });

  this.botly.on('echo', (user_id, message, content, recipient) => {
    console.log('echo');
    console.log('user_id: ' + user_id);
    console.log('message: ' + message);
    console.log('content: ' + content);
    console.log('recipient: ' + recipient);
  });

  this.botly.on('account_link', (user_id, message, link) => {
    console.log('account_link');
    console.log('user_id: ' + user_id);
    console.log('message: ' + message);
    console.log('link: ' + link);
  });

  this.botly.on('referral', (user_id, message, ref) => {
    console.log('referral');
    console.log('user_id: ' + user_id);
    console.log('message: ' + message);
    console.log('ref: ' + ref);
  });

  this.botly.on('sent', (user_id, message) => {
    console.log('sent');
    console.log('user_id: ' + user_id);
    console.log('message: ' + message);
  });

  this.botly.on('message', (user_id, message, data) => {
    console.log('received message');
    console.log('user_id: ' + user_id);
    console.log('message: ' + message);
    console.log('data: ' + data);
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
    console.log('message: ' + message);
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

FBBot.prototype.addProcess = function(options) {
  options = options || {};
  const proc = options.proc || {};

  if (proc instanceof FBProcess) {
    proc.db_col = this.db.collection(proc.name);
    proc.bot = this;
    this.procs[proc.name] = proc;

    if (options.is_main) {
      this.main_proc = proc;
    }
  }
};

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

FBBot.prototype.endUserProcess = function(options) {
  options = options || {};

  this.db_col.remove({user_id: options.user_id}, (err, nb_user_proc) => {
    if (err) {
      throw err;
    }
  });
};

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

  this.notifyMessageSeen(options.user_id);
  this.notifyWritingMessage(options.user_id);

  this.db_col.findOne({user_id: options.user_id}, (err, user_proc) => {
    if (err) {
      throw err;
    }

    if (user_proc) {
      if (this.procs[user_proc.proc]) {
        this.procs[user_proc.proc].handleMessage(options);
      } else {
        this.main_proc.handleMessage(options);
      }
    } else {
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