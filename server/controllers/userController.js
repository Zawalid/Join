const User = require('../models/user');
const APIFeatures = require('../utils/APIFeatures');

const getUsers = async (request, reply) => {
  try {
    const features = new APIFeatures(User.find(), request.query)
      .filter()
      .search(['firstName', 'lastName', 'username'])
      .sort()
      .limitFields()
      .paginate();
    const response = await features.respond();
    reply.code(200).send(response);
  } catch (error) {
    reply.code(500).send({ status: 'error', error: error.message });
  }
};

const getUser = async (request, reply) => {
  try {
    const user = await User.findById(request.params.id);
    if (!user) {
      return reply.code(404).send({
        status: 'fail',
        message: 'User not found',
      });
    }
    reply.code(200).send({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    reply.code(500).send({
      status: 'error',
      message: error.message,
    });
  }
};

const createUser = async (request, reply) => {
  try {
    const user = await User.create(request.body);
    reply.code(201).send({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    reply.code(500).send({
      status: 'error',
      message: error.message,
    });
  }
};

const updateUser = async (request, reply) => {
  try {
    const user = await User.findByIdAndUpdate(request.params.id, request.body, {
      new: true,
      runValidators: true,
    });
    if (!user) {
      return reply.code(404).send({
        status: 'fail',
        message: 'User not found',
      });
    }
    reply.code(200).send({
      status: 'success',
      data: {
        user,
      },
    });
  } catch (error) {
    reply.code(500).send({
      status: 'error',
      message: error.message,
    });
  }
};

const deleteUser = async (request, reply) => {
  try {
    const user = await User.findByIdAndDelete(request.params.id);
    if (!user) {
      return reply.code(404).send({
        status: 'fail',
        message: 'User not found',
      });
    }
    reply.code(204).send({
      status: 'success',
      data: null,
    });
  } catch (error) {
    reply.code(500).send({
      status: 'error',
      message: error.message,
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
