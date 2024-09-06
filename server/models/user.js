const mongoose = require('mongoose');
const validator = require('validator');
// const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Please tell us your first name!'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Please tell us your last name!'],
      trim: true,
    },
    username: {
      type: String,
      required: [true, 'Please provide a username'],
      uniquer : true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [20, 'Username must be less than 20 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      uniquer : true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Do not return password by default
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      uniquer : true,
      validate: {
        validator: function (v) {
          return /^\+?[1-9]\d{1,14}$/.test(v); // International phone number format
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    birthDate: {
      type: Date,
      required: [true, 'Please provide your birthday'],
      validate: [validator.isDate, 'Please provide a valid date'],
    },
    gender: {
      type: String,
      required: [true, 'Please provide your gender'],
      enum: ['Male', 'Female', 'Other'],
    },
    bio: {
      type: String,
      maxLength: [500, 'Bio must be less than 500 characters'],
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      zip: { type: String, trim: true },
    },
    profilePicture: {
      type: String,
      validate: [validator.isURL, 'Please provide a valid URL'],
    },
    coverPicture: {
      type: String,
      validate: [validator.isURL, 'Please provide a valid URL'],
    },
    friends: [
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
    communities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
      },
    ],
  },
  {
    timestamps: true,
  }
);



// Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 12);
//   next();
// });

// Instance method to check password
// userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
//   return await bcrypt.compare(candidatePassword, userPassword);
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
