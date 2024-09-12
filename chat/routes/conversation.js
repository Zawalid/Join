const { createConversation ,getConversationMessages } = require('../controllers/conversation');

exports.default = function (fastify, _, done) {
  fastify.post('/', createConversation); // Create conversation
  fastify.get('/:id/messages', getConversationMessages); // Get all conversations
  done();
};
