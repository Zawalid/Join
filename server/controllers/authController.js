const validator = require('validator');
const crypto = require('crypto');
const User = require('../models/user');
const BlacklistToken = require('../models/blacklistToken');
const RefreshToken = require('../models/refreshToken');
const ApiError = require('../utils/ApiError');
const sendEmail = require('../utils/email');
const { JWT_REFRESH_EXPIRES_IN } = require('../utils/constants');

//* Token handlers
const setTokenCookie = (req, reply, token, cookieName, env) => {
  const expiresIn = process.env[env];
  const expiresInMs = expiresIn.endsWith('h')
    ? parseInt(expiresIn) * 60 * 60 * 1000
    : parseInt(expiresIn) * 24 * 60 * 60 * 1000;

  reply.cookie(cookieName, token, {
    expires: new Date(Date.now() + expiresInMs),
    path: '/',
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
};

const createSendToken = async (user, statusCode, req, reply, message) => {
  const accessToken = req.jwt.sign({ id: user._id }, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = req.jwt.sign({ id: user._id }, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

  // Store refresh token in the database
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: JWT_REFRESH_EXPIRES_IN,
  });

  setTokenCookie(req, reply, accessToken, 'accessToken', 'JWT_EXPIRES_IN');
  setTokenCookie(req, reply, refreshToken, 'refreshToken', 'JWT_REFRESH_EXPIRES_IN');

  return reply.status(statusCode).send(
    message || {
      status: 'success',
      accessToken,
      refreshToken,
      data: { user },
    }
  );
};

const getToken = (req) => {
  if (req.cookies.accessToken) {
    return req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.replace('Bearer ', '');
  }
  return null;
};

//* Authentication handlers
exports.login = async (req, reply) => {
  const { email, username, password } = req.body;

  if (!email && !username) return reply.status(400).send({ message: 'Email or username is required' });
  if (email && !validator.isEmail(email))
    return reply.status(400).send({ message: 'Please provide a valid email address' });
  if (!password) return reply.status(400).send({ message: 'Password is required' });

  const user = await User.findOne({ $or: [{ email }, { username }] }).select('+password');
  if (!user) return reply.status(404).send({ message: 'Invalid credentials. Please try again.' });

  const isMatch = await user.correctPassword(password, user.password);
  if (!isMatch) return reply.status(401).send({ message: 'Invalid credentials. Please try again.' });

  user.password = undefined;

  return createSendToken(user, 200, req, reply);
};

exports.register = async (req, reply) => {
  const { firstName, lastName, username, email, password, passwordConfirm, phone, birthDate, gender } = req.body;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return reply.status(400).send({ message: 'Email or username already in use. Please choose a different one.' });
  }

  const newUser = await User.create({
    firstName,
    lastName,
    username,
    email,
    password,
    passwordConfirm,
    phone,
    birthDate,
    gender,
  });

  return createSendToken(newUser, 201, req, reply);
};

exports.logout = async (req, reply, message) => {
  const token = getToken(req);
  const decoded = req.jwt.decode(token);
  const blacklistToken = new BlacklistToken({
    token,
    expiresAt: new Date(decoded.exp * 1000),
  });
  await blacklistToken.save();

  // Clear the accessToken and refreshToken cookies
  reply.cookie('accessToken', '', { path: '/', expires: new Date(0), httpOnly: true });
  reply.cookie('refreshToken', '', { path: '/', expires: new Date(0), httpOnly: true });

  return reply.send({ status: 'success', message: message || 'Logged out successfully' });
};

exports.authenticate = async (req, reply) => {
  const token = getToken(req);
  if (!token) throw new ApiError('Access denied. You are not logged in.', 401);

  const blacklistedToken = await BlacklistToken.findOne({ token });
  if (blacklistedToken) {
    throw new ApiError('Access denied. Token is invalidated.', 401);
  }

  const decoded = await req.jwt.verify(token);
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError('Access denied. User not found.', 401);

  if (user.changedPasswordAfter(decoded.iat)) {
    throw new ApiError('Access denied. Password has been changed recently. Please log in again.', 401);
  }

  req.user = user;
};

exports.refreshToken = async (req, reply) => {
  // 1. Extract the refresh token from cookies
  const { refreshToken } = req.cookies;
  if (!refreshToken) return reply.status(401).send({ message: 'No refresh token provided' });

  // 2. Verify the refresh token
  const decoded = await req.jwt.verify(refreshToken);

  // 3. Check if the refresh token exists in the database
  const existingToken = await RefreshToken.findOne({ token: refreshToken, user: decoded.id });
  if (!existingToken) return reply.status(401).send({ message: 'Invalid refresh token' });

  // 4. Generate new access and refresh tokens
  const newAccessToken = req.jwt.sign({ id: decoded.id }, { expiresIn: process.env.JWT_EXPIRES_IN });
  const newRefreshToken = req.jwt.sign({ id: decoded.id }, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

  // 5. Update the existing refresh token in the database
  existingToken.token = newRefreshToken;
  existingToken.expiresAt = JWT_REFRESH_EXPIRES_IN;
  await existingToken.save();

  // 6. Set the new tokens as cookies
  setTokenCookie(req, reply, newAccessToken, 'accessToken', 'JWT_EXPIRES_IN');
  setTokenCookie(req, reply, newRefreshToken, 'refreshToken', 'JWT_REFRESH_EXPIRES_IN');

  // 7. Send the new tokens in the response
  return reply.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};

//* Password handlers
exports.updatePassword = async (req, reply) => {
  // 1. Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2. Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    throw new ApiError('Your current password is wrong.', 401);
  }

  // 3. If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4, Regenerate tokens
  return createSendToken(user, 200, req, reply, {
    status: 'success',
    message: 'Your password was updated successfully',
  });
};

exports.requestPasswordReset = async (req, reply) => {
  // 1. Receive Email: Extract the email from the request body.
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) throw new ApiError('Please provide a valid email address', 400);

  // 2. Find User: Look up the user by email.
  const user = await User.findOne({ email });
  if (!user) throw new ApiError('There is no user with this email address', 404);

  // 3. Generate Reset Token: Create a unique token and set an expiration time.
  const resetToken = user.createPasswordResetToken();
  // 4. Save Token: Save the token and expiration time to the user's record.
  await user.save({ validateBeforeSave: false });

  // 4. Send Email: Send an email to the user with the reset token.
  const resetUrl = `${req.protocol}://${req.hostname}/api/v1/users/reset-password/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with you new password and confirm password to : ${resetUrl}.\n If you didn't forget you password, please ignore this email`;
  reply.status(200).send({ status: 'success', message: 'Email sent successfully' });

  try {
    await sendEmail({ email, subject: 'Your password reset url (valid for 10 min)', message });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError('Failed to send the email please try again later');
  }
};

exports.resetPassword = async (req, reply) => {
  // 1. Get user based on the token
  const encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: encryptedToken, passwordResetExpiresAt: { $gt: Date.now() } });

  // 2. Check if the token is valid
  if (!user) throw new ApiError('Token is invalid or expired. Please request another one.', 400);

  // 3. Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
};

//* Authorization handlers
exports.verifyEmail = async (req, reply) => {
  // 1. Generate Verification Token: Create a unique token for email verification.
  // 2. Send Email: Send an email to the user with the verification token.
  // 3. Verify Token: When the user clicks the link, validate the token.
  // 4. Activate Account: Mark the user's email as verified in the database.
  // 5. Send Response: Confirm the email has been verified.
};

exports.restrictTo = (...roles) => {
  return (req, reply, done) => {
    // roles ['admin', 'user']
    if (!roles.includes(req.user.role)) {
      return done(new ApiError('You do not have permission to perform this action', 403));
    }

    done();
  };
};

exports.verify2FA = async (req, reply) => {
  // 1. Setup 2FA: Allow users to set up 2FA (e.g., using an app like Google Authenticator).
  // 2. Generate 2FA Code: Generate a 2FA code when the user logs in.
  // 3. Verify 2FA Code: Verify the 2FA code provided by the user.
  // 4. Complete Login: Allow the user to log in if the 2FA code is correct.
};

exports.socialLogin = async (req, reply) => {
  // 1. Integrate with Social Provider: Use OAuth to integrate with social login providers (e.g., Google, Facebook).
  // 2. Receive Social Token: Extract the token from the social provider.
  // 3. Verify Social Token: Verify the token with the social provider.
  // 4. Find or Create User: Find the user in the database or create a new user.
  // 5. Generate Token: Create a JWT or session token for the user.
  // 6. Send Response: Respond with the user data and token.
};
