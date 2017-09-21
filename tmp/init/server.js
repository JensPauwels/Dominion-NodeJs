const express = require('./express');
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
};

io.sockets.on('connection', (socket) => {

  socket.on('enterLobby', (username) => {
    let tmp = false;
    connections.forEach(connection => {
       if (connection.username === username) tmp = true;
    });

    if (!tmp && username !== '') {
      connections.push({username, socket});
      socket.emit('connectionAccepted', "test");
      updateUserList(socket);
    }
    else if (username === '') socket.emit('connectionDeclined', {errorMsg: "username can't be empty"})
    else if (tmp) socket.emit('connectionDeclined', {errorMsg: 'username already exists'});
  });

  socket.on('newMessage', (msg) => {
    let user;
    connections.forEach(connection => {
      if (connection.socket === socket) user = connection.username;
    });
    if (!msg.contains('<script>') socket.broadcast.emit('updateClients', {msg, user});

  });

  socket.on('disconnect', () => {
    let tmp;
    connections.forEach((connection, index) => {
      if (connection.socket === socket) tmp = index;
    });

    connections.splice(tmp, 1);
    connections.forEach(connection => {
      updateUserList(connection.socket);
    });
  });

});

module.exports = io;
