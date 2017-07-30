const mysql = require('mysql');
const connection =  mysql.createConnection({
  host     : 'johnny.heliohost.org',
  user     : 'node_jens',
  password : 'dominion',
  database : 'node_dominion'
});

const querys = {
  getUser : 'SELECT password FROM users WHERE username = ?;'
};

const test = function () {
  connection.query('select * from users', (err,res) => {
    if (!err) console.log(res);
  });
}();

const getUser = (username, password,cb) => {
   connection.query(querys.getUser,[username], (err,res) => {
     if (!err && res.length > 0) {
       if (res[0].password === password) cb(true);
       else cb(false);
     }
     else cb(false);
  });
};

module.exports = {
  connection,
  getUser
};
