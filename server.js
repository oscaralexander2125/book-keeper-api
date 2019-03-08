const express = require('express');
const app = express();
const mongoose = require('mongoose')

app.use(express.static('public'));
app.use(express.json());

const {DATABASE_URL, TEST_DATABASE_URL, PORT} = require('./config')

app.get('/api/check', (req, res) => {
  res.json({ok: true});
});



app.listen(PORT, () => console.log(`You're app is listen on port ${PORT}`));

module.exports = {app}