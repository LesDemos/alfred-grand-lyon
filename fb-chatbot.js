'use strict';

/*
  fb-chatbot.js

  This file's purpose is to set up the Facebook Bot manager (FBBot),
  by creating the necessary chat processes.
*/

const FBBot = require('./lib/fb/fb-bot.js');
const FBProcess = require('./lib/fb/fb-process.js');
const FBMenu = require('./lib/fb/fb-menu.js');
const FBReport = require('./lib/fb/fb-report.js');

const fbBot = new FBBot({
  db_uri: process.env.MONGODB_URI,
  db_col: FBProcess.CONST.PROCESS.PROCESS,
  access_token: process.env.FB_TOKEN,
  verify_token: process.env.FB_VERIFY,
  api_url: process.env.URL
});

fbBot.addProcess({proc: new FBMenu(), is_main: true});
fbBot.addProcess({proc: new FBReport()});

module.exports = fbBot;