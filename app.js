const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const mysql = require('./mysql');
const users = [];
const gameInstances = [];

app.use(express.static('public'))
//app.get('/');


const getUserWithoutSocket = function (users) {
  return users.map(user => {
    return {
      username: user.username,
      UID: user.UID
    }
  });
};

const GameInstance = function (users) {
  this.id = 'Generate random unique id';
  this.players = getUserWithoutSocket(users);
  this.status = 'hier komt dan alel status';
};

const getRandomArbitrary = function (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const getUserNames = function () {
  return users.map(user => {
    return {
      username: user.username,
      UID: user.UID
    };
  });
};

const logOut = function (socket) {
  users.forEach((user, index) => {
    if (user.socket === socket) users.splice(index, 1);
  });
};

const updateUserList = function (socket) {
  socket.broadcast.emit('updateUserList', getUserNames());
};

const getUser = function (key, param) {
  return users.find(user => user[key] === param);
};

const generateGameInstance = function (users) {
  return new GameInstance(users);
};

const redirectToGameField = function (obj, instance) {
  const sender = getUser('username', obj.sender);
  const receiver = getUser('username', obj.receiver);
  const users = [sender,receiver];
  const gameInstance = generateGameInstance(users);

  console.log(gameInstance);

  users.forEach(user => {
    user.socket.emit('redirectToGameField', gameInstance.id);
  });

};

//server.listen(process.env.PORT || 9999);
server.listen(process.env.PORT || 80);
console.log('Server running...')

io.sockets.on('connection', (socket) => {
  console.log('connected');

  socket.on('update', () => {
    updateUserList(socket);
  });

  socket.on('acceptingInvite', (obj) => {
    redirectToGameField(obj, this);
  });

  socket.on('login', (username) => {
    users.push({username,UID: getRandomArbitrary(0,100) , socket})
    socket.emit('updateUserList', getUserNames());
    const user = getUser('socket', socket);
    socket.emit('init',{username: user.username, UID: user.UID});
  });

  socket.on('logout', () => {
    logOut(socket);
    updateUserList(socket);
  });

  socket.on('invite', (uid) => {
    const sender = getUser('socket', socket);
    const receiver = getUser('UID', uid);

    receiver.socket.emit('invite', {
      sender: sender.username,
      receiver: receiver.username,
      msg: `${sender.username} sent you an invite`
    });

  });

  socket.on('disconnect', () => {
    console.log('disconnect');
    logOut(socket);
    updateUserList(socket);
  });
});
