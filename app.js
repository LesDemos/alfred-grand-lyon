"use strict"
const express = require('express');
const Bot = require('messenger-bot');
const bodyParser = require('body-parser');
const port = process.env.PORT;
const FB_TOKEN = process.env.FB_TOKEN;
const FB_VERIFY = process.env.FB_VERIFY;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

let app = express();

let bot = new Bot({
  token: FB_TOKEN,
  verify: FB_VERIFY,
  app_secret: FB_APP_SECRET
});

bot.on('error', (err) => {
  console.log(err.message);
});

bot.on('message', (payload, reply) => {
  let text = payload.message.text;
  reply({
    text
  }, (err) => {
  if (err) {
    console.log(err.message);
  }

  console.log(`Echoed back : ${text}`);
});
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.listen(port, function() {
  console.log('Listening on port ' + port);
});

app.get('/bot/fb', (req, res) => {
  return bot._verify(req, res);
});

app.post('/bot/fb', (req, res) => {
  bot._handleMessage(req.body);
  res.end(JSON.stringify({status: 'ok'}));
});

app.get('/', function(req, res) {
  console.log('Received request on /');
  res.status(200).send('Hello Alfred!');
});

