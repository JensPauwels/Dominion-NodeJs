const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);


server.listen(process.env.PORT || 80);
console.log('Server running...');
app.get('/',(req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.sockets.on('connection', (socket) => {
  socket.on('sendMessage', (obj) => {
    console.log(obj);
    socket.broadcast.emit('newMessage',obj);
  });
});
