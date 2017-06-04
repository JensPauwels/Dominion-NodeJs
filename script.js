const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 80));

app.use(express.static(`${__dirname}/public`));


app.listen(app.get('port'), () => {
  console.log(`Node app running at localhost: ${app.get('port')}`);
});


app.get('/',(req, res) => {
  res.send('Hello world');
});
