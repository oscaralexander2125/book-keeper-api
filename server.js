const express = require('express');
const app = express();
app.use(express.static('public'));

app.get('/api/*', (req, res) => {
  res.json({ok: true});
});

app.listen(process.env.PORT || 8080);

module.exports = {app}