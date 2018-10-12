/* eslint-disable indent */
module.exports = {
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
            name: 'Name'
          }
        },
        {
          from: ['.price-card-statistics-paper', 'table', 'tr', '.text-right'],
          get: {
            type: String,
            name: ['-pSpread', '-pHighest Buylist', '-pFoil Multiplier', '-pDaily Change',
              '-pWeekly Change', '-pHighest Price', '-pLowest Price'
            ]
          }
        },
        {
          from: ['.price-card-statistics-online', 'table', 'tr', '.text-right'],
          get: {
            type: String,
            name: ['-oSpread', '-oHighest Buylist', '-oFoil Multiplier', '-oDaily Change',
              '-oWeekly Change', '-oHighest Price', '-oLowest Price'
            ]
          }
        }
      ]
    },
    {
      baseURL: 'http://gatherer.wizards.com',
      $search: {
        searchURL: '/Pages/Search/Default.aspx?name=+',
        queryTemplate: '[{-}]',
        queryOperand: '+',
        listIdentifier: ['tr', '.cardItem']
      },
      $pullData: [{
          from: ['#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_cmcRow', '.value'],
          get: {
            type: String,
            name: 'Converted Mana Cost'
          }
        },
        {
          from: ['#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_typeRow', '.value'],
          get: {
            type: String,
            name: 'Type'
          }
        },
        {
          from: ['#ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_textRow', '.value', '.cardtextbox'],
          get: {
            type: String,
            name: 'Card Text'
          }
        }
      ]
    }
  ]
};
/* eslint-enable indent */
