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
var menuButtons = [
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
bot.setGreetingText({
    "greeting":[
        {
            "locale":"default",
            "text":"Hello {{user_first_name}}!"
        }
    ]}, (err, body) => {
        console.log("greeting", bodyParser);
});
bot.on('postback', function(userId, payload){

    if (payload == "QUERY_PAYLOAD") {
        importPicture(userId);
    }
     
});
function importPicture(userId){
  let messageData = {
    "attachment":{
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements":[
        {
          "title":"Importer image"
          "image_url":"https://cdn0.iconfinder.com/data/icons/command-buttons/512/Download-512.png",
          "buttons":[{
            "type":"postback"
            "title":"Importer"
            "payload":"IMPORT_PIC_PLAYLOAD"
          }],
        },
        {
          "title":"Prendre photo"
          "image_url":"https://1.bp.blogspot.com/-NmEv1_UgXpU/VAFDFCXII4I/AAAAAAAADPc/B8xVJHihGTs/s1600/camera%2Bicon%2Bin%2BGalaxy%2BS5.png",
          "buttons":[{
            "type":"postback"
            "title":"Prendre"
            "payload":"TAKE_PIC_PLAYLOAD"
          }],

        }
        ]
      }
    }
  }
  request({
    url:"https://graph.facebook.com/v2.6/me/messages",
    qs: {access_token:token},
      method: 'POST',
      json: {
        recipient: {id:sender},
        message: messageData,
      }
  },function(error, response, body) {
      if (error) {
        console.log('Error sending messages: ', error)
      } else if (response.body.error) {
        console.log('Error: ', response.body.error)
      }
    })
}
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
