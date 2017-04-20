"use strict"
// Node modules
const express = require('express');
const Bot = require('messenger-bot');
const bodyParser = require('body-parser');

// Included files
let client = require('./connection.js');
let chatbotdb = require('./chatbotdb.js');

// Environment variables
const port = process.env.PORT;
const FB_TOKEN = process.env.FB_TOKEN;
const FB_VERIFY = process.env.FB_VERIFY;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

// Global variables
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
  let senderid = payload.sender.id;

  var reportsCollection = chatbotdb.collection('reports');
  var report = {
    fb_id: senderid,
    text: text
  };
  reportsCollection.insert(report, function(err, res) {});

  reply({
      text
    }, (err) => {
      if (err) {
        console.log(err.message);
      }

      console.log(`Echoed back : ${text}`);
    }
  );
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.listen(port, function() {
  console.log('Listening on port ' + port);
});

app.get('/', function(req, res) {
  console.log('Received request on /');
  res.status(200).send('Hello Alfred!');
});

app.get('/bot/fb', (req, res) => {
  return bot._verify(req, res);
});

app.post('/bot/fb', (req, res) => {
  bot._handleMessage(req.body);
  res.end(JSON.stringify({status: 'ok'}));
});

app.get('/es/init', (req, res) => {
  let name = (req.param('name') || "koala");
  client.index({
    index: 'request',
    type: 'facebook',
    body: {
      "ConstituencyName": name,
      "ConstituencyID": "E14000761",
      "ConstituencyType": "Borough",
      "Electorate": 74499,
      "ValidVotes": 48694,
    }
  },function(err,resp,status) {
    console.log(resp);
    if(!err){
      res.status(200).send(name + "added");
    }
  });

});
