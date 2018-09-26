const request = require('request');
const cheerio = require('cheerio');

const sampleQuery = {
  $searchList: {
    url: 'https://www.mtggoldfish.com/q?utf8=%E2%9C%93&query_string=',
    operand: '+',
    linksIdent: ['td', 'a'],
    getRequests: 1,
    get: [{
      type: 'text',
      identifier: ['div', '.price-card-name-header-name']
    }]
  }
};

const searchTrigger = '$searchList';

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

// Gets a list of links to scrape deeper.
function getLinks($, query, attr = 'href') {
  const identifier = genIdentifier(query);
  const data = $(identifier).toArray();
  const links = [];

  for (let i = 0; i < data.length; i += 1) {
    links.push(data[i].attribs[attr]);
  }

  return links;
}

// Sends a request and exectues a callback.
function requestAndDo(url, callback) {
  request(url, (error, response, html) => {
    const $ = cheerio.load(html);

    callback($, error);
  });
}

function search() {
  return new Promise((resolve, reject) => {
    const url = 'https://www.mtggoldfish.com/q?utf8=%E2%9C%93&query_string=consuming+aberration';

    requestAndDo(url, ($, err) => {
      const links = getLinks($, ['td', 'a']);
      const cardurl = `https://www.mtggoldfish.com${links[0]}`;

      if (err) {
        reject(err);
      }

      requestAndDo(cardurl, ($$, error) => {
        let scraped = scrapeText($$, ['div', '.price-card-name-header-name']);

        if (error) {
          reject(error);
        }

        scraped = scraped.trim();
        resolve(scraped);
      });
    });
  });
}

function readQuery() {
  return new Promise((resolve, reject) => {
    let searchQuery = 'consuming aberration';
    const searchList = sampleQuery[searchTrigger] ? sampleQuery.$searchList : null;

    if (searchList !== null) {
      const linksIdent = searchList.linksIdent;
      let searchURL = searchList.url;

      searchQuery = searchQuery.split(' ');

      if (searchQuery.length > 1) {
        for (let i = 0; i < searchQuery.length; i += 1) {
          searchURL += searchQuery[i];
          if (i < searchQuery.length - 1) {
            searchURL += searchList.operand;
          }
        }
      } else {
        searchURL += search[0];
      }

      requestAndDo(searchURL, ($, err) => {
        const links = getLinks($, linksIdent);
        const cardurl = `https://www.mtggoldfish.com${links[0]}`;

        if (err) {
          reject(err);
        }

        requestAndDo(cardurl, ($$, error) => {
          let scraped = scrapeText($$, ['div', '.price-card-name-header-name']);

          if (error) {
            reject(error);
          }

          scraped = scraped.trim();
          resolve(scraped);
        });
      });
    }
  });
}

module.exports = {
  search,
  readQuery
};
