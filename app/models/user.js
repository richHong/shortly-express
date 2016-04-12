var db = require('../config');
var Link = require('./link.js')
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'user',
  initialize: function(){
    this.on('creating', function(user, pass){
      var hashPass = bycrypt.hashSync(pass);
    })
  },
  
  link: function() {
    return this.hasMany(Link, 'user_id');
  },
});

module.exports = User;