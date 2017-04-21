"use strict"
const ES_URL = process.env.ES_URL;
var elasticsearch = require('elasticsearch');

var exports = module.exports = {};

var esdb = new elasticsearch.Client( {
  hosts: [
    ES_URL,
  ]
});

function add_Document (index, type, document, id) {
  if (id == null) {
    esdb.index({
      index: index,
      type: type,
      body: document
    }, function (error, response) {
      console.log(response);
    });
  }
}

exports.add_Document = add_Document;
