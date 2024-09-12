const { Schema } = require('mongoose');

const conversationSchema = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
      },
    ],
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: 'message',
      },
    ],
  },
  {
    timestamps: true,
  }
);

exports.Conversation = chatConnection.model('conversation', conversationSchema);
