const express = require('express');
const jwt = require('jsonwebtoken');
const controller = require('./auth.controller');
const helper = require('../helper/helper');
const config = require('../../config/config');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/');

router.get('/signup', (req, res) => {
  helper.render(res, req.cookies.nToken, 'users/signup');
});

router.post('/signup', (req, res) => {
  controller.signUp(req.body).then((user) => {
    logUserIn(res, user);
  }).catch((error) => {
    res.json({
      signup: 'fail',
      error
    });
  });
});

router.get('/login', (req, res) => {
  helper.render(res, req.cookies.nToken, 'users/login');
});

router.post('/login', (req, res) => {
  controller.logIn(req.body.email, req.body.password).then((user) => {
    logUserIn(res, user);
  }).catch((error) => {
    res.json({
      login: 'fail',
      error
    });
  });
});

router.get('/logout', (req, res) => {
  res.clearCookie('nToken');
  res.redirect('/api');
});

function logUserIn(res, user) {
  const token = jwt.sign({
    _id: user._id
  }, config.jwtSecret, {
    expiresIn: '60 days'
  });
  res.cookie('nToken', token, {
    maxAge: 900000,
    httpOnly: true
  });
  res.redirect('/api');
}

// #TODO: Implement thing.route.js.

module.exports = router;
