const User = require('../models/user');
const ApiFeatures = require('../utils/ApiFeatures');

const getUsers = async (req, reply) => {
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .search(['firstName', 'lastName', 'username'])
    .sort()
    .limitFields()
    .paginate();
  const response = await features.respond();
  reply.status(200).send(response);
};
const getUser = async (req, reply) => {
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
const createUser = async (req, reply) => {
  reply.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /register instead',
  });
};
const updateUser = async (req, reply) => {
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
const deleteUser = async (req, reply) => {
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

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
