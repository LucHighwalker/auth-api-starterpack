const express = require('express');
const controller = require('./auth.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/');

router.post('/signup', (req, res) => {
  controller.signUp(req.body).then((user) => {
    res.json({
      signup: 'success',
      user
    });
  }).catch((error) => {
    res.json({
      signup: 'fail',
      error
    });
  });
});

router.post('/login', (req, res) => {
  controller.logIn(req.body.email, req.body.password).then((user) => {
    res.json({
      login: 'success',
      user
    });
  }).catch((error) => {
    res.json({
      login: 'fail',
      error
    });
  });
});

// #TODO: Implement thing.route.js.

module.exports = router;
