var db = require('../config');
var Link = require('./link.js')
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'user',

});

module.exports = User;