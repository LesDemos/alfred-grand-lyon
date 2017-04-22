'use strict';

const FBProcess = require('./fb-process');
const Botly = require('botly');
const uuid = require('uuid/v1');
const mongojs = require('mongojs');

function FBBot(options) {
  if (!(this instanceof FBBot)) {
    return new FBBot(options);
  }

  this.main_proc = {};
  this.procs = [];

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

  this.bot.on('message', (sender, message, data) => {
    console.log('received message');


  });

  this.bot.on('postback', (sender, message, postback) => {
    console.log('received postback');
  });
}

FBBot.prototype.addProcess = function(proc) {
  if (proc instanceof FBProcess) {
    proc.db_col = this.db.collection(proc.name);
    proc.bot = this;

    if (proc.is_main) {
      this.main_proc = proc;
    } else {
      this.procs.push(proc);
    }
  }
}

module.exports = FBBot;