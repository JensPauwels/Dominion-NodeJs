const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'shhh'}));
app.set('view engine', 'ejs');

module.exports = app
