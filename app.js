const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

const users = [];
const connections = [];

server.listen(process.env.PORT || 80);
console.log('Server running...');
app.get('/',(req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
  connections.push(socket);
  socket.on('new-user', (username) => {
    users.push(username);
    io.sockets.emit('displayUsers', users);
  });
});
