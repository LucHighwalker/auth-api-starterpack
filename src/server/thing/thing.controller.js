const request = require('request');
const cheerio = require('cheerio');

const sampleQuery = {
  $searchSite: {
    searchURL: 'https://www.mtggoldfish.com/q?utf8=%E2%9C%93&query_string=',
    operand: '+',
    linksIdent: ['td', 'a'],
    getRequests: 1,
    get: [{
      type: 'text',
      identifier: ['div', '.price-card-name-header-name']
    }]
  }
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

// Returns text value of an element.
function scrapeText($, query) {
  const identifier = genIdentifier(query);
  return $(identifier).text();
}

// Sends a request and exectues a callback.
function requestAndDo(url, callback) {
  request(url, (error, response, html) => {
    const $ = cheerio.load(html);

    callback($, error);
  });
}

// Gets a list of links to scrape deeper.
function getLinks(url, query, attr = 'href') {
  return new Promise((resolve, reject) => {
    requestAndDo(url, ($, error) => {
      if (error) {
        reject(error);
      }

      const identifier = genIdentifier(query);
      const data = $(identifier).toArray();
      const links = [];

      for (let i = 0; i < data.length; i += 1) {
        links.push(data[i].attribs[attr]);
      }

      resolve(links);
    });
  });
}

function genSearchURL(baseURL, query, operand) {
  const searchQuery = query.split(' ');
  let searchURL = baseURL;

  for (let i = 0; i < searchQuery.length; i += 1) {
    searchURL += searchQuery[i];
    if (i < searchQuery.length - 1) {
      searchURL += operand;
    }
  }

  return searchURL;
}

function processSearch() {
  return new Promise((resolve, reject) => {
    const searchModel = sampleQuery.$searchSite;
    const searchQuery = 'consuming aberration';

    const searchURL = genSearchURL(searchModel.searchURL, searchQuery, searchModel.operand);

    // get search links
    getLinks(searchURL, searchModel.linksIdent).then((links) => {
      // TODO: replace 1 with links.length
      for (let i = 0; i < 1; i += 1) {
        requestAndDo(`https://www.mtggoldfish.com${links[i]}`, ($, error) => {
          if (error) {
            reject(error);
          }

          // TODO: iterate through gets, check for type
          let text = scrapeText($, searchModel.get[0].identifier);
          text = text.trim();
          resolve(text);
        });
      }
    }).catch((error) => {
      reject(error);
    });
  });
}

module.exports = {
  processSearch
};
