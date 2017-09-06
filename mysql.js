const mysql = require('mysql');
const pool =  mysql.createPool({
  connectionLimit: 10,
  host     : 'johnny.heliohost.org',
  user     : 'node_jens',
  password : 'dominion',
  database : 'node_dominion'
});



const querys = {
  getUser : 'SELECT password FROM users WHERE username = ?;',
  insertUser: 'INSERT into users (username, password, email, uid) values(?,?,?,?);',
  controlEmail: 'SELECT * FROM users WHERE email = ?;'
};

const handleDb = function (query) {
  pool.getConnection((err, connection) => {
    if (!err) {
      query(connection);
      connection.release();
    }
    else console.log(err);
  });
};

const getUser = (username, password,cb) => {
  handleDb(connection => {
    connection.query(querys.getUser,[username], (err,res) => {
      cb(!err && res.length > 0 && res[0].password === password);
    });
  })
};

const controlEmail = (email, cb) => {
  handleDb(connection => {
    connection.query(querys.controlEmail, [email], (err, res) => {
      console.log();
      if (!err && res.length > 0 && res[0].email === email) {
        cb(res[0].password);
      }
      else {
        cb(false);
      }
    });
  });
};

const register = function (username, password, email, cb) {
  handleDb(connection => {
    connection.query(querys.insertUser,[username, password, email, 50], (err, res) => {
      if (!err) console.log(res);
      cb(!err)
    });
  });
};

module.exports = {
  getUser,
  register,
  controlEmail
};
