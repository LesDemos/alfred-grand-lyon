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
  MAIN_CATEGORY:  {
    STATE: 'state_main_category',
    FIRST_MESSAGE: ['Quelle est la nature de la gêne ?', 'Décrivez la dégradation'],
    ERROR_MESSAGE: ['Veuillez sélectionner une des catégories proposées']
  },
  OPTIONAL_CATEGORIES: {
    STATE: 'state_optional_categories',
    FIRST_MESSAGE: ['Souhaitez-vous donner plus de précisions ? (ceci est optionnel)']
  },
  POSITION: {
    STATE: 'state_position',
    FIRST_MESSAGE: ['Où avez-vous repéré cet incident ?', 'Où se trouve cette gêne ?'],
    ERROR_MESSAGE: ['Veuillez vous servir de la géolocalisation', 'Veuillez utiliser la fonction de géolocalisation']
  },
  PHOTO: {
    STATE: 'state_photo',
    FIRST_MESSAGE: ['Veuillez prendre en photo l\'incident', 'Veuillez déposer une photo de la dégradation'],
    ERROR_MESSAGE: ['J\'attends une photo', 'Je vous prie d\'envoyer une photo']
  }
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
      break;
    case STATE.MAIN_CATEGORY.STATE:
      this.handleMainCategory(options);
      break;
    case STATE.OPTIONAL_CATEGORIES.STATE:
      this.handleOptionalCategories(options);
      break;
    case STATE.POSITION.STATE:
      switch (options.type) {
        case 'message':
          this.handlePosition(options);
          break;
        default:
          this.requestPosition(options);
      }
      break;
    case STATE.PHOTO.STATE:
      switch (options.type) {
        case 'message':
          this.handlePhoto(options);
          break;
        default:
          this.requestPhoto(options);
      }
      break;
    default:
      this.unknownCommand(options);
  }
};

/*Handle the incoming position*/
FBReport.prototype.handlePosition = function(options) {
  options = options || {};

  console.log(JSON.stringify(options.data));
  
  if(options.data.attachments
      && options.data.attachments.location
      && options.data.attachments.location.length === 1
      && options.data.attachments.location[0].lat
      && options.data.attachments.location[0].long) {
    let position = {
      lat: options.data.attachments.location[0].lat,
      lon: options.data.attachments.location[0].long
    };
    
    this.savePosition(options, position);
    options.first = true;
    this.requestPhoto(options);
  } else {
    this.requestPosition(options);
  }
};

/*Handle the incoming image*/
FBReport.prototype.handlePhoto = function(options) {
  options = options || {};

  console.log(JSON.stringify(options.data));

  if(options.data.attachments
      && options.data.attachments.image
      && options.data.attachments.image.length === 1
      && options.data.attachments.image[0]) {
    this.encodeImage(options.data.attachments.image[0], options);
  } else {
    this.requestPhoto(options);
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
      text: this.pickMessage(STATE.MAIN_CATEGORY.FIRST_MESSAGE),
      quick_replies: categoriesReplies
    });

    options.state = STATE.MAIN_CATEGORY.STATE;
    this.transitionState(options);
  });
};

FBReport.prototype.handleMainCategory = function(options) {
  options = options || {};

  switch (options.type) {
    case 'postback':
      options.category = options.postback;
      this.saveCategory(options, () => {
        this.requestOptionalCategories(options);
      });
      break;
    case 'message':
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
          text: this.pickMessage(STATE.MAIN_CATEGORY.ERROR_MESSAGE),
          quick_replies: categoriesReplies
        });
      });
      break;
    default:
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
      options.first = true;
      this.requestPosition(options);
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
        text: this.pickMessage(STATE.OPTIONAL_CATEGORIES.FIRST_MESSAGE),
        quick_replies: categoriesReplies
      });

      options.state = STATE.OPTIONAL_CATEGORIES.STATE;
      this.transitionState(options);
    } else {
      options.first = true;
      this.requestPosition(options);
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
          options.first = true;
          this.requestPosition(options);
          break;
        default:
          options.category = options.postback;
          this.saveCategory(options, () => {
            this.requestOptionalCategories(options);
          });
      }
      break;
    case 'message':
      options.category = options.data.text;
      this.saveCategory(options, () => {
        this.requestOptionalCategories(options);
      });
      break;
    default :
      break;
  }
};

FBReport.prototype.saveCategory = function(options, callback) {
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
FBReport.prototype.requestPhoto = function(options) {
  options = options || {};

  if (options.first) {
    this.bot.botly.sendText({
      id: options.user_id,
      text: this.pickMessage(STATE.PHOTO.FIRST_MESSAGE)
    });

    options.state = STATE.PHOTO.STATE;
    this.transitionState(options);
  } else {
    this.bot.botly.sendText({
      id: options.user_id,
      text: this.pickMessage(STATE.PHOTO.ERROR_MESSAGE)
    });
  }
};

// Ask the user to send their position
FBReport.prototype.requestPosition = function(options) {
  options = options || {};

  if (options.first) {
    this.bot.botly.sendText({
      id: options.user_id,
      text: this.pickMessage(STATE.POSITION.FIRST_MESSAGE),
      quick_replies: [this.bot.botly.createShareLocation()]
    });

    options.state = STATE.POSITION.STATE;
    this.transitionState(options);
  } else {
    this.bot.botly.sendText({
      id: options.user_id,
      text: this.pickMessage(STATE.POSITION.ERROR_MESSAGE),
      quick_replies: [this.bot.botly.createShareLocation()]
    });
  }
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

FBReport.prototype.pickMessage = function(array) {
  array = array || [];
  let msg = null;

  if (array.length > 0) {
    msg = array[Math.floor(Math.random() * array.length)];
  }

  return msg;
}

module.exports = FBReport;