const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  reactToPost,
  savePost,
} = require('../controllers/postController');

const { commentOnPost, getPostComments } = require('../controllers/commentController');

module.exports = function (fastify, _, done) {
  // Add authentication hook
  fastify.addHook('preHandler', fastify.authenticate);

  // Post routes
  fastify.get('/', getPosts); // Get all posts
  fastify.get('/:id', getPost); // Get a specific post by ID
  fastify.post('/', createPost); // Create a new post
  fastify.patch('/:id', updatePost); // Update a specific post by ID
  fastify.delete('/:id', deletePost); // Delete a specific post by ID

  // Post interactions routes
  fastify.post('/:id/reactions', reactToPost); // React to a specific post
  fastify.post('/:id/comments', commentOnPost); // Comment on a specific post
  fastify.get('/:id/comments', getPostComments); // get all comments on a specific post
  fastify.post('/:id/save', savePost); // Save a specific post

  // Call done() to signal that the route registration is complete
  done();
};
