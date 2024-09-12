const {  joinConnection } = require('../connectDbs');
const { Schema } = require('mongoose');

// Define a schema for the join database
const joinUserSchema = new Schema({
  conversations: [
    {
      type: Schema.Types.ObjectId,
      ref: 'conversation',
    },
  ],
});

// Create models using the respective connections
exports.User = joinConnection.model('user', joinUserSchema);
