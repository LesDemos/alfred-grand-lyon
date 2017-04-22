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

  const options = options || {};
  this.db = mongojs(options.db_uri || process.env.MONGODB_URI);
  this.db_col = this.db.collection(options.db_col || uuid());
  this.bot = new Botly({
    accessToken: options.access_token || process.env.FB_TOKEN,
    verifyToken: options.verify_token || process.env.FB_VERIFY
  });

  this.bot.on('error', (err) => {
    console.log(err.message);
  });

  this.bot.on('message', (user_id, message, data) => {
    console.log('received message');
    const options = {
      type: 'message'
      message: message,
      data: data
    };
    this._handleMessage(user_id, options);
  });

  this.bot.on('postback', (user_id, message, postback) => {
    console.log('received postback');
    const options = {
      type: 'postback'
      message: message,
      postback: postback
    };
    this._handleMessage(user_id, options);
  });
}

FBBot.prototype.addProcess = function(proc, is_main) {
  if (proc instanceof FBProcess) {
    proc.db_col = this.db.collection(proc.name);
    proc.bot = this;
    procs[proc.name] = proc;

    if (is_main) {
      this.main_proc = proc;
    }
  }
};

FBBot.prototype._handleMessage = function(user_id, options) {
  this.db_col.findOne({fb_id: user_id}, (err, user_cur_proc) => {
    if (err) {
      throw err;
    }

    if (user_cur_proc) {
      if (this.procs[user_cur_proc.proc]) {
        this.procs[user_cur_proc].handleMessage(user_id, options);
      } else {
        this.main_proc.handleMessage(user_id, options);
      }
    } else {
      this.main_proc.handleMessage(user_id, options);
    }
  });
};

module.exports = FBBot;