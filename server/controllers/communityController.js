const { getOne, getAll, createOne, updateOne, deleteOne } = require('./controllersHandlers');
const Community = require('../models/community');
const { select } = require('../utils/constants');

// Get all communities with search and population options
exports.getCommunities = getAll('communities', Community, {
  search: ['name', 'description'],
  populate: [
    { path: 'admins', select: 'firstName lastName profilePicture' },
    { path: 'members', select: 'firstName lastName profilePicture' },
  ],
});

// Get a single community with population options
exports.getCommunity = getOne('community', Community, {
  populate: [
    { path: 'admins', select: 'firstName lastName profilePicture' },
    { path: 'members', select: 'firstName lastName profilePicture' },
  ],
});

// Create a new community
exports.createCommunity = createOne(Community);

// Update an existing community
exports.updateCommunity = updateOne('community', Community);

// Delete a community
exports.deleteCommunity = deleteOne('community', Community);

// Get posts of a community with nested population options
exports.getCommunityPosts = getOne('community', Community, {
  populate: {
    path: 'posts',
    populate: [
      { path: 'createdBy', select: select.user },
      { path: 'reacts.by', select: select.user },
      { path: 'comments.by', select: select.user },
    ],
  },
});

// Get members of a community with specific fields selected
exports.getCommunityMembers = getOne('community', Community, {
  populate: {
    path: 'members',
    select: 'firstName lastName profilePicture',
  },
});

// Set admins for a community
exports.setCommunityAdmins = async (req, reply) => {
  const community = await Community.findById(req.params.id);

  if (!community) return reply.status(404).send({ message: 'Community not found' });

  req.body.admins.forEach((element) => {
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

// Join a community
exports.joinCommunity = async (req, reply) => {
  const community = await Community.findById(req.params.id);

  if (!community) return reply.status(404).send({ message: 'Community not found' });

  if (community.members.includes(req.body._id))
    return reply.status(404).send({ message: 'You are already a member of this community' });

  community.members.push(req.body._id);

  await community.save();

  reply.status(200).send({
    status: 'success',
    data: {
      community,
    },
  });
};
