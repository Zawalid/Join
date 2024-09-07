const mongoose = require('mongoose');
const validator = require('validator');

const reactSchema = new mongoose.Schema(
  {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    react: {
      type: String,
      enum: ['like', 'love', 'care', 'laugh', 'wow', 'sad', 'angry'],
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);
const commentSchema = new mongoose.Schema(
  {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
  }
);

const postSchema = new mongoose.Schema({
  content: String,
  reacts: [reactSchema],
  comments: [commentSchema],
  images: {
    type: Array,
  },
  tags: {
    type: Array,
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
