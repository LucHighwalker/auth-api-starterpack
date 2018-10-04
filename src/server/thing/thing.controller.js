const request = require('request');
const cheerio = require('cheerio');

const dm = require('../dataManager/dataManager.controller');

const newQuery = {
  $sites: [{
    baseURL: 'https://www.mtggoldfish.com',
    $search: {
      searchURL: '/q?utf8=%E2%9C%93&query_string=',
      queryTemplate: '{-}',
      queryOperand: '+',
      listIdentifier: ['td', 'a']
    },
    $pullData: [{
      from: ['.price-card-name-header-name'],
      get: {
        type: String,
        name: 'title'
      }
    },
    {
      from: ['table', 'tr', 'td'],
      get: {
        type: Float32Array,
        name: 'price'
      }
    }]
  }]
};

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

function pullData(url, pullArray) {
  return new Promise((resolve, reject) => {
    requestAndDo(url, ($, error) => {
      if (error) {
        reject(error);
      } else {
        for (let i = 0; i < pullArray.length; i += 1) {
          const get = pullArray[i].get;
          const from = genIdentifier(pullArray[i].from);

          const data = {};

          switch (get.type) {
            case String:
              data.name = get.name;
              data.value = $(from).text();
              data.value = data.value.trim();
              break;

            case Float32Array:
              data.name = get.name;
              data.value = 420;
              // data[get.name] = $(from).Float32Array;
              break;

            default:
              break;
          }

          dm.queueData('testing', data);
        }

        resolve();
      }
    });
  });
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

        if (list.length > 1) {
          // add option to fuse data or spit multiple results out.
          const links = getLinks(list);
          for (let i = 0; i < 1; i += 1) {
            pullData(`${url}${links[i]}`, pullArray).then(() => {
              dm.generateData('refactorTest', 'testing').then((data) => {
                resolve(data);
              }).catch((error) => { // eslint-disable-line no-shadow
                reject(error);
              });
            }).catch((error) => { // eslint-disable-line no-shadow
              reject(error);
            });
          }
        }
      }
    });
  });
}

function scrapeData(searchQuery) {
  const sites = newQuery.$sites;
  return new Promise((resolve, reject) => {
    for (let i = 0; i < sites.length; i += 1) {
      const site = sites[i];
      const url = site.baseURL;
      const searchObj = site.$search ? site.$search : null;
      const pullArray = site.$pullData;

      if (searchObj !== null) {
        processSearch(url, searchObj, searchQuery, pullArray).then((data) => {
          resolve(data);
        }).catch((error) => {
          reject(error);
        });
      }
    }
  });
}


module.exports = {
  processSearch,
  scrapeData
};
