const { getOne, getAll, updateOne } = require('./controllersHandlers');
const User = require('../models/user');
const ApiError = require('../utils/ApiError');
const { filterObject } = require('../utils/helpers');
const { logout } = require('./authController');

// Get all users with search options
exports.getUsers = getAll('users', User, { search: ['firstName', 'lastName', 'email'] });

// Get a single user by ID
exports.getUser = getOne('user', User);

// Create a new user (not defined, use /register instead)
exports.createUser = async (req, reply) => {
  reply.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /register instead',
  });
};

// Update an existing user by ID
exports.updateUser = updateOne('user', User);

// Update the authenticated user's own profile
exports.updateMe = async (req, reply) => {
  if (req.body.password || req.body.passwordConfirm) {
    throw new ApiError('This route is not for password updates. Please use /users/me/change-password.', 400);
  }
  // Filter the request body to only include allowed fields
  const filteredBody = filterObject(
    req.body,
    ['firstName', 'lastName', 'phone', 'birthDate', 'gender', 'bio', 'address'],
    'include'
  );

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  reply.status(200).send({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
};

// Delete a user by ID
exports.deleteUser = async (req, reply) => {
  if (req.params.id === req.user.id) return exports.deleteMe(req, reply);
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return reply.status(404).send({
      status: 'fail',
      message: 'User not found',
    });
  }
  reply.status(204).send({
    status: 'success',
    data: null,
  });
};

// Deactivate the authenticated user's own account
exports.deleteMe = async (req, reply) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  await logout(req, reply, 'Your account was deleted successfully');
};
