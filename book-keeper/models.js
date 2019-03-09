'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const bookKeeperSchema = mongoose.Schema({
  name: {type: String, required: true},
  author: {type: String, default: ''},
  status: {type:String, required: true},
  review: {type: String, default: ''},
  public: {type: String, required: true},
  created:{type: Date, default: Date.now}
})

bookKeeperSchema.methods.serialize = function() {
  return {
    id: this._id,
    name:this.name,
    author: this.author,
    status: this.status,
    public: this.public,
    review: this.review
  }
}

const BookKeeper = mongoose.model('book', bookKeeperSchema);

module.exports = {BookKeeper};

//public or private.