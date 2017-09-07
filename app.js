const express = require('express');
const uniqid = require('uniqid');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mysql = require('./mysql');
const users = [];
const tokens = [];
let gameInstances = [];
app.use(express.static('public'))

const startServer = function () {
  server.listen(process.env.PORT || 9999); // 80 voor online
  console.log('Server running...')
}();

const getUserWithoutSocket = function (users) {
  return users.map(user => {
    return {
      username: user.username,
      UID: user.UID
    }
  });
};

const GameInstance = function (users) {
  this.id = uniqid();
  this.players = getUserWithoutSocket(users);
  this.status = 'hier komt dan alel status';
};

const getUserNames = function () {
  return tokens.map(token => token.email);
};

const logOut = function (token) {
  let idx;
  tokens.forEach((x, index) => {
    if (x.uid === token) idx = index;
  });
  tokens.splice(idx, 1);
};

const updateUserList = function (socket) {
  socket.broadcast.emit('updateUserList', getUserNames());
};

const getUser = function (key, param) {
  return users.find(user => user[key] === param);
};

const generateGameInstance = function (users) {
  const gameInstance = new GameInstance(users);
  gameInstances.push(gameInstance);
  return gameInstance;
};

const redirectToGameField = function (obj, instance) {
  const sender = getUser('username', obj.sender);
  const receiver = getUser('username', obj.receiver);
  const users = [sender,receiver];
  const gameInstance = generateGameInstance(users);
  users.forEach(user => user.socket.emit('redirectToGameField', gameInstance.id));
};

const declineInvite = function (obj, instance) {
  console.log(obj);
  console.log(instance);
};

const login = function (data, socket) {
  let loggedIn = false;
  tokens.forEach(token => {
    if (token.email === data.username) loggedIn = true;
  });

  if (!loggedIn) {
    mysql.controlEmail(data.username, (hash) => {
      if (hash !== false) {
        bcrypt.compare(data.password, hash, (err, res) => {
          if (!err && res) {
            const uid = uniqid();
            tokens.push({uid, socket, email: data.username});
            socket.emit('loginAccepted', {uid,email: data.username});
          }
          else socket.emit('loginDeclined', "fuck you");
        });
      };
    });
  }
  else {
    socket.emit('loginDeclined', "already logged in");
  }

};

const invite = function (uid, socket) {
  const sender = getUser('socket', socket);
  const receiver = getUser('UID', uid);

  receiver.socket.emit('invite', {
    sender: sender.username,
    receiver: receiver.username,
    msg: `${sender.username} sent you an invite`
  });
};

const handleRegistration = function (obj, socket) {
  mysql.controlEmail(obj.email, (bool) => {
    if (!bool) {
      bcrypt.hash(obj.password, saltRounds, (err, hash) => {
        if (!err) mysql.register(obj.username, hash, obj.email, (bool) => {
          if (bool) socket.emit('registrationAccepted', "status ok accepted");
          else socket.emit('registrationDeclined', "registration declined");
        });
      });
    }
    else socket.emit('registrationDeclined', "Duplicated email");
  });
};

const validate = function (token, socket) {
  let validation = false;
  tokens.forEach(x => {
    if (x.uid === token.uid && x.email === token.email) {
      validation = true;
      x.socket = socket;
    };
  });
  socket.emit('validated', validation);
  socket.emit('updateUserList', getUserNames());
  socket.broadcast.emit('updateUserList', getUserNames());
};

const disconnect = function (socket) {
  tokens.forEach(token => {
    const date = new Date();
    if (token.socket === socket) token.timeStamp = date.getTime();
  });
};

const controlOnDisconnect = function () {
  setInterval(function () {
    const sockets = Object.keys(io.sockets.sockets);
    const date = new Date();

    tokens.forEach(token => {
      if (sockets.includes(token.socket.id)) token.timeStamp = date.getTime();
      else {
        if (token.timeStamp !== undefined && (token.timeStamp + 60000) < date.getTime()) logOut(token.uid);
      }
    });
  }, 5000);
}();





io.sockets.on('connection', socket => {

  socket.on('register', (obj) => {
    handleRegistration(obj, socket);
  });

  socket.on('login', data => {
    login(data, socket);
  });

  socket.on('logout', (token) => {
    logOut(token);
    updateUserList(socket);
  });

  socket.on('disconnect', () => {
    disconnect(socket);
    console.log(socket.id,'disconnect');
  });

  socket.on('validate', token => {
    validate(token, socket);
  });

  socket.on('acceptingInvite', obj => {
    redirectToGameField(obj, this);
  });

  socket.on('declineInvite', obj => {
    declineInvite(obj, this);
  });

  socket.on('invite', email => {
    console.log(email);
    //nvite(uid, socket);
  });

});
