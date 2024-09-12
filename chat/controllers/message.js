const { Message } = require('../models/message');
const { Conversation } = require('../models/conversation');
const { reactToElement } = require('./handlers');

exports.sendMessage = async (req, reply) => {
  const { sender, conversationId, content } = req.body;

  const message = await Message.create({ sender, conversation, content });

  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    return reply.status(404).send({ message: 'No conversation found with that ID' });
  }
  conversation.messages.push(message._id);

  reply.status(201).send({
    status: 'success',
    data: message,
  });
};



exports.deleteMessage = async (req, reply) => {
  const message = await Message.findByIdAndDelete(req.params.id);
  if (!message) {
    return reply.status(404).send({ message: 'No message found with that ID' });
  }

  reply.status(204).send({
    status: 'success',
  });
};

exports.reactToMessage = reactToElement(Message);
