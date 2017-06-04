const socket = io.connect();

const sendMessage = (e) => {
  e.preventDefault();
  socket.emit('send-message', $('#message').val());
  $('#message').val('');
};

const addUser = (e) => {
  e.preventDefault();
  socket.emit('add-user', $('#username').val());
  $('#username').val('');
};

const checkOnMessages = () => {
  socket.on('new-message', (data) => {
    $('#messages').append(data);
  });
};

const checkOnUsers = () => {
  socket.on('new-user', (username) => {
    $('#users').append(username);
  });
};

const getUserNames = () => {
  socket.emit('getUsers');
};

const addUserNames = () => {
  socket.on('allUsers', (users) => {
      console.log(users);
  });
};


$(() => {
  $('#demo').on('submit',sendMessage);
  $('#newUser').on('submit',addUser);
  $('#randomButton').on('click', getUserNames);
  checkOnMessages();
  checkOnUsers();
  addUserNames();
});
