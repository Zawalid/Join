const mongoose = require('mongoose');
const validator = require('validator');

const postSchema = new mongoose.Schema({
  content: {
    type: String,
  },
  reacts: {
    type: Array,
  },
  comments: {
    type: Array,
  },
  images: {
    type: Array,
  },
  community: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: Number,
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;