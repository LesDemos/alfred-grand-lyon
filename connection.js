"use strict"
var elasticsearch = require('elasticsearch');

var client = new elasticsearch.Client( {
  hosts: [
    'https://4z53u4b5kg:o8hk04e2l8@first-cluster-5558791793.eu-west-1.bonsaisearch.net',
  ]
});

module.exports = client; 