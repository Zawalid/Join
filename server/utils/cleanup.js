// server/utils/cleanup.js
const cron = require('node-cron');
const BlacklistToken = require('../models/blacklistToken');
const RefreshToken = require('../models/refreshToken');

const cleanExpiredTokens = async () => {
  try {
    const blacklistResult = await BlacklistToken.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Cleaned up ${blacklistResult.deletedCount} expired blacklist tokens`);

    const refreshResult = await RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } });
    console.log(`Cleaned up ${refreshResult.deletedCount} expired refresh tokens`);
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
};

// Schedule the cleanup task to run every day at midnight
cron.schedule('0 0 * * *', cleanExpiredTokens);

module.exports = cleanExpiredTokens;
