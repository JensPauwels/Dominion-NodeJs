const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const mysql = require('./mysql');
const users = [];


server.listen(process.env.PORT || 80);
console.log('Server running...');

const getUserNames = function () {
  let userNames = [];
  users.forEach(user => {
    userNames.push(user.username);
  });
  return userNames;
};

const logout = function (socket) {
  let indexToRemove = '';
  users.forEach((user, index) => {
    if (user.socket === socket) indexToRemove = index;
  });
  if (indexToRemove !== '') {
    users.splice(indexToRemove,1);
    socket.broadcast.emit('updateUserList',getUserNames());
  }
};

io.sockets.on('connection', (socket) => {
  socket.on('login', (obj) => {
    mysql.connection.connect();
    connection.getUser(obj.username,obj.password,(loggedIn) => {
      let objToReturn = {};
      if (!loggedIn) objToReturn = {status: loggedIn};
      else {
        users.push({username: obj.username,socket});
        socket.broadcast.emit('updateUserList', getUserNames());
        objToReturn = {
          username: obj.username,
          status: 'online',
          userList: getUserNames()
        };
      }
      socket.emit('loginStatus', objToReturn);
    });
    mysql.connection.end();
  });

  socket.on('logout',() => {
    logout(socket);
  });


  socket.on('disconnect', () => {
    logout(socket);
  });
});
