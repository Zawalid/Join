const { faker } = require('@faker-js/faker');
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use('join');

// Users seeder
const generateUsers = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  username: faker.internet.userName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
  phone: faker.phone.number(),
  birthDate: faker.date.past(30, new Date(2000, 0, 1)),
  gender: faker.person.sex(),
  bio: faker.lorem.sentence(),
  address: {
    street: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    zip: faker.location.zipCode(),
  },
  profilePicture: faker.image.avatar(),
  coverPicture: faker.image.url(800, 200, 'nature', true, true, 'Cover Image'),
  friends: [],
  posts: [],
  communities: [],
  createdAt: new Date(),
  updatedAt: new Date(),
});
const generatePost = () => ({
  content: faker.lorem.paragraph(),
  reactions: Array.from({ length: 5 }, () => ({
    by: '66db9d2065461e8258cc6ecd',
    react: 'like',
  })),
  comments: [],
  images: Array.from({ length: 5 }, () => faker.image.url(800, 200, 'nature', true, true, 'Cover Image')),
  tags: Array.from({ length: 5 }, () => faker.lorem.word()),
  community: '66df0e739970a53c83da5b95', // Replace with actual community ObjectId if needed
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: '66e0fafa7e69a87ea9f5a0a0',
});

const generateCommunity = () => ({
  name: faker.lorem.word(),
  description: faker.lorem.sentence(),
  members: ['66db9d2065461e8258cc6ecb', '66db9d2065461e8258cc6ecd', '66db9d2065461e8258cc6ecf'],
  admins: ['66db9d2065461e8258cc6ecb', '66db9d2065461e8258cc6ecd'],
  posts: ['66dc97c496bbb930df6ec2fc', '66dc97c496bbb930df6ec2fd'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const generateComment = () => ({
  content: faker.lorem.sentence(),
  by: '66e0fafa7e69a87ea9f5a0a0',
  post: '66e1d3449c7b8e9b610bbe1e',
  reactions: [
    {
      by: '66e0fafa7e69a87ea9f5a0a0',
      reaction: 'like',
    },
  ],
});

// Generate and insert 5 posts
const posts = Array.from({ length: 2 }, generatePost);
const users = Array.from({ length: 10 }, generateUsers);
const communities = Array.from({ length: 5 }, generateCommunity);
const comments = Array.from({ length: 2 }, generateComment);

// db.getCollection('users').drop();
// db.getCollection('users').insertMany(users);

// db.getCollection('posts').drop();
// db.getCollection('posts').insertMany(posts);

// db.getCollection('communities').drop();
// db.getCollection('communities').insertMany(communities);

// db.getCollection('comments').drop();
// db.getCollection('comments').insertMany(comments);
