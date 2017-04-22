"use strict"
// Node modules
const express = require('express');
const bodyParser = require('body-parser');
const botly = require('botly');

// API Elasticsearch
const data_mng = require('./data_management.js');

// Chatbot MongoDB
const chatbotdb = require('./chatbotdb.js');

// Environment variables
const PORT =  process.env.PORT;
const FB_TOKEN = process.env.FB_TOKEN;
const FB_VERIFY = process.env.FB_VERIFY;

// Express
const app = express();

// Facebook Bot
const bot = new botly({
  accessToken: FB_TOKEN,
  verifyToken: FB_VERIFY
});

const menuButtons = [
  {
    type: 'postback',
    title: 'Signaler',
    payload: 'QUERY_PAYLOAD'
  },
  {
    type: "postback",
    title: "Pannes autour de toi",
    payload: "MAP_PAYLOAD"
  },
  {
    type: "postback",
    title: "Contacter un agent",
    payload: "CONTACT_PAYLOAD"
  },
  {
    type: "postback",
    title: "Mes signalisations",
    payload: "USER_QUERIES_PAYLOAD"
  },
  {
    type: "web_url",
    title: "Infos Métropole",
    url: "https://www.grandlyon.com/"
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
  reportsCollection.insert(report);

  if(data.text.toUpperCase() === 'SIGNALER'){
      importPicture(sender);
  }
  else{
    bot.sendText({
    id: sender,
    text: data.text
  });
  }
    
});

bot.on('postback', (sender, message, postback) => {
  console.log('postback:', sender, message, postback);
  if(postback==='QUERY_PAYLOAD'){
    importPicture(sender);
  }
});

function importPicture(userId){
   let element = bot.createListElement({
                title: 'Importer image',
                image_url: 'https://cdn0.iconfinder.com/data/icons/command-buttons/512/Download-512.png',
                subtitle: '',
                buttons: [
                    {title: 'Importer', payload: 'IMPORT_PIC_PLAYLOAD'},
                ],
                default_action: {
                    'url': 'www.facebook.com',
                }
            });
   let element2 = bot.createListElement({
                title: 'Prendre photo',
                image_url: 'https://1.bp.blogspot.com/-NmEv1_UgXpU/VAFDFCXII4I/AAAAAAAADPc/B8xVJHihGTs/s1600/camera%2Bicon%2Bin%2BGalaxy%2BS5.png',
                subtitle: '',
                buttons: [
                    {title: 'Prendre', payload: 'TAKE_PIC_PLAYLOAD'},
                ],
                default_action: {
                    'url': 'www.facebook.com',
                }
            });

   bot.sendList({id: userId, elements: [element, element2], buttons: bot.createPostbackButton('Continue', 'continue'), top_element_style: botly.CONST.TOP_ELEMENT_STYLE.LARGE},function (err, data) {
                console.log('send list cb:', err, data);
            });
}

app.get('/', function(req, res) {
  console.log('Received request on /');
  res.status(200).send('Hello Alfred!');
});

app.post('/api/request', (req, res) => {
  let request = req.body;
  data_mng.save_request(request);
  res.send("Request processed");
});

app.get('/api/request', (req, res) => {
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



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/bot/fb', bot.router());

app.listen(PORT, function() {
  console.log('Listening on port ' + PORT);
});
