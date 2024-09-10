const ApiFeatures = require('../utils/ApiFeatures.js');

// Handler to get a single document by ID
exports.getOne = (type, model, options = {}) => {
  return async (req, reply) => {
    let element = model.findById(req.params.id);

    if (!element) return reply.status(404).send({ message: `No ${type} found with that ID` });

    if (options.populate) element = element.populate(options.populate);

    element = await element;

    reply.status(200).send({
      status: 'success',
      data: {
        [type]: element,
      },
    });
  };
};

// Handler to get all documents with filtering, sorting, and pagination
exports.getAll = (type, model, options = {}) => {
  return async (req, reply) => {
    const query = options.populate ? model.find().populate(options.populate) : model.find();
    const features = new ApiFeatures(query, req.query).filter().search(options.search).sort().limitFields().paginate();

    const response = await features.respond();

    reply.status(200).send(response);
  };
};

// Handler to create a new document
exports.createOne = (model) => {
  return async (req, reply) => {
    const doc = await model.create(req.body);

    reply.status(201).send({
      status: 'success',
      data: {
        doc,
      },
    });
  };
};

// Handler to update a document by ID
exports.updateOne = (type, model) => {
  return async (req, reply) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return reply.status(404).send({ message: `No ${type} found with that ID` });

    reply.status(200).send({
      status: 'success',
      data: {
        [type]: doc,
      },
    });
  };
};

// Handler to delete a document by ID
exports.deleteOne = (type, model) => {
  return async (req, reply) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) return reply.status(404).send({ message: `No ${type} found with that ID` });

    reply.status(204).send({
      status: 'success',
      data: null,
    });
  };
};
