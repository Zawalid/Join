const { sendMessage, deleteMessage, reactToMessage } = require('../controllers/message');

module.exports = function (fastify, _, done) {
  fastify.post('/', sendMessage); // Get all users
  fastify.post('/:id/react', reactToMessage); // Add conversation to user
  fastify.delete('/:id', deleteMessage); // Add conversation to user

  done();
};
