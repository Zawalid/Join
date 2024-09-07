const { getUsers, getUser, createUser, updateUser, deleteUser } = require('../controllers/userController');

module.exports = async function (fastify) {
  fastify.addHook('preHandler', fastify.authenticate);

  fastify.get('/', getUsers);
  fastify.get('/:id', getUser);
  fastify.post('/', createUser);
  fastify.put('/:id', updateUser);
  fastify.delete('/:id', deleteUser);
};
