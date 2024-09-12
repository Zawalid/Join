const Fastify = require('fastify');
const mongoose = require('mongoose');
const { JoinUser } = require('./models/user');

//*-------- Initiate the app
const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
  caseSensitive: false,
  ignoreDuplicateSlashes: true,
});

//register routes
fastify.register(require('./routes/user'));

const startServer = async () => {
  try {
    await fastify.listen(3000);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

startServer();
