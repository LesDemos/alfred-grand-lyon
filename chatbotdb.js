"use strict"
const MONGODB_URI = process.env.MONGODB_URI;
const mongodb = require('mongodb');

var chatbotdb;

mongodb.MongoClient.connect(MONGODB_URI, function(err, db) {
  if (err) {
    throw err;
  }
  
  chatbotdb = db;
});

module.exports = chatbotdb;