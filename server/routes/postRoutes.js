const {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  reactToPost,
  commentOnPost,
  savePost,
} = require('../controllers/postController');

module.exports = async function (fastify) {
  fastify.get('/', getPosts);
  fastify.get('/:id', getPost);
  fastify.post('/', createPost);
  fastify.patch('/:id', updatePost);
  fastify.delete('/:id', deletePost);
  fastify.post('/:id/react', reactToPost);
  fastify.post('/:id/comment', commentOnPost);
  fastify.post('/:id/save', savePost);
};
