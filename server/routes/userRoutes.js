const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  updateMe,
  deleteUser,
  deleteMe,
} = require('../controllers/userController');
const { updatePassword } = require('../controllers/authController');

module.exports = async function (fastify, _, done) {
  // Add authentication hook
  fastify.addHook('preHandler', fastify.authenticate);

  // User routes
  fastify.get('/', getUsers); // Get all users
  fastify.get('/:id', getUser); // Get a specific user by ID
  fastify.post('/', createUser); // Create a new user
  fastify.patch('/:id', updateUser); // Update a specific user by ID
  fastify.delete('/:id', deleteUser); // Delete a specific user by ID

  // Profile routes
  fastify.get('/me', {
    preHandler: (req, reply, done) => {
      req.params.id = req.user.id;
      done();
    },
    handler: getUser, // Get the current user's profile
  });
  fastify.patch('/me/update', updateMe); // Update the current user's profile
  fastify.patch('/me/change-password', updatePassword); // Change the current user's password
  fastify.delete('/me/delete', deleteMe); // Delete the current user's account

  // Call done() to signal that the route registration is complete
  done();
};