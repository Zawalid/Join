const mongoose = require('mongoose');
// const validator = require('validator');

const reactionSchema = new mongoose.Schema(
  {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reaction: {
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

const postSchema = new mongoose.Schema(
  {
    content: String,
    reactions: [reactionSchema],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
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
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
