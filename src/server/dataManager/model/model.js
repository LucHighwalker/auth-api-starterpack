const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  skema: {
    type: Object,
    required: true
  }
});

module.exports = mongoose.model('Model', modelSchema);
