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

module.exports = async function (fastify) {
  fastify.addHook('preHandler', fastify.authenticate);

  // User routes
  fastify.get('/', getUsers);
  fastify.get('/:id', getUser);
  fastify.post('/', createUser);
  fastify.patch('/:id', updateUser);
  fastify.delete('/:id', deleteUser);

  // Profile routes
  fastify.get('/me', {
    preHandler: (req, reply, done) => {
      req.params.id = req.user.id;
      done();
    },
    handler: getUser,
  });
  fastify.patch('/me/update', updateMe);
  fastify.patch('/me/change-password', updatePassword);
  fastify.delete('/me/delete', deleteMe);
};
