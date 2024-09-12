

exports.reactToElement = (model) => {
  return async (req, reply) => {
    const element = await model.findById(req.params.id);

    if (!element) return reply.status(404).send({ message: `No ${model.modelName} found with that ID` });

    element.reactions.push(req.body);

    await element.save();

    reply.status(200).send({
      status: 'success',
      data: {
        [model.modelName]: element,
      },
    });
  };
};
