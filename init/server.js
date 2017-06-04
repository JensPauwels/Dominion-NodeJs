const express = require('./express');
const server = require('http').createServer(express);
const io = require('socket.io').listen(server);
let connections = [];
let users = [];

server.listen(8080, () => {
  console.log('running on 8080');
});

io.sockets.on('connection', (socket) => {
  connections.push(socket);
  console.log(`${connections.length} connected`);

  socket.on('disconnect', () => {
    connections.splice(connections.indexOf(socket),1);
    console.log(`${connections.length} connected`);
  });

  socket.on('send-message', (data) => {
    io.sockets.emit('new-message', data);
  });

  socket.on('add-user', (user) => {
    users.push(user);
    io.sockets.emit('new-user', user);
  });

  socket.on('getUsers', () => {
    io.sockets.emit('allUsers',users);
  });
});

module.exports = io;
