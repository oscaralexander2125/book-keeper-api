const express = require('express');
const router = express.Router();
const {BookKeeper} = require('./models');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

router.get('/', (req, res) => {
  BookKeeper.find()
  .then(books => {
    res.json(books.map(book => book.serialize()))
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'})
  })
})

router.post('/', (req, res) => {
  const requiredFields = ['name', 'status'];
  requiredFields.forEach((field, index) => {
    if(!(field in req.body)) {
      const message = `Missing \` ${field}\` in request body.`
      console.error(message);
      return res.status(400).send(message);
    };
  });
  const status = ['read', 'unread', 'in-process'];
  const bookStatus = req.body.status

  if(bookStatus !==status[0] && bookStatus !==status[1] && bookStatus !==status[2]) {
    const message = `Missing read, unread or in-process string in request.body.status`;
    console.error(message);
    return res.status(400).send(message);
  }

  //let email = req.user.email;

  //get user info to find books with that user and seperate based on tab button.

  BookKeeper.create({
    name: req.body.name,
    author: req.body.author,
    status: req.body.status,
    review: req.body.review,
  })
  .then(data => res.status(201).json(data.serialize()))
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'})
  })
})

router.put('/:id', (req, res) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id ${req.params.id} and request body ${req.body.id} must match.`;
    console.error(message);
    return res.status(400).json({message})
  }

  const toUpdate = {};
  const updateFields = ['name', 'author', 'status', 'review'];

  updateFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BookKeeper.findByIdAndUpdate(req.body.id, {$set:toUpdate}, {new: true})
  .then(updated => {
    res.status(200).json(updated);
  })
  .catch(err => res.status(500).json({message: err}));
})

router.delete('/:id', (req, res) => {

})

module.exports = {router}