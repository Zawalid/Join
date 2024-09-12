const { getAllUsers , addConversationToUser } = require('../controllers/user');

module.exports = function (fastify, _, done) {
    fastify.get('/', getAllUsers); // Get all users
    fastify.post('/addConversation', addConversationToUser); // Add conversation to user
  done();
};
