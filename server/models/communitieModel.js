const mongoose = require('mongoose');
const validator = require('validator');

const communitieSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for the communitie'],
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description for the communitie'],
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

const Communitie = mongoose.model('Communitie', communitieSchema);

module.exports = Communitie;
