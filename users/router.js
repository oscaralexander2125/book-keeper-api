const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const jsonParser = bodyParser.json();

const {User} = require('./models');

router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['email', 'password', 'firstName', 'lastName'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    })
  };

  const stringFields = ['email', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if(nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'Incorrect field type: expected string',
      location: nonStringField
    })
  }

  const explicitlyTrimmedFields = ['email', 'password'];
  const nonTrimmedField = explicitlyTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizeFields = {
    email: {
      min: 1
    },
    password: {
      min:10,
      max: 72
    }
  };

  const tooSmallField = Object.keys(sizeFields).find(
    field => 
      'min' in sizeFields[field] && req.body[field].trim().length < sizeFields[field].min
  );
  const tooLargeField = Object.keys(sizeFields).find(
    field => 
      'max' in sizeFields[field] && req.body[field].trim().length > sizeFields[field].max
  )

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizeFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizeFields[tooLargeField]
          .max} characters long`,
        location: tooSmallField || tooLargeField
    });
  }

  let {email, password, firstName = '', lastName = ''} = req.body;

  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({email})
    .count()
    .then(count => {
      if(count > 0) {
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Profile already created with this email. Login instead.',
          location: 'email'
        });
      }

      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        email,
        password: hash,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      if(err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    })
})

/*router.get('/', (req, res) => {
  return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: 'Internal server error'}));
});*/

module.exports = {router};