'use strict';

/*
  fb-report.js
  
  Incident report process
*/

const request = require('request').defaults({ encoding: null });
const FBProcess = require('./fb-process');
const util = require('util');
const ExifImage = require('exif').ExifImage;

// States
const STATE = {
  INITIAL: FBProcess.CONST.STATE.INITIAL,
  POSITION: 'state_position',
  PHOTO: 'state_photo'
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
      this.sendPositionRequest(options);
      //this.sendPhotoRequest(options);
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
    if (request_position != null) {
      position.lat = request_position[0].lat;
      position.lon = request_position[0].long;
    }
    this.savePosition(options, position);
    this.sendPhotoRequest(options);
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
      images.forEach(function (image_url) {
        this.encodeImage(image_url, options);
      }, this);
    }
  } else {
    options.data.text = "unknown";
    this.unknownCommand(options);
  }
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
    }
  }
  );
};

/* Code an image URL into base 64 */
FBReport.prototype.encodeImage = function(image_url, options) {
  request.get(image_url, function (err, res, buffer) {
    if (!err && res.statusCode == 200) {
      let image_64 = "data:" + res.headers["content-type"] + ";base64," + new Buffer(buffer).toString('base64');
      this.saveImage(options, image_64);
    } else {
      console.log("Error :" + err);
    }
  }.bind(this));
};

// Check if the GPS data of the image provided is correct
/*FBReport.prototype.check_image = function(image_url) {
  let position = { };
  console.log(image_url);
  try {
    request.get(image_url, function (err, res, buffer) {
      new ExifImage({image: buffer}, function (error, exifData) {
        if (error)
          console.log('Error: ' + error.message);
        else
          console.log(exifData); // Do something with your data!
      });
    });
  } catch (error) {
    console.log('Error: ' + error.message);
  }
}*/


// Unknown/Unexpected command
FBReport.prototype.unknownCommand = function(options) {
  options = options || {};

  options.proc = FBProcess.CONST.PROCESS.MENU;
  this.transitionProcess(options);
};

module.exports = FBReport;