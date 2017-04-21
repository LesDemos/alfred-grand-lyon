"use strict"
// Node modules
const express = require('express');
const Bot = require('botly');

// API Elasticsearch
const esdb = require('./esdb.js');

// Chatbot MongoDB
const chatbotdb = require('./chatbotdb.js');

// Environment variables
const PORT = process.env.PORT;
const FB_TOKEN = process.env.FB_TOKEN;
const FB_VERIFY = process.env.FB_VERIFY;
const FB_APP_SECRET = process.env.FB_APP_SECRET;

// Express
const app = express();

// Facebook Bot
const bot = new Botly({
  accessToken: FB_TOKEN,
  verifyToken: FB_VERIFY,
  webHookPath: '/bot/fb/'
});

const menuButtons = [
  {
    "type": "postback",
    "title": "Signaler",
    "payload": "QUERY_PAYLOAD"
  },
  {
    "type": "postback",
    "title": "Pannes autour de toi",
    "payload": "MAP_PAYLOAD"
  },
  {
    "type": "postback",
    "title": "Contacter un agent",
    "payload": "CONTACT_PAYLOAD"
  },
  {
    "type": "postback",
    "title": "Mes signalisations",
    "payload": "USER_QUERIES_PAYLOAD"
  },
  {
    "type": "web_url",
    "title": "Infos Métropole",
    "url": "https://www.grandlyon.com/"
  }
];

bot.setPersistentMenu(menuButtons);

bot.on('error', (err) => {
  console.log(err.message);
});

bot.on('message', (sender, message, data) => {
  const reportsCollection = chatbotdb.collection('reports');
  const report = {
    fb_id: sender,
    text: data.text
  };
  reportsCollection.insert(report, function(err, res) {});

  bot.sendText({
    id: sender,
    text: data.text
  });
});

bot.on('postback', function(userId, payload){

    if (payload == "QUERY_PAYLOAD") {
        importPicture(userId);
    }
     
});

function importPicture(userId){
  
  const messageData = {
    template_type:"generic",
    elements:[
      {
        title:"Importer image",
        subtitle:"",
        image_url:"https://cdn0.iconfinder.com/data/icons/command-buttons/512/Download-512.png",
        buttons:[{
          type:"postback",
          title:"Importer",
          payload:"IMPORT_PIC_PLAYLOAD",
        }],
      },
      {
        title:"Prendre photo",
        subtitle:"",
        image_url:"https://1.bp.blogspot.com/-NmEv1_UgXpU/VAFDFCXII4I/AAAAAAAADPc/B8xVJHihGTs/s1600/camera%2Bicon%2Bin%2BGalaxy%2BS5.png",
        buttons:[{
          type:"postback",
          title:"Prendre",
          payload:"TAKE_PIC_PLAYLOAD",
        }]
      }
    ]
  };

  bot.sendAttachment({
    id: userId,
    type: Botly.CONST.ATTACHMENT_TYPE.TEMPLATE,
    payload: messageData
  }, (err, data) {
    if (err) {
      throw err;
    }

    console.log('Successfully sent attachment to user ' + userId);
  });
}

app.use('/bot/fb/', bot.router());

app.get('/', function(req, res) {
  console.log('Received request on /');
  res.status(200).send('Hello Alfred!');
});

app.get('/es/init', (req, res) => {
  let name = (req.param('name') || "koala");
  esdb.index({
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

app.listen(PORT, function() {
  console.log('Listening on port ' + PORT);
});