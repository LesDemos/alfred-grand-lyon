'use strict';

/*
  fb-menu.js
  
  Menu process
*/

const FBProcess = require('./fb-process');
const requestGlobal = require('request');
const util = require('util');

// States
const STATE = {
  INITIAL: FBProcess.CONST.STATE.INITIAL,
  MENU: 'state_menu'
};

// Commands
const CMD = {
  REPORT: {
    REPLY: 'Signaler',
    POSTBACK: 'MENU_REPORT'
  },
  MY_REPORTS: {
    REPLY: 'Mes signalements',
    POSTBACK: 'MENU_MY_REPORTS'
  },
  MAP: {
    REPLY: 'Carte signalements',
    URL: 'http://alfred-grand-lyon.herokuapp.com/api/map'
  }
};

function FBMenu(options) {
  if (!(this instanceof FBMenu)) {
    return new FBMenu(options);
  }

  options = options || {};
  options.name = FBProcess.CONST.PROCESS.MENU;
  FBProcess.call(this, options);
}

util.inherits(FBMenu, FBProcess);

FBMenu.prototype.handleMessageState = function(options) {
  options = options || {};

  switch (options.state) {
    case STATE.INITIAL:
      this.sendMenu(options);
      break;
    case STATE.MENU:
      switch (options.type) {
        case 'postback':
          this.handlePostback(options);
          break;
        default:
          this.unknownCommand(options);
      }
      break;
    default:
      this.unknownCommand(options);
  }
};

// Send the menu form to the user
FBMenu.prototype.sendMenu = function(options) {
  options = options || {};

  const buttons = [];
  buttons.push(this.bot.botly.createPostbackButton(CMD.REPORT.REPLY, CMD.REPORT.POSTBACK));
  buttons.push(this.bot.botly.createPostbackButton(CMD.MY_REPORTS.REPLY, CMD.MY_REPORTS.POSTBACK));
  buttons.push(this.bot.botly.createWebURLButton(CMD.MAP.REPLY, CMD.MAP.URL));

  this.bot.botly.sendGeneric({
    id: options.user_id,
    elements: [{
      title:"Bienvenue au menu",
      buttons: buttons
    }]
  });

  options.state = STATE.MENU;
  this.transitionState(options);
};

FBMenu.prototype.handlePostback = function(options) {
  options = options || {};

  switch(options.postback) {
    case CMD.REPORT.POSTBACK:
      this.reportCommand(options);
      break;
    case CMD.MY_REPORTS.POSTBACK:
      this.myReportsCommand(options);
      break;
    default:
      this.unknownCommand(options);
  }
};

// Report command => transition to report process
FBMenu.prototype.reportCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.REPORT;
  this.transitionProcess(options);
};

// My reports command => Display user's reports
FBMenu.prototype.myReportsCommand = function(options) {
  options = options || {};

  // Fetch user reports from ES
  requestGlobal.post(
  {
    url: `${this.bot.api_url}/api/reports`,
    form: {
      "filters": [
        {
          "type": "user_id",
          "user_id": options.user_id
        }
      ]
    },
    json: true
  }, (err, res, body) => {
    if(err || res.statusCode != 200) {
      throw (err);
    } else {
      console.log(`Fetched reports for user ${options.user_id}`);

      let listElements = [];

      for (let i = 0; i < 4 && i < body.features.length; ++i) {
        let props = body.feature[i].properties;

        let date = new Date(props.date);
        date = [
          date.getDate().padLeft(),
          (date.getMonth() + 1).padLeft(),
          date.getFullYear()
        ].join('/');

        let title = `Signalé le ${date}`;
        let image = props.image;
        let status = props.state;

        switch (status) {
          case "Untreated":
            title += '- En attente';
            break;
          case "In progress":
            title += '- En cours';
            break;
          case "Done":
            title += '- Résolu';

            if (props.date_final) {
              let date_final = new Date(props.date_final);
              date_final = [
                date_final.getDate().padLeft(),
                (date_final.getMonth() + 1).padLeft(),
                date_final.getFullYear()
              ].join('/');

              title += ` le ${date_final}`;
            }

            if (props.image_final) {
              image = props.image_final;
            }
            break;
        }

        let subtitle = '';
        for (let j = 0; j < props.hashtags.length; ++j) {
          let hashtag = props.hashtags[j];
          subtitle += `#${hashtag} `;
        }
        
        let listElement = this.bot.botly.createListElement({
          title: title,
          image_url: image,
          subtitle: subtitle
        });

        listElements.push(listElement);
      }

      this.bot.botly.sendList({
        id: options.user_id,
        elements: listElements
      });
    }
  });
};

// Unknown/Unexpected command
FBMenu.prototype.unknownCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.MENU;
  this.transitionProcess(options);
};

Number.prototype.padLeft = function(base,chr){
  var  len = (String(base || 10).length - String(this).length)+1;
  return len > 0? new Array(len).join(chr || '0')+this : this;
};

module.exports = FBMenu;