const Fastify = require('fastify');
const mongoose = require('mongoose');

const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
  caseSensitive: false,
  ignoreDuplicateSlashes: true,
});
// Options for the env plugin
const options = {
  confKey: 'config',
  schema: {
    type: 'object',
    required: ['DATABASE', 'DATABASE_PASSWORD', 'JWT_SECRET', 'PORT'],
    properties: {
      DATABASE: { type: 'string' },
      DATABASE_PASSWORD: { type: 'string' },
      JWT_SECRET: { type: 'string' },
      PORT: { type: 'string', default: 3000 },
    },
  },
  dotenv: true,
};

// Register plugins
const registerPlugins = async () => {
  await fastify.register(require('@fastify/env'), options);
  fastify
    .register(require('@fastify/cors'), { origin: '*' })
    .register(require('@fastify/helmet'))
    .register(require('@fastify/rate-limit'), { max: 100, timeWindow: '1 minute' })
    .register(require('@fastify/multipart'))
    .register(require('@fastify/cookie'))
    .register(require('@fastify/csrf-protection'))
    .register(require('@fastify/url-data'))
    .register(require('fastify-mongodb-sanitizer'), { params: true, query: true, body: true })
    .register(require('@fastify/jwt'), {
      secret: fastify.config.JWT_SECRET,
      cookie: { cookieName: 'token' },
    })
    .ready((err) => {
      if (err) throw err;
      console.log('Everything has been loaded');
    });
};

// Register routes
fastify.register(require('./routes/userRoutes'), { prefix: '/api/v1/users' });

// Start the server
const start = async () => {
  try {
    await registerPlugins();

    const DB = fastify.config.DATABASE.replace('<PASSWORD>', fastify.config.DATABASE_PASSWORD);
    const port = fastify.config.PORT;

    const db = await mongoose.connect(DB, { dbName: 'join' });
    fastify.log.info(`database connected ${db.connection.host} ${db.connection.name}`);
    await fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
