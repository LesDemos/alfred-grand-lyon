"use strict"
// Node modules
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const compression = require('compression');

// API Elasticsearch
const data_mng = require('./data_management.js');

// FB ChatBot
const fbBot = require('./fb-chatbot.js');

//TwitBot
const TwitBot = require('./lib/twitter/twitter-bot.js');

// Environment variables
const PORT =  process.env.PORT;

// Express
const app = express();
app.use('/api/static', express.static(__dirname + '/lib/map'));
app.use('/static/admin', express.static(__dirname + '/admin'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors());
app.use(compression());
app.use('/bot/fb', fbBot.botly.router());

// Constantes
const TYPE_FACEBOOK = 'facebook';
const TYPE_TWITTER = 'twitter';

var twitBot = new TwitBot('AlfredGrandLyon');
twitBot.run();

app.get('/', function(req, res) {
  console.log('Received request on /');
  res.status(200).send('Hello Alfred!');
});

app.post('/api/request/fb', (req, res) => {
 let request = req.body;
 data_mng.save_request(request, res, TYPE_FACEBOOK);
});

app.post('/api/request/twitter', (req, res) => {
  let request = req.body;
  data_mng.save_request(request, res, TYPE_TWITTER);
});

app.get('/api/hashtags', (req, res) => {
  let hashtag = req.query.hashtag;
  if (hashtag != null) {
    data_mng.get_next_hashtags(hashtag, res, TYPE_FACEBOOK);
  } else {
    res.status(500).send("The hashtag parameter is missing");
  }
});

app.get('/api/map', (req, res) => {
  res.sendFile(path.join(__dirname+'/lib/map/map.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname+'/admin/index.html'));
});

app.post('/api/reports', (req, res) => {
  let request = req.body;
  data_mng.get_reports_filtered(request, res, TYPE_FACEBOOK);
});

app.post('/api/reports/twitter', (req, res) => {
  let request = req.body;
  data_mng.get_reports_filtered(request, res, TYPE_TWITTER);
});

app.post('/api/reports/state', (req, res) => {
  let request = req.body;
  data_mng.change_state(request, res, TYPE_FACEBOOK, sendResponse);
});

app.get('/api/reports/twitter', (req, res) => {
  let request = {filters : []};
  data_mng.get_reports_filtered(request, res, TYPE_TWITTER);
});

app.post('/api/reports/twitter/state', (req, res) => {
  let request = req.body;
  data_mng.change_state(request, res, TYPE_TWITTER, sendResponse);
});

app.get('/api/user/twitter', (req, res) => {
  let user_id = req.query.user_id;
  let username = req.query.username;
  if(user_id) {
    twitBot.getUserProfile(user_id, username, (err, user_profile) => {
      if (err) {
        throw err;
      }
      res.json(user_profile);
    });
  } else {
    res.status(500).send("The user_id parameter is missing");
  }
});

app.get('/api/user', (req, res) => {
  let user_id = req.query.user_id;
  if(user_id) {
    fbBot.botly.getUserProfile(user_id, (err, user_profile) => {
      if (err) {
        throw err;
      }
      res.json(user_profile);
    });
  } else {
    res.status(500).send("The user_id parameter is missing");
  }
});

/* Example of data to provide to the route /api/request */
app.get('/api/request/fb', (req, res) => {
  let request = {
    "user_id" : "jijdkkosz451",
    "image" : "hbajszjjsiz",
    "position" : {
      "lat" : 48.12,
      "lon" : 45.81,
    },
    "hashtags" : ["hi", "po", "pi"]
  };
  data_mng.save_request(request);
  res.send("Request processed");
});

function sendResponse(err, res, req) {
  if(err != null) {
    res.status(500).send(err.message);
  } else {
    res.json(req);
  }
}

app.listen(PORT, function() {
  console.log('Listening on port ' + PORT);
});
