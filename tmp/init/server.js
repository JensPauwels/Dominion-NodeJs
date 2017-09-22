const express = require('./express');
const xss = require('xss');
const server = require('http').createServer(express);
const io = require('socket.io').listen(server);
let connections = [];

server.listen(process.env.PORT || 80, () => {
  console.log('server listening on 9999');
});

const updateUserList = function (socket) {
  const users = connections.map(user => user.username);
  socket.emit('updateUserList', users);
  socket.broadcast.emit('updateUserList', users);
  console.log(users);
};

io.sockets.on('connection', (socket) => {



  socket.on('enterLobby', (username) => {

    let tmp = false;
    connections.forEach(connection => {
       if (connection.username === username) tmp = true;
    });

    const newUsername = username.trim(' ');
    if (!tmp && username.trim(' ').length !== 0) {
      connections.push({username: xss(username), socket});
      socket.emit('connectionAccepted', "test");
      updateUserList(socket);
    }

    else if (tmp) socket.emit('connectionDeclined', {errorMsg: 'username already exists'});
    else if (newUsername === '') socket.emit('connectionDeclined', {errorMsg: "username can't be empty"})

  });

  socket.on('newMessage', (msg) => {
    let user;
    connections.forEach(connection => {
      if (connection.socket === socket) user = connection.username;
    });

    socket.broadcast.emit('updateClients', {msg: xss(msg), user});

  });

  socket.on('disconnect', () => {
    let tmp;
    connections.forEach((connection, index) => {
      if (connection.socket === socket) {
        tmp = index;
      }
    });



    connections.splice(tmp, 1);
    connections.forEach(connection => {
      updateUserList(connection.socket);
    });
  });

});

module.exports = io;
