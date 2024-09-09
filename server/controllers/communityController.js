const { getOne, getAll, createOne, updateOne, deleteOne } = require('../utils/handlers');
const Community = require('../models/community');
const { select } = require('../utils/constants');

const getCommunities = getAll('communities', Community, { search: ['name', 'description'] });
const getCommunity = getOne('community', Community, {
  populate: [
    { path: 'admins', select: 'firstName lastName profilePicture' },
    { path: 'members', select: 'firstName lastName profilePicture' },
  ],
});
const createCommunity = createOne(Community);
const updateCommunity = updateOne('community', Community);
const deleteCommunity = deleteOne('community', Community);
const getCommunityPosts = getOne('community', Community, {
  populate: {
    path: 'posts',
    populate: [
      { path: 'createdBy', select: select.user },
      { path: 'reacts.by', select: select.user },
      { path: 'comments.by', select: select.user },
    ],
  },
});
const getCommunityMembers = getOne('community', Community, {
  populate: {
    path: 'members',
    select: 'firstName lastName profilePicture',
  },
});
const setCommunityAdmins = async (req, reply) => {
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
const joinCommunity = async (req, reply) => {
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
