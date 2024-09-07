// errorHandler.js
const mongoose = require('mongoose');

function errorHandler(error, request, reply) {
  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    reply.status(400).send({
      status: 'error',
      errors: errors,
    });
  } else {
    // Handle other types of errors
    reply.status(500).send({
      status: 'error',
      message: error.message,
    });
  }
}

module.exports = errorHandler;
