const mysql = require('mysql');
const pool =  mysql.createPool({
  connectionLimit: 10,
  host     : 'johnny.heliohost.org',
  user     : 'node_jens',
  password : 'dominion',
  database : 'node_dominion'
});

pool.getConnection((err, connection) => {
  if (!err) console.log('connected');
});


const querys = {
  getUser : 'SELECT password FROM users WHERE username = ?;'
};

const getUser = (username, password,cb) => {
  pool.getConnection((err, connection) => {
    connection.query(querys.getUser,[username], (err,res) => {
      /*if (!err && res.length > 0) {
        if (res[0].password === password) cb(true);
        else cb(false);
      }
      else cb(false);

      /*vs**/

      cb(!err && res.length > 0 && res[0].password === password);
   });
   connection.release();
  });
};

module.exports = {
  getUser
};
