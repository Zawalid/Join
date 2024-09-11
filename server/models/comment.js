const mongoose = require('mongoose');
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
const commentSchema = new mongoose.Schema(
  {
    content: String,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    reactions: [reactionSchema],
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;