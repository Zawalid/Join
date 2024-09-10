const {
  login,
  register,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');

module.exports = async function (fastify, _, done) {
  // Authentication routes
  fastify.post('/login', login); // User login
  fastify.post('/register', register); // User registration
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, logout); // User logout
  fastify.post('/refresh-token', refreshToken); // Refresh authentication token

  // Password management routes
  fastify.post('/forgot-password', requestPasswordReset); // Request password reset
  fastify.patch('/reset-password/:token', resetPassword); // Reset password using token

  // Call done() to signal that the route registration is complete
  done();
};
