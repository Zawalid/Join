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



db.getCollection('users').drop();
// Insert the generated users into the 'users' collection
db.getCollection('users').insertMany(Array.from({ length: 10 }, generateUsers));
