const { Conversation } = require('../models/conversation');

exports.createConversation = async (req, reply) => {
  const { users } = req.body;

  const conversation = await Conversation.create({ users });

  reply.status(201).send({
    status: 'success',
    data: conversation,
  });
};

exports.getUserConversations = async (req, reply) => {
  const conversations = await Conversation.find({ users: req.params.id }).populate('users').populate('messages');
  reply.status(200).send({
    status: 'success',
    data: conversations,
  });
};

exports.getConversationMessages = async (req, reply) => {
  const conversation = await Conversation.findById(req.params.id).select('messages').populate('messages');
  if (!conversation) {
    return reply.status(404).send({ message: 'No conversation found with that ID' });
  }

  reply.status(200).send({
    status: 'success',
    data: conversation.messages,
  });
};
