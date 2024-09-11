const mongoose = require('mongoose');
// const validator = require('validator');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name for the community'],
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description for the community'],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    image: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    tags: {
      type: Array,
    },
    rules: {
      type: Array,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;
