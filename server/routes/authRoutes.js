const {
  login,
  register,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  initiateGoogleAuth,
  googleAuth,
} = require('../controllers/authController');

module.exports = function (fastify, _, done) {
  // Authentication routes
  fastify.post('/login', login); // User login
  fastify.post('/register', register); // User registration
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, logout); // User logout
  fastify.post('/refresh-token', refreshToken); // Refresh authentication token
  fastify.get('/verify-email/:token', verifyEmail); // Verify email address
  fastify.post('/resend-verification-email', resendVerificationEmail); // Resend email verification

  // Google auth
  fastify.get('/auth/google', initiateGoogleAuth);
  fastify.get('/auth/google/callback', googleAuth);

  // Password management routes
  fastify.post('/forgot-password', requestPasswordReset); // Request password reset
  fastify.patch('/reset-password/:token', resetPassword); // Reset password using token

  // Call done() to signal that the route registration is complete
  done();
};
