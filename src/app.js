const express = require('express');
const morgan = require('morgan');

const { serveUsername } = require('./handlers/serveUsername.js');

const authLib = require('./handlers/authUsers.js');
const { credentialCheck, signupHandler, protectedAuth } = authLib;
const { validateInput, loginHandler } = authLib;

const { validateAnchor } = require('./middlewares/validateAnchor.js');

const pagesLib = require('./handlers/servePages.js');
const { serveLandingPage, serveSignupPage, serveLobby } = pagesLib;

const initApp = (config, users, session) => {
  const app = express();
  const { mode, views } = config;

  if (mode === 'dev') {
    app.use(morgan('tiny'));
  }
  app.use(session);
  app.use(express.urlencoded({ extended: true }));
  app.get('/', serveLandingPage(views));
  app.get('/user-name', serveUsername);

  app.get('/signup', protectedAuth, serveSignupPage(views));
  app.post('/signup', protectedAuth, credentialCheck, signupHandler(users));

  app.get('/host', validateAnchor, serveLobby(views));

  app.get('/login', (req, res) => {
    res.sendFile('login.html', { root: views });
  });
  app.post('/login', validateInput, loginHandler(users));
  app.use(express.static('./public'));
  return app;
};

module.exports = { initApp };
