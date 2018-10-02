const db = require('./database/database.controller');
const mongoose = require('mongoose');

const GenerateSchema = require('generate-schema');

let dataQueue = [];

function queueData(data) {
  dataQueue.push(data);
}

function generateData(modelName) {
  return new Promise((resolve, reject) => {
    const returnData = {};

    for (let i = 0; i < dataQueue.length; i += 1) {
      const data = dataQueue[i];
      const existing = returnData[data.name];

      if (!existing) {
        returnData[data.name] = data.value;
      } else if (returnData[data.name] !== data.value) {
        reject('duplicate key names but different values.');
      }
    }

    let NewModel = null;
    try {
      NewModel = mongoose.model(modelName);
    } catch (error) {
      const schema = GenerateSchema.mongoose([returnData]);
      NewModel = mongoose.model(modelName, schema[0]);
    }

    const dataModel = new NewModel(returnData);

    db.save(dataModel).then((model) => {
      dataQueue = [];
      resolve(model);
    }).catch((error) => {
      reject(error);
    });
  });
}

module.exports = {
  queueData,
  generateData
};
