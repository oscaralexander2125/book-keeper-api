'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const bookKeeperSchema = mongoose.Schema({
  name: {type: String, required: true},
  author: {type: String, default: ''},
  status: {type:String, required: true},
  review: {type: String, default: ''},
  public: {type: String, default:'public', required: true},
  created:{type: Date, default: Date.now},
  userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

bookKeeperSchema.methods.serialize = function() {
  return {
    id: this._id,
    name:this.name,
    author: this.author,
    status: this.status,
    public: this.public,
    review: this.review,
    userId: this.userId
  }
}

const BookKeeper = mongoose.model('book', bookKeeperSchema);

module.exports = {BookKeeper};

//public or private.