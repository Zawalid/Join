const ApiFeatures = require('../utils/ApiFeatures.js');

// Handler to get all documents with filtering, sorting, and pagination
exports.getAll = (model, options = {}) => {
  return async (req, reply) => {
    console.log(options);
    const query = model.find();
    if (options.select) query.select(options.select);
    if (options.populate) query.populate(options.populate);
    
    const features = new ApiFeatures(query, req.query).filter().search(options.search).sort().limitFields().paginate();

    const response = await features.respond();

    reply.status(200).send(response);
  };
};

// Handler to get a single document by ID
exports.getOne = (model, options = {}) => {
  return async (req, reply) => {
    let element = model.findById(req.params.id).select(options.select ? options.select : '-__v');

    if (!element) return reply.status(404).send({ message: `No ${model.modelName} found with that ID` });

    if (options.populate) element = element.populate(options.populate);

    element = await element;

    reply.status(200).send({
      status: 'success',
      data: {
        [model.modelName]: element,
      },
    });
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
exports.updateOne = (model) => {
  return async (req, reply) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) return reply.status(404).send({ message: `No ${model.modelName} found with that ID` });

    reply.status(200).send({
      status: 'success',
      data: {
        [model.modelName]: doc,
      },
    });
  };
};

// Handler to delete a document by ID
exports.deleteOne = (model) => {
  return async (req, reply) => {
    const doc = await model.findByIdAndDelete(req.params.id);

    if (!doc) return reply.status(404).send({ message: `No ${model.modelName} found with that ID` });

    reply.status(204).send({
      status: 'success',
      data: null,
    });
  };
};

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
