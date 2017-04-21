"use strict"
const ES_URL = process.env.ES_URL;
var elasticsearch = require('elasticsearch');

var exports = module.exports = {};

var esdb = new elasticsearch.Client( {
  hosts: [
    ES_URL,
  ]
});

