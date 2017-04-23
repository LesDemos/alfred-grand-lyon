"use strict"
// API Elasticsearch
const esmng = require('./esmng.js');
const uuidV1 = require('uuid/v1');

// ES variables
const INDEX_REQUEST = 'request';
const INDEX_HASHTAGS = 'syntax_tree';
const TYPE_FACEBOOK = 'facebook';
const FIRST_HASHTAG = 'Origine';

var exports = module.exports = {};

/*
This function save the request into the ES server. The only parameters contains the image, the user_id, the position,
and the hashtags. The date and the request_id are automatically generated.
 */

function save_request(request) {
  try {
    if (request.hasOwnProperty('user_id') && request.hasOwnProperty('image') && request.hasOwnProperty('position') &&
      request.hasOwnProperty('hashtags')) {
      let key = uuidV1();
      let actual_date = new Date();
      request.request_id = key;
      request.date = actual_date;
      esmng.add_document(INDEX_REQUEST, TYPE_FACEBOOK, request);
    } else {
      throw new Error("The request isn't complete");
    }
  } catch (e) {
    console.log(e);
  }
}

/* The hashtags associated with the parameter are retrieved from the ES Server and returned. */
function get_next_hashtags(hashtag, res) {
  if(hashtag === '') {
    hashtag = FIRST_HASHTAG;
  }
  let query =  {
    match: { "name": hashtag }
  };
  esmng.search_document(INDEX_HASHTAGS, TYPE_FACEBOOK, query, function (hit) {
    let hashtags = { hashtags : [] };
    if (hit != null) {
      hashtags.hashtags = hit._source.following;
    }
    res.json(hashtags);
  });
}

//Exports
exports.save_request = save_request;
exports.get_next_hashtags = get_next_hashtags;