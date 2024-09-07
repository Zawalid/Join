const { login, register, logout } = require('../controllers/authController');

module.exports = async function (fastify) {
  fastify.post('/login', login);
  fastify.post('/register', register);
  fastify.post('/logout', logout);
};
