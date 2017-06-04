const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.listen(5000,() => {
  console.log('listening on port 8080');
});
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



app.get('/',(req, res) => {
  res.redirect('/index.html');
});
