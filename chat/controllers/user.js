const { User } = require('../models/user');

exports.getAllUsers = async (req, reply) => {
  try {
    const users = await User.find();
    return users;
  } catch (err) {
    throw new Error(err);
  }
};


exports.addConversationToUser = async (req, reply) => {
  try {
    const userId = '66e2b08409a08d6379752a4b';
    const conversationId = '66e2b08409a08d6379752a4b';
    const user = await User.findById(userId);
    user.conversations.push(conversationId);
    await user.save();
    return user;
  } catch (err) {
    throw new Error(err);
  }
};
