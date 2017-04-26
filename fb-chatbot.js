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

/*
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
*/

module.exports = fbBot;