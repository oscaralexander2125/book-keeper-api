const express = require('express');
const app = express();
const mongoose = require('mongoose')

app.use(express.static('public'));
app.use(express.json());

const {router: bookRouter} = require('./book-keeper');

const {DATABASE_URL, TEST_DATABASE_URL, PORT} = require('./config')
app.use('/api/books', bookRouter);
app.get('/api/check', (req, res) => {
  res.json({ok: true});
});

app.use('*', (req, res) => {
  res.status(404).json({message: 'Not Found'});
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

if(require.main ===module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};