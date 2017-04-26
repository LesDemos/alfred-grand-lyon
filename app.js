"use strict"
// Node modules
const express = require('express');
const bodyParser = require('body-parser');

// API Elasticsearch
const data_mng = require('./data_management.js');

// FB ChatBot
const fbBot = require('./fb-chatbot.js');

// Environment variables
const PORT =  process.env.PORT;

// Express
const app = express();
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use('/bot/fb', fbBot.botly.router());

app.get('/', function(req, res) {
  console.log('Received request on /');
  res.status(200).send('Hello Alfred!');
});

app.post('/api/request/fb', (req, res) => {
  let request = req.body;
  data_mng.save_request(request, res);
});

app.get('/api/hashtags', (req, res) => {
  let hashtag = req.query.hashtag;
  if (hashtag != null) {
    data_mng.get_next_hashtags(hashtag, res);
  } else {
    res.status(500).send("The hashtag parameter is missing");
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

app.listen(PORT, function() {
  console.log('Listening on port ' + PORT);
});
