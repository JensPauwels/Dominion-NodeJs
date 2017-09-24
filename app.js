const express = require('express');
const uniqid = require('uniqid');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const bcrypt = require('bcrypt');
const saltRounds = 10;
const mysql = require('./mysql');
const users = [];
const cardList = require('./api.json');
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
  // TODO: id controlleren
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
  const gameInstance = new GameInstance(users);
  gameInstances.push(gameInstance);
  return gameInstance;
};

const redirectToGameField = function (obj, instance) {
  const sender = getUser('username', obj.sender);
  const receiver = getUser('username', obj.receiver);
  const users = [sender,receiver];
  const gameInstance = generateGameInstance(users);


  users.forEach(user => {
    user.socket.emit('redirectToGameField', gameInstance.id);
  });
};

const declineInvite = function (obj, instance) {
  console.log(obj);
  console.log(instance);
};

const getCurrentUser = function (param,socket) {
  const user = getUser(param, socket);
  return {
    username: user.username,
    UID: user.UID
  }
};

const login = function (data, socket) {
  mysql.controlEmail(data.username, (res) => {
    if (res !== false) {
      bcrypt.compare(data.password, res, (err, res) => {
        if (!err && res) {
          socket.emit('loginAccepted', "jwt token maken");
        }
        else {
          socket.emit('loginDeclined', "fuck you");
        }
      });
    };
  });
};

const initUser = function (user, socket) {
  login(user.username, socket);
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

const controlLoggedIn = function (socket) {
  if (getUser('socket', socket) === undefined) socket.emit('control', {status: false});
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
    else {
      socket.emit('registrationDeclined', "Duplicated email");
    }
  });

};

const startGame = function (socket) {
  startingDeck();
  checkPlayerScore();
  gameInfo.users.forEach(user => drawCards("newCards", user, 5));
  fillUpBoard();
  socket.emit('startGameInfo', gameInfo);
}

const startingDeck = function () {
  gameInfo.users.forEach(user => {
    user.deck = [];
    let copperCard = findCards.cloneCard(findCards.findCard(cardList.passiveCards, 'Copper'));
    let estateCard = findCards.cloneCard(findCards.findCard(cardList.passiveCards, 'Estate'));
    user.deck.push(copperCard, estateCard);

    let index = findCards.indexOfCardInDeck(user.deck, 'Copper');
    user.deck[index].amount = 7;
    user.deck[index + 1].amount = 3;
  });
}

const findCards = {
  findCard: function (array, cardName) {
    return array.find(card => card.name === cardName)
  },
  checkDeck: function (array, cardName) {
    return array.some(card => card.name === cardName)
  },
  indexOfCardInDeck: function (array, cardName) {
    return array.findIndex(card => card.name === cardName);
  },
  cloneCard: function (obj) {
    if (null === obj || "object" != typeof obj) return obj;
    let copy = obj.constructor();
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) copy[key] = obj[key];
    }
    return copy;
  }
}

const drawCards = function (action, user, amount) {
  if (action === "newCards") user.hand = [];
  for (let i = 0; i < amount; i++) {
    const rn = getRandomArbitrary(0, user.deck.length - 1);
    let card = findCards.findCard(user.hand, user.deck[rn].name);
    if (card === undefined) {
      let clone = findCards.cloneCard(findCards.findCard(user.deck, user.deck[rn].name));

      user.hand.push(clone);
      findCards.findCard(user.hand, user.deck[rn].name).amount = 1;
      findCards.findCard(user.deck, user.deck[rn].name).amount--;
    } else {
      card.amount++;
      findCards.findCard(user.deck, user.deck[rn].name).amount--;
    }
  }
}

const fillUpBoard = function () {
  gameInfo.cardsLeft = [];
  cardList.passiveCards.forEach(card => {
    gameInfo.cardsLeft.push(card);
    // console.log(card);
  })
}

const checkPlayerScore = function () {
  gameInfo.users.forEach(user => {
    user.victoryPoints = 0;
    user.deck.forEach(card => {
      if (card.action === 'Points') user.victoryPoints += card.value * card.amount;
    })
  })
}

//Temporarily
const gameInfo  = {users: [{
    username: "Frank",
    hand: [],
    deck: [],
    victoryPoints: 0,
  },
  {
    username: "Mathias",
    hand: [],
    deck: [],
    victoryPoints: 0,
  }],
  cardsLeft : []
}


io.sockets.on('connection', socket => {

  socket.on('update', () => {
    updateUserList(socket);
  });

  socket.on('init', user => {
    initUser(user, socket);
  });

  socket.on('acceptingInvite', obj => {
    redirectToGameField(obj, this);
  });

  socket.on('control', () => {
    controlLoggedIn(socket);
  });

  socket.on('register', (obj) => {
    handleRegistration(obj, socket);
  });

  socket.on('declineInvite', obj => {
    declineInvite(obj, this);
  });

  socket.on('logout', () => {
    logOut(socket);
    updateUserList(socket);
  });

  socket.on('disconnect', () => {
    logOut(socket);
    updateUserList(socket);
  });

  socket.on('login', data => {
    login(data, socket);
  });

  socket.on('invite', uid => {
    invite(uid, socket);
  });

  socket.on('startGame', () => {
    startGame(socket);
  });

  socket.on('endTurn', () => {
    switchUserTurn(socket);
  })

  socket.on('cardAction', card => {
    const actions = card.action.split(" ");
    actions.forEach(action => { // En hier.
      cardOptions.action();
    })
  })
});


const switchUserTurn = function (socket) {
  //TODO stuur gegevens van alle zetten die gedaan werden door naar alle sockets.
  console.log('switchUser');
}
