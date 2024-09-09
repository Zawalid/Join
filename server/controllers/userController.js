const User = require('../models/user');
const ApiFeatures = require('../utils/ApiFeatures');
const ApiError = require('../utils/ApiError');
const { filterObject } = require('../utils/helpers');
const { logout } = require('./authController');

exports.getUsers = async (req, reply) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .search(['firstName', 'lastName', 'username'])
    .sort()
    .limitFields()
    .paginate();
  const response = await features.respond();
  reply.status(200).send(response);
};
exports.getUser = async (req, reply) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return reply.status(404).send({
      status: 'fail',
      message: 'User not found',
    });
  }
  reply.status(200).send({
    status: 'success',
    data: {
      user,
    },
  });
};
exports.createUser = async (req, reply) => {
  reply.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /register instead',
  });
};
exports.updateUser = async (req, reply) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return reply.status(404).send({
      status: 'fail',
      message: 'User not found',
    });
  }
  reply.status(200).send({
    status: 'success',
    data: {
      user,
    },
  });
};
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

exports.deleteUser = async (req, reply) => {
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

exports.deleteMe = async (req, reply) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  await logout(req, reply, 'Your account was deleted successfully');
};
