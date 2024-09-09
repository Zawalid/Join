const { updatePassword, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');

module.exports = async function (fastify) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', getUsers);
  fastify.get('/:id', getUser);
  fastify.get('/me', {
    preHandler: (req, reply, done) => {
      req.params.id = req.user.id;
      done();
    },
    handler: getUser,
  });
  fastify.post('/', createUser);
  fastify.patch('/:id', updateUser);
  fastify.patch('/change-password', updatePassword);
  fastify.post('/forgot-password', requestPasswordReset);
  fastify.patch('/reset-password/:token', resetPassword);
  fastify.delete('/:id', deleteUser);
};
