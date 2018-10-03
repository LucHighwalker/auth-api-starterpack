const db = require('./database/database.controller');
const mongoose = require('mongoose');

const GenerateSchema = require('generate-schema');

let dataQueue = [];

function getModel(modelName, data) {
  try {
    return mongoose.model(modelName);
  } catch (error) {
    const schema = GenerateSchema.mongoose(data);
    return mongoose.model(modelName, schema[0]);
  }
}

function queueData(data) {
  dataQueue.push(data);
}

function queueReset() {
  dataQueue = [];
}

function generateData(modelName, save = true) {
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

    const Model = getModel(modelName, [returnData]);
    const dataModel = new Model(returnData);

    if (save) {
      db.save(dataModel).then(() => {
        queueReset();
        resolve(dataModel);
      }).catch((error) => {
        reject(error);
      });
    } else {
      resolve(dataModel);
    }
  });
}

module.exports = {
  queueData,
  generateData
};
