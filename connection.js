"use strict"
const ES_URL = process.env.ES_URL;
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client( {
  hosts: [
    ES_URL,
  ]
});

module.exports = client; 