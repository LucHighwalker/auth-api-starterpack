const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../dataManager/database/database.controller');
const UserModel = require('../models/user');

let curUser = null;

function comparePassword(password, hashedPass) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hashedPass, (err, isMatch) => {
      if (err) {
        reject(err);
      } else {
        resolve(isMatch);
      }
    });
  });
}

function getUser(token) {
  return new Promise((resolve, reject) => {
    let decodedToken = null;
    if (token !== undefined && curUser === null) {
      decodedToken = jwt.decode(token);
      UserModel.findOne({
        _id: decodedToken._id
      }, (err, resp) => {
        if (err) {
          reject(err);
        } else {
          curUser = {
            _id: resp._id,
            email: resp.email
          };
          resolve(curUser);
        }
      });
    } else if (token !== undefined && curUser !== null) {
      resolve(curUser);
    } else {
      curUser = null;
      resolve(null);
    }
  });
}

function logIn(email, password) {
  return new Promise((resolve, reject) => {
    UserModel.findOne({
      email
    }, (err, user) => {
      if (err) {
        reject(err);
      } else if (!user) {
        reject('incorrect');
      } else {
        comparePassword(password, user.password).then((match) => {
          if (match) {
            resolve(user);
          } else {
            reject('incorrect');
          }
        }).catch((error) => {
          reject(error);
        });
      }
    });
  });
}

function signUp(userData) {
  return new Promise((resolve, reject) => {
    const newUser = new UserModel(userData);
    db.save(newUser).then((user) => {
      resolve(user);
    }).catch((error) => {
      reject(error);
    });
  });
}

module.exports = {
  comparePassword,
  getUser,
  logIn,
  signUp
};
