require('dotenv').config();

exports.select = {
  user: 'firstName lastName profilePicture',
};

exports.JWT_REFRESH_EXPIRES_IN = new Date(
  Date.now() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN) * 24 * 60 * 60 * 1000
);
