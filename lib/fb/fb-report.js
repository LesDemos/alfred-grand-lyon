'use strict';

/*
  fb-report.js
  
  Incident report process
*/

const requestImage = require('request').defaults({ encoding: null });
const requestGlobal = require('request');
const FBProcess = require('./fb-process');
const util = require('util');

// States
const STATE = {
  INITIAL: FBProcess.CONST.STATE.INITIAL,
  MAIN_CATEGORY: 'state_main_category',
  OPTIONAL_CATEGORIES: 'state_optional_categories',
  POSITION: 'state_position',
  PHOTO: 'state_photo'
};

// Commands
const CMD = {
  SKIP: {
    REPLY: 'Continuer',
    TEXT: ['CONTINUER', 'PASSER'],
    POSTBACK: 'REPORT_SKIP'
  },
  ABORT: {
    REPLY: 'Annuler',
    TEXT: ['ARRETER', 'STOP', 'ANNULER'],
    POSTBACK: 'REPORT_ABORT'
  }
};

function FBReport(options) {
  if (!(this instanceof FBReport)) {
    return new FBReport(options);
  }

  options = options || {};
  options.name = FBProcess.CONST.PROCESS.REPORT;
  FBProcess.call(this, options);
}

util.inherits(FBReport, FBProcess);

FBReport.prototype.handleMessageState = function(options) {
  options = options || {};

  switch (options.state) {
    case STATE.INITIAL:
      this.requestMainCategory(options);
      //this.sendPositionRequest(options);
      //this.sendPhotoRequest(options);
      break;
    case STATE.MAIN_CATEGORY:
      this.handleMainCategory(options);
      break;
    case STATE.OPTIONAL_CATEGORIES:
      this.handleOptionalCategories(options);
      break;
    case STATE.POSITION:
      switch (options.type) {
        case 'message':        
          // TODO : vérifier intégrité données 
          this.handleUserMessagePosition(options);
          break;
        case 'postback':
          // TODO: handle incoming photo
          break;
        default:
          this.unknownCommand(options);
      }
      break;
    case STATE.PHOTO:
      switch (options.type) {
        case 'message':
         // TODO : vérifier que c'est bien une photo 
          this.handleUserMessageImage(options);
          break;
        case 'postback':
          // TODO: handle incoming photo
          break;
        default:
          this.unknownCommand(options);
      }
      break;
    default:
      this.unknownCommand(options);
  }
};

/*Handle the incoming position*/
FBReport.prototype.handleUserMessagePosition = function(options) {
  options = options || {};
  console.log(JSON.stringify(options.data));
  if(options.data.attachments) {
    let position = {};
    let request_position = options.data.attachments.location;
    if (typeof request_position !== 'undefined') {
      position.lat = request_position[0].lat;
      position.lon = request_position[0].long;
      this.savePosition(options, position);
      this.sendPhotoRequest(options);
    } else {
      this.bot.botly.sendText({
        id: options.user_id, 
        text:'La position envoyée est incorrecte'
      });
      this.sendPositionRequest(options);
    }
  } else {
    options.data.text = "unknown";
    this.unknownCommand(options);
  }
};

/*Handle the incoming image*/
FBReport.prototype.handleUserMessageImage = function(options) {
  options = options || {};
  console.log(JSON.stringify(options.data));
  if(options.data.attachments) {
    let images = null;
    images = options.data.attachments.image;
    if (images != null) {
      this.encodeImage(images[0], options);
    }
  } else {
    this.bot.botly.sendText({
        id: options.user_id, 
        text:'Veuillez envoyer une photo'
    });
    this.sendPhotoRequest(options);
    //options.data.text = "unknown";
    //this.unknownCommand(options);
  }
};

// Ask the user for the main category
FBReport.prototype.requestMainCategory = function(options) {
  options = options || {};

  requestGlobal.get(
  {
    url: `${this.bot.api_url}/api/hashtags`,
    qs: {
      hashtag: ''
    },
    json: true
  }, (err, res, body) => {
    if (err) {
      throw err;
    }

    const hashtags = body.hashtags; 
    const categoriesReplies = [];

    for (let i = 0; i < hashtags.length; ++i) {
      categoriesReplies.push(this.bot.botly.createQuickReply(hashtags[i], hashtags[i]));
    }

    this.bot.botly.sendText({
      id: options.user_id,
      text: 'Choisissez une catégorie principale',
      quick_replies: categoriesReplies
    });

    options.state = STATE.MAIN_CATEGORY;
    this.transitionState(options);
  });
};

FBReport.prototype.handleMainCategory = function(options) {
  options = options || {};

  switch (options.type) {
    case 'postback':
      options.category = options.postback;
      this.addCategory(options, () => {
        this.requestOptionalCategories(options);
      });
      break;
  }
};

FBReport.prototype.requestOptionalCategories = function(options) {
  options = options || {};

  requestGlobal.get(
  {
    url: `${this.bot.api_url}/api/hashtags`,
    qs: {
      hashtag: options.category
    },
    json: true
  }, (err, res, body) => {
    if (err || res.statusCode != 200) {
      throw err;
    }

    const hashtags = body.hashtags;

    if (hashtags.length > 0) {
      const categoriesReplies = [];

      for (let i = 0; i < hashtags.length; ++i) {
        categoriesReplies.push(this.bot.botly.createQuickReply(hashtags[i], hashtags[i]));
      }

      categoriesReplies.push(this.bot.botly.createQuickReply(CMD.SKIP.REPLY, CMD.SKIP.POSTBACK));

      this.bot.botly.sendText({
        id: options.user_id,
        text: 'Choisissez une catégorie secondaire (optionnel)',
        quick_replies: categoriesReplies
      });

      options.state = STATE.OPTIONAL_CATEGORIES;
      this.transitionState(options);
    } else {
      this.sendPositionRequest(options);
    }
  });
};

FBReport.prototype.handleOptionalCategories = function(options) {
  options = options || {};

  options = options || {};

  switch (options.type) {
    case 'postback':
      switch (options.postback) {
        case CMD.SKIP.POSTBACK:
          this.sendPositionRequest(options);
          break;
        default:
          options.category = options.postback;
          this.addCategory(options, () => {
            this.requestOptionalCategories(options);
          });
      }
    break;      
  }
};

FBReport.prototype.addCategory = function(options, callback) {
  options = options || {};

  this.db_col.update(
    {user_id: options.user_id},
    {$addToSet: {categories: options.category}},
    {upsert: true},
    (err, nb_reports, status) => {
      if (err) {
        throw err;
      }

      if (callback) {
        callback();
      }
    }
  );
};

// Ask the user to upload a picture of the incident
FBReport.prototype.sendPhotoRequest = function(options) {
  options = options || {};

  // TODO: change photo request's message
  /*
    NOTE: there's no need to send a form. Facebook will take care of
    the photo, we just have to expect a photo attachment.
  */

  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Veuillez prendre en photo l\'incident'
  });

  options.state = STATE.PHOTO;
  this.transitionState(options);
};

// Ask the user to send their position
FBReport.prototype.sendPositionRequest = function(options) {
  options = options || {};

  this.bot.botly.sendText({
    id: options.user_id, text:'Où avez-vous relevé l\'incident ?',
    quick_replies: [this.bot.botly.createShareLocation()]
  });

  options.state = STATE.POSITION;
  this.transitionState(options);
};

/* Save the user position */
FBReport.prototype.savePosition = function(options, position) {
  options = options || {};

  this.db_col.update(
    {user_id: options.user_id},
    {$set: {position: position}},
    {upsert: true},
    (err, nb_user_proc, status) => {
    if (err) {
      console.log(err);
    }
  }
  );
};

/* Save the user image */
FBReport.prototype.saveImage = function(options, image) {
  options = options || {};

  this.db_col.update(
    {user_id: options.user_id},
    {$set: {image: image}},
    {upsert: true},
    (err, nb_user_proc, status) => {
    if (err) {
      console.log(err);
    } else {
      this.retrieveReport(options);
    }
  }
  );
};

/* Retrieve the user request */
FBReport.prototype.retrieveReport = function(options) {
  this.db_col.find(
    {user_id: options.user_id},
    function (err, docs) {
      if (err) {
        console.log(err);
      } else {
        if(docs.length != 0) {
          let report = { user_id : "",
            image : "",
            position : {},
            hashtags : []
          };
          let doc = docs[0];
          report.user_id = doc.user_id;
          report.image = doc.image;
          if(doc.position != null) {
            report.position.lat = doc.position.lat;
            report.position.lon = doc.position.lon;
          } else {
            report.position = undefined;
          }
          if(doc.categories != null) {
            doc.categories.forEach(function (hashtag) {
              report.hashtags.push(hashtag);
            });
          } else {
            report.hashtags = undefined;
          }

          this.saveReport(options, report);
        }
      }
    }.bind(this));
};

/* Save the user request */
FBReport.prototype.saveReport = function(options, report) {
  requestGlobal.post(
    {
      url: `${this.bot.api_url}/api/request/fb`,
      form: report,
      json: true
    }, function (err, httpResponse, body) {
      if(err || httpResponse.statusCode != 200) {
        console.log(body.toString());
      } else {
        this.endReport(options);
      }
    }.bind(this));
};

/* End the report of processus */
FBReport.prototype.endReport = function(options) {
  this.bot.botly.sendText({
    id: options.user_id,
    text: 'Votre report d\'incident a été pris en compte ! Merci pour votre confiance, ' +
    'nous vous notifierons de sa résolution lorsque le problème aura été réglé.'
  });
  
  options.proc = FBProcess.CONST.PROCESS.MENU;
  this.transitionProcess(options);
};

/* Code an image URL into base 64 */
FBReport.prototype.encodeImage = function(image_url, options) {
  requestImage.get(image_url, function (err, res, buffer) {
    if (!err && res.statusCode == 200) {
      let image_64 = "data:" + res.headers["content-type"] + ";base64," + new Buffer(buffer).toString('base64');
      this.saveImage(options, image_64);
    } else {
      console.log("Error :" + err);
    }
  }.bind(this));
};

// Unknown/Unexpected command
FBReport.prototype.unknownCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.MENU;
  this.transitionProcess(options);
};

module.exports = FBReport;