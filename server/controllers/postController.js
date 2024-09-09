const { getOne, getAll, createOne, updateOne, deleteOne } = require('../utils/handlers');
const Post = require('../models/post');

const { select } = require('../utils/constants');

const getPosts = getAll('posts', Post, { search: ['content'] });
const getPost = getOne('post', Post, {
  populate: [
    { path: 'reacts.by', select: select.user },
    { path: 'comments.by', select: select.user },
    { path: 'createdBy', select: select.user },
  ],
});
const createPost = createOne(Post);
const updatePost = updateOne('post', Post);
const deletePost = deleteOne('post', Post);

const reactToPost = async (req, reply) => {
  const post = await Post.findById(req.params.id);
  if (!post) return reply.status(404).send({ message: 'post not found' });
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
  if (!post) return reply.status(404).send({ message: 'post not found' });
  post.comments.push(req.body);
  await post.save();
  reply.status(200).send({
    status: 'success',
    data: {
      post,
    },
  });
};
const savePost = async (req, reply) => {
  const { user } = req;
  console.log(req.user);
  const post = await Post.findById(req.params.id);
  if (!post) return reply.status(404).send({ message: 'post not found' });
  if (user.savedPosts.includes(post._id)) return reply.status(404).send({ message: 'Post already saved' });

  user.savedPosts.push(post._id);
  await post.save();
  reply.status(200).send({
    status: 'success',
    data: {
      savedPosts: user.savedPosts,
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
  savePost,
};
