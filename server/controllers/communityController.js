const Community = require('../models/community');
const ApiFeatures = require('../utils/ApiFeatures');
const { select } = require('../utils/constants');

const getCommunities = async (req, reply) => {
  const features = new ApiFeatures(Community.find(), req.query)
    .filter()
    .search(['name', 'description'])
    .sort()
    .limitFields()
    .paginate();
  const response = await features.respond();
  reply.status(200).send(response);
};
const getCommunity = async (req, reply) => {
  const community = await Community.findById(req.params.id).populate([
    { path: 'admins', select: 'firstName lastName profilePicture' },
    { path: 'members', select: 'firstName lastName profilePicture' },
  ]);
  if (!community) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Community not found',
    });
  }
  reply.status(200).send({
    status: 'success',
    data: {
      community,
    },
  });
};
const createCommunity = async (req, reply) => {
  const community = await Community.create(req.body);
  reply.status(201).send({
    status: 'success',
    data: {
      community,
    },
  });
};
const updateCommunity = async (req, reply) => {
  const community = await Community.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!community) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Community not found',
    });
  }
  reply.status(200).send({
    status: 'success',
    data: {
      community,
    },
  });
};
const deleteCommunity = async (req, reply) => {
  const community = await Community.findByIdAndDelete(req.params.id);
  if (!community) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Community not found',
    });
  }
  reply.status(204).send(
    {
      status: 'success',
      message: 'Community deleted successfully',
    }
  );
};
const getCommunityPosts = async (req, reply) => {
  const community = await Community.findById(req.params.id).populate({
    path: 'posts',
    populate: [
      { path: 'createdBy', select: select.user },
      { path: 'reacts.by', select: select.user },
      { path: 'comments.by', select: select.user },
    ],
  });
  if (!community) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Community not found',
    });
  }
  reply.status(200).send({
    status: 'success',
    data: {
      posts: community.posts,
    },
  });
};
const getCommunityMembers = async (req, reply) => {
  const community = await Community.findById(req.params.id).populate({
    path: 'members',
    select: 'firstName lastName profilePicture',
  });
  if (!community) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Community not found',
    });
  }
  reply.status(200).send({
    status: 'success',
    data: {
      members: community.members,
    },
  });
};
const setCommunityAdmins = async (req, reply) => {
  const community = await Community.findById(req.params.id);
  if (!community) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Community not found',
    });
  }
  req.body.admins.forEach(element => {
      if (!community.admins.includes(element)) {
        community.admins.push(element);
      }
  }); 
  await community.save();
  reply.status(200).send({
    status: 'success',
    data: {
      community,
    },
  });
};
const joinCommunity = async (req, reply) => {
  const community = await Community.findById(req.params.id);
  if (!community) {
    return reply.status(404).send({
      status: 'fail',
      message: 'Community not found',
    });
  }
  if (community.members.includes(req.body._id)) {
    return reply.status(400).send({
      status: 'fail',
      message: 'You are already a member of this community',
    });
  }
  community.members.push(req.body._id);
  await community.save();
  reply.status(200).send({
    status: 'success',
    data: {
      community,
    },
  });
};

module.exports = {
  getCommunities,
  getCommunity,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  getCommunityPosts,
  getCommunityMembers,
  setCommunityAdmins,
  joinCommunity,
};
