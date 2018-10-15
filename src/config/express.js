const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const cookieMonster = require('cookie-parser');
const cors = require('cors');
const routes = require('../index.route');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieMonster());

/* eslint-disable arrow-body-style */
// Handlebars view engine.
app.engine('hbs', exphbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: './views/layouts',
  partialsDir: './views/partials',
  helpers: {
    ifEquals: (arg1, arg2, options) => {
      return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    },
    isDisabled: (user) => {
      return user ? '' : 'disabled';
    },
    isWarning: (warning) => {
      return warning ? ' warning' : '';
    }
  }
}));
/* eslint-enable arrow-body-style */

app.set('view engine', 'hbs');
app.use(express.static('public'));

// Enable CORS - Cross Origin Resource Sharing.
app.use(cors());

// Mount all routes on /api path.
app.use('/api', routes);

// #TODO: Additional non-API routes go here.

module.exports = app;
