const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please tell us your first name!'],
  },
  lastName: {
    type: String,
    required: [true, 'Please tell us your last name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phone: {
    type: Number,
    required: [true, 'Please provide your phone number'],
    unique: true,
  },
  birthDate: {
    type: Date,
    required: [true, 'Please provide your birthday'],
    validate: [validator.isDate, 'Please provide a valid date'],
  },
  Gender: {
    type: String,
    required: [true, 'Please provide your gender'],
  },
  bio: {
    type: String,
  },
  city: {
    type: String,
  },
  country: {
    type: String,
  },

  profilePicture: {
    type: String,
  },
  coverPicture: {
    type: String,
  },
  friends: {
    type: Array,
  },
  posts: {
    type: Array,
  },
  communities: {
    type: Array,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
