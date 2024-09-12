const { Schema } = require('mongoose');

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

const messageSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: [true, 'A message must have a sender'],
    },
    content: {
      original: {
        type: String,
        required: [true, 'A message must have content'],
      },
      edited: {
        type: String,
      },
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'conversation',
      required: [true, 'A message must belong to a conversation'],
    },
    reactions: [reactionSchema],
  },
  { timestamps: true }
);

exports.Message = chatConnection.model('message', messageSchema);
