const express = require('express');
const router = express.Router();
const {BookKeeper} = require('./models');
const {User} = require('../users');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const {jwtStrategy} = require('../auth');
const passport = require('passport');

passport.use(jwtStrategy);
const jwtAuth = passport.authenticate('jwt', {session: false});

router.get('/', jwtAuth, (req, res) => {
  let {email} = req.user;

  User.findOne({email})
  .then(user => {
    BookKeeper.find({userId: user._id})
    .then(books => {
      res.json(books.map(book => book.serialize()))
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({message: 'Internal server error'})
    })
  })
  .catch(err => {
    console.error(err);
    res.status(500).json({message: 'Internal server error'})
  })
})

router.post('/', jwtAuth, (req, res, next) => {
  const requiredFields = ['name', 'status', 'public'];
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

  if(req.body.public !== 'public' && req.body.public !== 'private') {
    const message = `Missing public or private in request body`;
    console.error(message);
    res.status(400).send(message);
  };

  let {email} = req.user;

  User.findOne({email})
  .then(user => {
    if(!user) {
      next();
    }
    else {
      BookKeeper.create({
        name: req.body.name,
        author: req.body.author,
        status: req.body.status,
        review: req.body.review,
        public: req.body.public,
        userId: user._id
      })
      .then(data => res.status(201).json(data.serialize()))
      .catch(err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'})
      })
    }
  })
  .catch(next);
})

router.put('/:id', jwtAuth, (req, res, next) => {
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)) {
    const message = `Request path id ${req.params.id} and request body ${req.body.id} must match.`;
    console.error(message);
    return res.status(400).json({message})
  }

  const status = ['read', 'unread', 'in-process'];
  const bookStatus = req.body.status

  if(bookStatus !==status[0] && bookStatus !==status[1] && bookStatus !==status[2]) {
    const message = `Missing read, unread or in-process string in request.body.status`;
    console.error(message);
    return res.status(400).json({message});
  }

  if(req.body.public !== 'public' && req.body.public !== 'private') {
    const message = `Missing public or private in request body`;
    console.error(message);
    res.status(400).send({message});
  };

  const toUpdate = {};
  const updateFields = ['name', 'author', 'status', 'public', 'review'];

  updateFields.forEach(field => {
    if(field in req.body) {
      toUpdate[field] = req.body[field];
    }
  });

  BookKeeper.findByIdAndUpdate(req.body.id, {$set:toUpdate}, {new: true})
  .then(updated => {
    if(updated) {
      res.status(200).json(updated);
    }
    else {
      next();
    }
  })
  .catch(next);
});

router.delete('/:id', jwtAuth, function(req, res, next) {
  BookKeeper.findByIdAndRemove(req.params.id)
  .then(count => {
    if(!count) {
      next();
    }
    else {
      res.status(204).end();
    }
  })
  .catch(next);
});

module.exports = {router}