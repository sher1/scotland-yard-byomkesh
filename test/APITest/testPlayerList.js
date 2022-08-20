const request = require('supertest');
const expressSession = require('express-session');
const { initApp } = require('./../../src/app.js');
const { Users } = require('../../src/models/users.js');
const { Games } = require('../../src/models/games.js');
const Datastore = require('../../src/models/datastore.js');


const mockClient = () => {
  const p = new Promise((res, rej) => res());
  return { hGet: () => p, hSet: () => p, hDel: () => p };
};
describe('serveLobbyStats', () => {
  let app, config, cookie;
  it('Should serve lobby stats of single player', (done) => {
    config = { mode: 'test', views: './views' };
    const users = new Users({});
    const games = new Games();
    const session = expressSession({
      secret: 'test', resave: false, saveUninitialized: false
    });

    const stores = {
      gamesStore: new Datastore('games', mockClient()),
      usersStore: new Datastore('users', mockClient()),
    };

    app = request(initApp(config, users, games, session, stores));
    const body = 'username=user1&password=user1';

    app.post('/signup')
      .send(body)
      .expect('location', '/')
      .expect(302)
      .end((err, res) => {

        cookie = res.header['set-cookie'];

        app.get('/host')
          .set('cookie', cookie)
          .end((err, res) => {

            app.get('/api/lobby-stats')
              .set('cookie', cookie)
              .expect('content-type', /json/)
              .expect(200, done);
          });
      });
  });
});
