'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var TodoSchema = new mongoose.Schema({
  title: String,
  completed: Boolean
});

export default mongoose.model('Todo', TodoSchema);
