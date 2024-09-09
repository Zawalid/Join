const Fastify = require('fastify');
const mongoose = require('mongoose');
const errorHandler = require('./utils/errorHandler');
const { authenticate } = require('./controllers/authController');
require('dotenv').config();
require('./utils/cleanup');

//*--------
const fastify = Fastify({
  logger: true,
  ignoreTrailingSlash: true,
  caseSensitive: false,
  ignoreDuplicateSlashes: true,
});

// Error handler
fastify.setErrorHandler(errorHandler);

// Decorate Fastify with the authenticate function
fastify.decorate('authenticate', authenticate);

//*-------- Register plugins
fastify
  .register(require('@fastify/jwt'), {
    secret: process.env.JWT_SECRET,
    cookie: { cookieName: 'token' },
    decode: { complete: true },
  })
  .addHook('preHandler', (req, reply, done) => {
    req.jwt = fastify.jwt;
    return done();
  })
  .register(require('@fastify/cors'), { origin: '*' })
  .register(require('@fastify/helmet'))
  .register(require('@fastify/rate-limit'), { max: 100, timeWindow: '1 minute' })
  .register(require('@fastify/multipart'))
  .register(require('@fastify/cookie'))
  .register(require('@fastify/csrf-protection'))
  .register(require('fastify-mongodb-sanitizer'), { params: true, query: true, body: true })
  .ready((err) => {
    if (err) throw err;
    console.log('Everything has been loaded');
  });

//*-------- Register routes

fastify
  .register(require('./routes/authRoutes'), { prefix: '/api/v1' })
  .register(require('./routes/userRoutes'), { prefix: '/api/v1/users' })
  .register(require('./routes/postRoutes'), { prefix: '/api/v1/posts' })
  .register(require('./routes/communityRoutes'), { prefix: '/api/v1/communities' });

//*-------- Start the server
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
const port = process.env.PORT || 3000;

const start = async () => {
  try {
    const db = await mongoose.connect(DB, { dbName: 'join' });
    fastify.log.info(`database connected ${db.connection.host} ${db.connection.name}`);
    await fastify.listen({ port });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
