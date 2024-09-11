const ApiError = require('../utils/ApiError');
const Comment = require('../models/comment');
const Post = require('../models/post');
const mongoose = require('mongoose');
const { getOne, updateOne, reactToElement } = require('./controllersHandlers');

// Handler to get all comments with search options
exports.getPostComments = exports.getPost = getOne(Post, {
  select: 'comments',
  populate: { path: 'comments' },
});

// Handler to comment on a post
exports.commentOnPost = async (req, reply) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new ApiError('Post not found', 404);

  const newComment = await Comment.create(req.body);
  console.log(post);
  post.comments.push(newComment._id);
  await post.save({ validateBeforeSave: false });

  reply.status(200).send({ message: 'comment added' });
};

exports.replyToComment = async (req, reply) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new ApiError('comment not found', 404);

  const commentReply = await Comment.create(req.body);
  commentReply.replies = undefined;
  commentReply.post = undefined;

  await commentReply.save();

  comment.replies.push(commentReply._id);
  await comment.save();

  reply.status(200).send({ message: 'reply added' });
};

exports.getCommentReplies = getOne(Comment, {
  select: 'replies',
  populate: { path: 'replies' },
});

exports.deleteComment = async (req, reply) => {
  const { postId, commentId } = req.params;

  // Find and delete the comment
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError('Comment not found', 404);
  await Comment.findByIdAndDelete(commentId);

  // Remove the comment ID from the comments array in the post
  const post = await Post.findById(postId);
  if (!post) throw new ApiError('Post not found', 404);

  post.comments = post.comments.filter((id) => !id.equals(new mongoose.Types.ObjectId(commentId)));
  await post.save({ validateBeforeSave: false });

  reply.status(200).send({ message: 'Comment deleted' });
};

exports.updateComment = updateOne(Comment);

exports.reactToComment = reactToElement(Comment);
