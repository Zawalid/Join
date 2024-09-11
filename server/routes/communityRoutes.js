const {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityPosts,
  getCommunityMembers,
  setCommunityAdmins,
  joinCommunity,
} = require('../controllers/communityController');

module.exports =  function (fastify, _, done) {
  // Add authentication hook
  fastify.addHook('preHandler', fastify.authenticate);

  // Community routes
  fastify.get('/', getCommunities); // Get all communities
  fastify.get('/:id', getCommunity); // Get a specific community by ID
  fastify.post('/', createCommunity); // Create a new community
  fastify.patch('/:id', updateCommunity); // Update a specific community by ID
  fastify.delete('/:id', deleteCommunity); // Delete a specific community by ID

  // Community members routes
  fastify.get('/:id/members', getCommunityMembers); // Get members of a specific community
  // fastify.register(require('./userRoutes'), { prefix: '/:community_id/members' });
  fastify.post('/:id/join', joinCommunity); // Join a specific community

  // Community posts routes
  fastify.get('/:id/posts', getCommunityPosts); // Get posts of a specific community
  // fastify.register(require('./postRoutes'), { prefix: '/:community_id/posts' });

  // Community admins routes
  fastify.post('/:id/admins', setCommunityAdmins); // Set admins for a specific community

  // Call done() to signal that the route registration is complete
  done();
};
