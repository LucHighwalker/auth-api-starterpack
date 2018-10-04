# Install with npm

Simply run `npm install magicData --save` in your project directory. 

# Getting started 

To configure a website, you should be familiar with some sort of browser developer tools such as in [Chrome](https://developers.google.com/web/tools/chrome-devtools/ "developer tools")

This is a query (wip), to search [mtgGoldfish](https://www.mtggoldfish.com/) and pull data from the website. Take a minute to read through it, and we'll go through each value step by step. 

```
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
      from: ['table', 'tr', '.text-right'],
      get: {
        type: Float32Array,
        name: 'price'
      }
    }]
  }]
```

# Writing a query

## Keys

### $sites

The first key `$sites` is pretty self explanatory. This is an array of queries, one for each website that you want magicData to scrape data from. 

### baseURL 

This key is also pretty self explanatory. This is the base url of the website. In this case `https://www.mtggoldfish.com`.

?> **Important** Notice the lack of a `/` at the end of the base url.

### $search 

This key tells magicData that this website has a search feature, and it should search through the website for matching documents. 

#### searchURL

Search url gets added to the base url in order to generate a search query url.

#### queryTemplate

Query template lets magic data know how the words in the search query should look. It will replace `{-}` with each word in the search query. In the case of mtgGoldfish, the query words aren't formatted in any special way. So `{-}` will do. However, some sites, may format their queries differnetly. For example Wizard's own [magic database](http://gatherer.wizards.com/ "gatherer"), the terms are put in brackets. So the template would look like `[{-}]`. 

#### queryOperand

Query operand does exactly what it says it does. It is the operand added between each search term to generate a complete search url. 

#### listIdentifier

This lets magicData know what a search result should look like. This is useful for websites, which automatically redirect to a result when there is only one possible result. If these identifiers are not found, magicData will assume that the result is displayed, and automatically attempt to pull data from the website. Otherwise, it will follow each link and create a composite of the data available. 

### $pullData

$pullData is an array of pull objects, which lets magicData know what data should be retrieved from each site. Each pull data has 2 values, `from` and an object `get`.

#### from

From works similarly to listIdentifier. It works as the identifier for whatever data you're trying to pull.

#### get

Get is an object which lets magicData know what data should be pulled. It has 2 values `type` and `name`.

##### type

Type simply lets magicData know what type of data should be expected. If the data type doesn't match, it will be thrown out. 

##### name

This will be the name given to this particular data set in the generated document. 