const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  createdAt: {
    type: Date
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

// eslint-disable-next-line func-names
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    next();
  } else {
    bcrypt.genSalt(10, (saltError, salt) => {
      if (saltError) {
        next();
      }
      bcrypt.hash(this.password, salt, (hashError, hash) => {
        if (hashError) {
          next();
        }
        this.password = hash;
        next();
      });
    });
  }
});

module.exports = mongoose.model('User', userSchema);
