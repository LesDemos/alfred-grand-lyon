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

//const fs = require('fs');

// This is the URL of a search for the latest tweets on the #hashtag.
//var hastagSearch = { q: "#hashtag", count: 10, result_type: "recent" };

// A user stream
var stream = T.stream('user');

//to change
user = 'Epakza';

stream.on('tweet', tweetEvent);


function tweetEvent(tweet) {

    // Who sent the tweet?
    var name = tweet.user.screen_name;
    
    // What is the text?
    var txt = tweet.text;

    // Who is this in reply to?
    var reply_to = tweet.in_reply_to_screen_name;
    if(!reply_to || reply_to !== user) {
        return;
    }

    console.log(reply_to, name, txt);
    //console.log(tweet);

    /*var json = JSON.stringify(tweet,null,2);
    fs.writeFileSync("tweet2.json", json);*/


    var coordinates = tweet.coordinates;
    if(coordinates) {
        console.log(coordinates);
    }
    else {
        console.log("Erreur coordonnees GPS")
        return;
    }

    var media = tweet.entities.media[0];
    console.log(media);
    if(!media ||
        media.type !== "photo" ||
        !media.media_url ||
        media.media_url === "") {
        console.log("Erreur media");
        return;
    }

    requestImage.get(media.media_url, function (err, res, buffer) {
        if (!err && res.statusCode == 200) {
            let image_64 = "data:" + res.headers["content-type"] + ";base64," + new Buffer(buffer).toString('base64');
            console.log(image_64);
        } else {
            console.log("Error :" + err);
            return;
        }
    });  
}