"use strict"
const express = require('express');
const Bot = require('messenger-bot');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const FB_TOKEN = process.env.FB_TOKEN || "EAAUg9WBYPGoBAPZA5ieHDd94OKp55MqZBHEYOyYi3iZCZCRqtcho5XZCZACmzVxm4ZBmKLGEQyMKhyOLknWcA5pwpU4SeZC2afsEmbgfYAOG5PtBRXAGL6ZAPYhGGi7iMVxYF3xDR0s1TFXKyzisKEPcZB8WkuXftErieZBsXR4qcbOjQZDZD";
const FB_VERIFY = process.env.FB_VERIFY || "alfred-grand-lyon";

let app = express();

let bot = new Bot({
  token: FB_TOKEN,
  verify: FB_VERIFY
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

