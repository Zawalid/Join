const Post = require('../models/post');
const ApiFeatures = require('../utils/ApiFeatures');
const { select } = require('../utils/constants');

const getPosts = async (req, reply) => {
    const features = new ApiFeatures(Post.find(), req.query)
      .filter()
      .search(['content', 'tags'])
      .sort()
      .limitFields()
      .paginate();
    const response = await features.respond();
    reply.status(200).send(response);
  
};
const getPost = async (req, reply) => {
  const post = await Post.findById(req.params.id).populate([
    { path: 'reacts.by', select: select.user },
    { path: 'comments.by', select: select.user },
    { path: 'createdBy', select: select.user },
  ]);
  if (!post) {
    return reply.status(404).send({
      status: 'fail',
      message: 'post not found',
    });
  }
  reply.status(200).send({
    status: 'success',
    data: {
      post,
    },
  });
};
const createPost = async (req, reply) => {
  const post = await Post.create(req.body);
  reply.status(201).send({
    status: 'success',
    data: {
      post,
    },
  });
};
const updatePost = async (req, reply) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!post) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Post not found',
    });
  }
  reply.status(200).send({
    status: 'success',
    data: {
      post,
    },
  });
};
const deletePost = async (req, reply) => {
  const post = await Post.findByIdAndDelete(req.params.id);
  if (!post) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Post not found',
    });
  }
  reply.status(204).send({
    status: 'success',
    data: null,
  });
};
const reactToPost = async (req, reply) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Post not found',
    });
  }
  post.reacts.push(req.body);
  await post.save();
  reply.status(200).send({
    status: 'success',
    data: {
      post,
    },
  });
};
const commentOnPost = async (req, reply) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Post not found',
    });
  }
  post.comments.push(req.body);
  await post.save();
  reply.status(200).send({
    status: 'success',
    data: {
      post,
    },
  });
};

module.exports = {
  getPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  reactToPost,
  commentOnPost,
};
