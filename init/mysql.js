const mysql = require('mysql');
const connection =  mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'localhost',
  database : 'NodeRecap'
});
connection.connect();

const querys = {
  addUserQuery : 'INSERT INTO users (username, password) VALUES(?,?);',
  getUser : 'SELECT password FROM users WHERE username = ?;'
};

const getUser = (username, password, cb) => {
  connection.query(querys.getUser,[username], (err,res) => {
    cb(!err && (res[0].password === password))
  });
};

const addUser = (username, password, cb) => {
  connection.query(querys.addUserQuery,[username,password], (err, res) => {
    (err) ? cb(false) : cb(true);
  });
};

module.exports = {
  addUser,
  getUser
};
