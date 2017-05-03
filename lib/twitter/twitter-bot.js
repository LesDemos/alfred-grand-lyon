'use strict';

/*
  twitter-bot.js

  Twit  is a Twitter api manager. It handles communicating with Twitter API.
*/

// Our Twitter library
const Twit = require('twit');

// We need to include our configuration file
const T = new Twit(require('./twit-config.js'));

const request = require('request');
const requestImage = require('request').defaults({ encoding: null });

// Constantes
const TYPE_TWITTER = 'twitter';

var stream;

function TwitBot(username) {
  if (!(this instanceof TwitBot)) {
    return new TwitBot(username);
  }
  
  // API URL
  //console.log(process.env);
  this.api_url = process.env.URL;
  if(!this.api_url) {
    return;
  }
  this.username = username;
}

TwitBot.prototype.run = function() {
    // A user stream
    stream = T.stream('user');
    stream.on('tweet', this.tweetEvent.bind(this));
}

/* Save the user request */
TwitBot.prototype.saveReport = function (options, report) {
  request.post(
    {
      url: `${this.api_url}/api/request/twitter`,
      form: report,
      json: true
    }, function (err, httpResponse, body) {
      if(err) {
        console.log(err.toString());
      } else if(httpResponse.statusCode != 200) {
        console.log(body.toString());
      } else {
        this.endReport(options);
      }
    }.bind(this));
}

TwitBot.prototype.endReport = function(options) {
    // Start a reply back to the sender
    var date = new Date();
    var reply = date.toLocaleString() + " : Merci pour le signalement @" + options.name + ' ' + ' :)';

    // Post that tweet!
    T.post('statuses/update', { status: reply }, this.tweeted);  
}

// Make sure it worked!
TwitBot.prototype.tweeted = function(err, reply) {
    if (err !== undefined) {
        console.log(err);
    } else {
        console.log('Tweeted: ' + reply);
    }
}

TwitBot.prototype.tweetEvent = function(tweet) {
    var options = {};

    // Who is this in reply to?
    var reply_to = tweet.in_reply_to_screen_name;
    if(!reply_to || reply_to !== this.username) {
        return;
    }

    // Who sent the tweet?
    options.name = tweet.user.screen_name;
    
    // What is the text?
    var txt = tweet.text;

    var report = {};

    report.user_id = tweet.user.id;

    report.hashtags = new Array();
    for(var i=0; i < tweet.entities.hashtags.length ; ++i) {
        report.hashtags.push(tweet.entities.hashtags[i].text);
    }

    if(!tweet.coordinates ||
        !tweet.coordinates.coordinates) {
        console.log("Erreur coordonnees GPS");
        return;
    }
    var coordinates = tweet.coordinates.coordinates;
    report.position = {
        "lat" : coordinates[0],
        "lon" : coordinates[1]
    }
    

    if(!tweet.entities.media ||
        !tweet.entities.media[0] ||
        !tweet.entities.media[0].type ||
        !tweet.entities.media[0].media_url ||
        tweet.entities.media[0].media_url === "") {
        console.log("Erreur media");
        return;
    }
    var media = tweet.entities.media[0];

    requestImage.get(media.media_url, function (err, res, buffer) {
        if (!err && res.statusCode == 200) {
            let image_64 = "data:" + res.headers["content-type"] + ";base64," + new Buffer(buffer).toString('base64');
            report.image = image_64;
            this.saveReport(options, report);
        } else {
            console.log("Error :" + err);
            return;
        }
    }.bind(this));  
}

module.exports = TwitBot;