"use strict"
const ES_URL = process.env.ES_URL;
var elasticsearch = require('elasticsearch');

var exports = module.exports = {};

var esdb = new elasticsearch.Client( {
  hosts: [
    ES_URL,
  ]
});

function add_document (index, type, document, id) {
  if (id == null) {
    esdb.index({
      index: index,
      type: type,
      body: document
    }, function (error, response) {
      if(error) {
        console.log("The ElasticSearch server can't save the data");
        console.log(response);
      }
    });
  }
}

function search_document (index, type, query, callback) {
  let document = null;
  esdb.search({
    index: index,
    type: type,
    body: {
      query: query
    }
  },function (error, response, status) {
    if (error){
      console.log("search error: "+error)
    }
    else {
      console.log("--- Response ---");
      console.log(response);
      console.log("--- Hits ---");
      response.hits.hits.forEach(function(hit){
        console.log(hit);
      });
      if(response.hits.hits.length != 0) {
        document = response.hits.hits[0];
      }
    }
    callback(document);
  });
}

exports.add_document = add_document;
exports.search_document = search_document;