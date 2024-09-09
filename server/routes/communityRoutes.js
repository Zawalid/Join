const { getCommunities, getCommunity, createCommunity,updateCommunity,deleteCommunity ,getCommunityPosts, getCommunityMembers, setCommunityAdmins, joinCommunity } = require('../controllers/communityController'); 

module.exports = async function (fastify) {
    fastify.get('/', getCommunities);
    fastify.get('/:id', getCommunity);
    fastify.post('/', createCommunity);
    fastify.patch('/:id', updateCommunity);
    fastify.delete('/:id', deleteCommunity);    
    fastify.get('/:id/members', getCommunityMembers);
    fastify.post('/:id/join', joinCommunity);
    fastify.get('/:id/posts', getCommunityPosts);
    fastify.post('/:id/admins', setCommunityAdmins);
}
    