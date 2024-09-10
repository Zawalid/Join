const { getOne, getAll, createOne, updateOne, deleteOne } = require('./controllersHandlers');
const Post = require('../models/post');
const { select } = require('../utils/constants');

// Handler to get all posts with search options
exports.getPosts = (req, reply) => {
  const filter = req.params.community_id ? { community: req.params.community_id } : null;
  console.log(filter);
  return getAll('posts', Post, { search: ['content'], filter })(req, reply);
};

// Handler to get a single post with population options
exports.getPost = getOne('post', Post, {
  populate: [
    { path: 'reacts.by', select: select.user },
    { path: 'comments.by', select: select.user },
    { path: 'createdBy', select: select.user },
  ],
});

// Handler to create a new post
exports.createPost = createOne(Post);

// Handler to update an existing post
exports.updatePost = updateOne('post', Post);

// Handler to delete a post
exports.deletePost = deleteOne('post', Post);

// Handler to react to a post
exports.reactToPost = async (req, reply) => {
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

// Handler to comment on a post
exports.commentOnPost = async (req, reply) => {
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

// Handler to save a post to the user's saved posts
exports.savePost = async (req, reply) => {
  const { user } = req;
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
