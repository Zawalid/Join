const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

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
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long'],
      maxlength: [20, 'Username must be less than 20 characters long'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Do not return password by default
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: 'Passwords are not the same!',
      },
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      unique: true,
      validate: [(value) => validator.isMobilePhone(value, 'any'), 'Please provide a valid phone number'],
    },
    birthDate: {
      type: Date,
      required: [true, 'Please provide your birthday'],
      validate: [validator.isDate, 'Please provide a valid date'],
    },
    gender: {
      type: String,
      required: [true, 'Please provide your gender'],
      enum: ['Male', 'Female'],
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
    savedPosts: [
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
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance method for passwords
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10); // ms to s
    return JWTTimestamp < changedAt;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpiresAt = Date.now() + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
