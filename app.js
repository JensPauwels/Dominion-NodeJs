"use strict";
//const connection = require('./init/mysql');
const app = require('./init/express');
const server = require('./init/server');
const session = require('express-session');


app.get('/login.html', (req, res) => {
  res.render('form', {
    title: 'Login',
    action: '/doLogin',
    btnText: 'login'
  });
});

app.get('/register.html', (req, res) => {
  res.render('form', {
    title: 'register',
    action: '/doRegister',
    btnText: 'register'
  });
});

app.post('/doLogin', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  connection.getUser(username, password, succes => {
    if (succes) {
      req.session.loggedin = username;
      res.redirect('/index.html');
    } else {
      res.render('form', {
        title: 'Login',
        action: '/doLogin',
        btnText: 'login',
        error: `failed to login with ${username}`
      });
    }
  });
});

app.post('/doRegister',(req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  connection.addUser(username, password, succes => {
    if (succes) {
      req.session.loggedin = username;
      res.send("Registered in")
    } else {
      res.render('form', {
        title: 'register',
        action: '/doRegister',
        btnText: 'register',
        error: `failed to register with ${username}`
      });
    }
  });
});
