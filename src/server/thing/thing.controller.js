const request = require('request');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const dm = require('../dataManager/dataManager.controller');
const db = require('../dataManager/database/database.controller');

const newQuery = require('../testQueries/multipleSites');


// TODO replace model creation with that of data manager's
function search(modelName, searchQuery) {
  return new Promise((resolve, reject) => {
    try {
      const model = mongoose.model(modelName);
      db.getAll(model, {
        Name: searchQuery
      }).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    } catch (err) {
      scrapeData(searchQuery).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    }
  });
}

function pullDataURL(url, pullArray) {
  return new Promise((resolve, reject) => {
    requestAndDo(url, ($, error) => {
      if (error) {
        reject(error);
      } else {
        pullData($, pullArray);
        resolve();
      }
    });
  });
}

function pullData($, pullArray) {
  for (let i = 0; i < pullArray.length; i += 1) {
    const get = pullArray[i].get;
    const from = genIdentifier(pullArray[i].from);

    let data = {};

    switch (get.type) {
      case String:
        if (Array.isArray(get.name)) {
          const values = $(from).toArray();

          for (let o = 0; o < values.length; o += 1) {
            const name = get.name[o] ? get.name[o] : null;

            data.name = name;
            data.value = $(values[o]).text();
            data.value = data.value.trim();
            dm.queueData('testing', data);
            data = {};
          }
        } else {
          data.name = get.name;
          data.value = $(from).text();
          data.value = data.value.trim();
          dm.queueData('testing', data);
          data = {};
        }
        break;

        // still broken
      case Float32Array:
        data.name = get.name;
        data.value = $(from).text();
        dm.queueData('testing', data);
        data = {};
        break;

      default:
        break;
    }
  }
}

function processSearch(url, searchObj, searchQuery, pullArray) {
  return new Promise((resolve, reject) => {
    const searchURL = genSearchURL(url, searchObj, searchQuery);

    requestAndDo(searchURL, ($, error) => {
      if (error) {
        reject(error);
      } else {
        const listIdentifier = genIdentifier(searchObj.listIdentifier);
        const list = $(listIdentifier).toArray();

        if (list.length > 0) {
          // TODO: add option to fuse data or spit multiple results out.
          const links = getLinks(list);
          for (let i = 0; i < 1; i += 1) {
            pullDataURL(`${url}${links[i]}`, pullArray).then(() => {
              resolve();
            }).catch((error) => { // eslint-disable-line no-shadow
              reject(error);
            });
          }
        } else {
          pullData($, pullArray);
          resolve();
        }
      }
    });
  });
}

function scrapeData(searchQuery) {
  const sites = newQuery.$sites;
  return new Promise((resolve, reject) => {
    const sitesProcessed = [];
    for (let i = 0; i < sites.length; i += 1) {
      const site = sites[i];
      const url = site.baseURL;
      const searchObj = site.$search ? site.$search : null;
      const pull = site.$pullData;

      sitesProcessed[i] = 0;

      if (searchObj !== null) {
        processSearch(url, searchObj, searchQuery, pull).then(() => { // eslint-disable no-loop-func
          sitesProcessed[i] = 1;
          if (lastSite(sitesProcessed, sites.length)) {
            // console.log('generating data....')
            dm.generateData('card', 'testing').then((data) => {
              resolve(data);
            }).catch((error) => { // eslint-disable-line no-shadow
              reject(error);
            });
          }
          // resolve(data);
        }).catch((error) => {
          reject(error);
        });
      }
    }
  });
}

// Helpers

function lastSite(array, length) {
  if (array.length !== length) {
    return false;
  }

  for (let i = 0; i < array.length; i += 1) {
    if (array[i] === 0) {
      return false;
    }
  }

  return true;
}

// Generates identifier string out of query array.
function genIdentifier(query) {
  let identifier = '';

  for (let i = 0; i < query.length; i += 1) {
    identifier += ` ${query[i]}`;
  }

  identifier = identifier.trimLeft();
  return identifier;
}

function requestAndDo(url, callback) {
  request(url, (error, response, html) => {
    const $ = cheerio.load(html);

    callback($, error);
  });
}

function genSearchURL(url, searchObj, searchQuery) {
  const searchArray = searchQuery.split(' ');

  let searchURL = `${url}${searchObj.searchURL}`;

  for (let i = 0; i < searchArray.length; i += 1) {
    const query = searchObj.queryTemplate.replace('{-}', searchArray[i]);
    if (i < searchArray.length - 1) {
      searchURL = `${searchURL}${query}${searchObj.queryOperand}`;
    } else {
      searchURL = `${searchURL}${query}`;
    }
  }

  return searchURL;
}

function getLinks(list, attr = 'href') {
  const links = [];
  for (let i = 0; i < list.length; i += 1) {
    links.push(list[i].attribs[attr]);
  }
  return links;
}


module.exports = {
  scrapeData,
  search
};
