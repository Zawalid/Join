const {
  replyToComment,
  getCommentReplies,
  updateComment,
  reactToComment,
  deleteComment,
} = require('../controllers/commentController');

module.exports = function (fastify, _, done) {
  // Add authentication hook
  fastify.addHook('preHandler', fastify.authenticate);

  // Comment routes
  fastify.post('/:id/reply', replyToComment); // reply to specific comment
  fastify.get('/:id/replies', getCommentReplies); // Get all replies to a comment
  fastify.patch('/:id', updateComment); // Update a comment
  fastify.post('/:id/react', reactToComment); // add reaction to comment
  fastify.delete('/:postId/:commentId', deleteComment); // delete comment

  done();
};
