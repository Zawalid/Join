const { login, register, logout, refreshToken } = require('../controllers/authController');

module.exports = async function (fastify) {
  fastify.post('/login', login);
  fastify.post('/register', register);
  fastify.post('/logout', { preHandler: [fastify.authenticate] }, logout);
  fastify.post('/refresh-token', refreshToken);
};
