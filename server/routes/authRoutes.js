const {
  login,
  register,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
} = require('../controllers/authController');

module.exports = async function (fastify) {
  // Authentication routes
  fastify.post('/login', login);
  fastify.post('/register', register);
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, logout);
  fastify.post('/refresh-token', refreshToken);

  // Password management routes
  fastify.post('/forgot-password', requestPasswordReset);
  fastify.patch('/reset-password/:token', resetPassword);
};
