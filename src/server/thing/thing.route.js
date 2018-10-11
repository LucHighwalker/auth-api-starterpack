const express = require('express');
const controller = require('./thing.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/');

router.get('/scrape', (req, res) => {
  controller.search('card', 'Consuming Aberration').then((json) => {
    res.json({
      json
    });
  }).catch((error) => {
    res.json({
      error
    });
  });
});

// #TODO: Implement thing.route.js.

module.exports = router;
