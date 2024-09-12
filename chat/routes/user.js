const {  getUserConversations} = require('../controllers/conversation');

exports.default = function (fastify, _, done) {
  fastify.get('/:id/conversations', getUserConversations); // Get all conversations
  done();
};
