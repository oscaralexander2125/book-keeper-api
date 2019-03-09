const express = require('express');
const app = express();
const mongoose = require('mongoose')

mongoose.Promise = global.Promise;

app.use(express.static('public'));
app.use(express.json());

const {router: bookRouter} = require('./book-keeper');
const {DATABASE_URL, TEST_DATABASE_URL, PORT} = require('./config')

app.use('/api/books', bookRouter);

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

app.get('/api/check', (req, res) => {
  res.json({ok: true});
});

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

if(require.main ===module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};