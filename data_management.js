"use strict"
// API Elasticsearch
const esdb = require('./esdb.js');
const uuidV1 = require('uuid/v1');

/*
This function save the request into the ES server. The only parameters contains the picture, the user_id, the position,
and the hashtags. The date and the request_id are automatically generated.
 */

function save_request(request) {
    if(request.hasOwnProperty('user_id') && request.hasOwnProperty('image') && request.hasOwnProperty('position') &&
      request.hasOwnProperty('hashtags')){
      let key = uuidV1();
      let actual_date = new Date();
      request.request_id = key;
      request.date = actual_date;
      

    } else {
        throw new Error("The request isn't complete");
    }
    return;
}

function get_next_hastag(hashtag) {
    return;
}