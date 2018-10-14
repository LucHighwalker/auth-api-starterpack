const db = require('./database/database.controller');
const mongoose = require('mongoose');

const GenerateSchema = require('generate-schema');

const ModelModel = require('./model/model');

let dataQueue = {};

function getModel(modelName, data = null) {
  return new Promise((resolve, reject) => {
    try {
      resolve(mongoose.model(modelName));
    } catch (error) {
      db.getAll(ModelModel, {
        name: modelName
      }).then((models) => {
        if (models.length > 0) {
          try {
            const model = mongoose.model(modelName, models[0].skema);
            resolve(model);
          } catch (modelError) {
            reject(modelError);
          }
        } else if (data !== null) {
          const schema = GenerateSchema.mongoose(data);
          try {
            const newModel = mongoose.model(modelName, schema);
            const modelModel = new ModelModel({
              name: modelName,
              savedSchema: schema
            });
            db.save(modelModel).then(() => {
              resolve(newModel);
            }).catch((saveError) => {
              reject(saveError);
            });
          } catch (newSchemaError) {
            reject(newSchemaError);
          }
        } else {
          resolve(null);
        }
      }).catch((getError) => {
        reject(getError);
      });
    }
  });
}

function queueData(name, data) {
  if (dataQueue[name] === undefined) {
    dataQueue[name] = [];
  }

  dataQueue[name].push(data);
}

function queueReset() {
  dataQueue = {};
}

function generateData(modelName, dataName, save = true) {
  return new Promise((resolve, reject) => {
    const returnData = {};

    for (let i = 0; i < dataQueue[dataName].length; i += 1) {
      const data = dataQueue[dataName][i];
      const existing = returnData[data.name];

      if (!existing) {
        returnData[data.name] = data.value;
      } else if (returnData[data.name] !== data.value) {
        reject('duplicate key names but different values.');
      }
    }

    getModel(modelName, returnData).then((Model) => {
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
    }).catch((error) => {
      reject(error);
    });
  });
}

module.exports = {
  queueData,
  generateData,
  getModel
};
