'use strict';

const Botly = require('botly');
const uuid = require('uuid/v1');
const mongojs = require('mongojs');

function FBProcess(options) {
  if (!(this instanceof Botly)) {
    return new FBProcess(options);
  }

  const options = options || {};
  this.name = options.name || uuid();
  this.is_main = options.is_main || false;
}

module.exports = FBProcess;