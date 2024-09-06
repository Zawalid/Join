const mongoose = require('mongoose');
const validator = require('validator');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the community'],
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the community'],
  },
  members: {
    type: Array,
  },
  posts: {
    type: Array,
  },
  admins: {
    type: Array,
  },
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
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  createdBy: {
    type: Number,
  },
});

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;