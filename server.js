const express = require('express');
const app = express();
const mongoose = require('mongoose')
const morgan = require('morgan');
const passport = require('passport');
require('dotenv').config();

mongoose.Promise = global.Promise;

app.use(express.static('public'));
app.use(morgan('common'));
app.use(express.json());

const {router: bookRouter} = require('./book-keeper');
const {router: userRouter, User} = require('./users');
const {router: authRouter, localStrategy, jwtStrategy} = require('./auth');
const {DATABASE_URL, TEST_DATABASE_URL, PORT} = require('./config');

passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session: false});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
})

app.use('/api/books', bookRouter);
app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);

app.get('/api/check', (req, res) => {
  res.json({ok: true});
});

app.use(function(req, res, next) {
  let err = new Error('Not Found')
  err.status = 404;
  next(err);
})
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: (process.env.NODE_ENV === 'development') ? err : {}
  })
})

let server;

function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if(err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
};

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if(err) {
          return reject(err);
        }
        resolve();
      }); 
    });
  });
};

if(require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};