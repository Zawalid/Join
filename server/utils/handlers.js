const ApiFeatures = require('./ApiFeatures.js');

 const getOne = (type, model, option = {}) => {
  return async (req, reply) => {
    let element = model.findById(req.params.id);
    if (!element) return reply.status(404).send({ message: `${type} not found` });
    if (option.populate) {
      element = element.populate(option.populate);
    }
    element = await element;
    reply.status(200).send({
      status: 'success',
      data: {
        element,
      },
    });
  };
};

 const getAll = (type, model, option = {}) => {
  return async (req, reply) => {
    const features = new ApiFeatures(model.find(), req.query)
      .filter()
      .search(option.search)
      .sort()
      .limitFields()
      .paginate();
    const response = await features.respond();
    reply.status(200).send(response);
  };
};

 const createOne = (model) => {
  return async (req, reply) => {
    const element = await model.create(req.body);
    reply.status(201).send({
      status: 'success',
      data: {
        element,
      },
    });
  };
};

 const updateOne = (type, model) => {
  return async (req, reply) => {
    const element = await model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!element) return reply.status(404).send({ message: `${type} not found` });
    reply.status(200).send({
      status: 'success',
      data: {
        element,
      },
    });
  };
};

 const deleteOne = (type, model) => {
  return async (req, reply) => {
    const element = await model.findByIdAndDelete(req.params.id);
    if (!element) return reply.status(404).send({ message: `${type} not found` });
    reply.status(204).send({
      status: 'success',
      message: `${type} deleted successfully`,
    });
  };
};

module.exports = {
  getOne,
  getAll,
  createOne,
  updateOne,
  deleteOne,
};