'use strict';



const mongoose = require('mongoose');
const bcrypt = require('bluebird').promisifyAll(require('bcrypt'));
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true },
  email: {type: String, required: true, unique: true}
});


userSchema.methods.generateHash = function(password) {
  return bcrypt.hashAsync(password, 10)
    .then((hash) => {
      this.password = hash;
      return this;
    });
};


userSchema.methods.verifyPassword = function(password) {

  return bcrypt.compareAsync(password, this.password)
    .then(res => {
      if(res) return(this);
    });

};


userSchema.methods.generateToken = function() {
  return jwt.sign({ id: this._id }, process.env.APP_SECRET || 't7YaxqZ9ZdkhUF5DJubo3i71pjihz+153onOzAoT');
};



module.exports = mongoose.model('User', userSchema);
