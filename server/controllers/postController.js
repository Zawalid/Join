const { getOne, getAll, createOne, updateOne, deleteOne, reactToElement } = require('./controllersHandlers');
const Post = require('../models/post');
const { select } = require('../utils/constants');

// Handler to get all posts with search options
exports.getPosts = getAll( Post, { search: ['content'] });

// Handler to get a single post with population options
exports.getPost = getOne( Post, {
  populate: [
    { path: 'reactions.by', select: select.user },
    { path: 'createdBy', select: select.user },
    { path: 'comments' },
  ],
});

// Handler to create a new post
exports.createPost = createOne(Post);

// Handler to update an existing post
exports.updatePost = updateOne( Post);

// Handler to delete a post
exports.deletePost = deleteOne( Post);

// Handler to react to a post
exports.reactToPost = reactToElement( Post); 

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
