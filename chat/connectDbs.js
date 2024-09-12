require('dotenv').config();

const mongoose = require('mongoose');

const chatDbURI = process.env.CHAT_DATABASE.replace('<db_password>', process.env.CHAT_DATABASE_PASSWORD);
const DBUri = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

exports.chatConnection = mongoose.createConnection(chatDbURI, { dbName: 'chat' });

exports.joinConnection = mongoose.createConnection(DBUri, { dbName: 'join' });
