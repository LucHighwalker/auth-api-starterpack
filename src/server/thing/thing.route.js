const express = require('express');
const controller = require('./thing.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/');

router.get('/search', (req, res) => {
  const modelName = req.query.model;
  const searchQuery = req.query.search;

  controller.search(modelName, searchQuery).then((json) => {
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
