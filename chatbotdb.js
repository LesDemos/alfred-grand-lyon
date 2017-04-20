"use strict"
const MONGODB_URI = process.env.MONGODB_URI;
const mongojs = require('mongojs');

var chatbotdb = mongojs(MONGODB_URI);

module.exports = chatbotdb;