const validator = require('validator');
const User = require('../models/user');
const BlacklistToken = require('../models/blacklistToken');
const RefreshToken = require('../models/refreshToken');
const ApiError = require('../utils/ApiError');
const { JWT_REFRESH_EXPIRES_IN } = require('../utils/constants');

const setTokenCookie = (req, reply, token, cookieName, env) => {
  const expiresIn = process.env[env];
  const expiresInMs = expiresIn.endsWith('h')
    ? parseInt(expiresIn) * 60 * 60 * 1000
    : parseInt(expiresIn) * 24 * 60 * 60 * 1000;

  reply.cookie(cookieName, token, {
    expires: new Date(Date.now() + expiresInMs),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
};

const createSendToken = async (user, statusCode, req, reply) => {
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

  return reply.status(statusCode).send({
    status: 'success',
    accessToken,
    refreshToken,
    data: { user },
  });
};

const getToken = (req) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.replace('Bearer ', '');
  } else if (req.cookies.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};

const login = async (req, reply) => {
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

const register = async (req, reply) => {
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

const logout = async (req, reply) => {
  const token = getToken(req);
  if (token) {
    const decoded = req.jwt.decode(token);
    const blacklistToken = new BlacklistToken({
      token,
      expiresAt: new Date(decoded.exp * 1000),
    });
    await blacklistToken.save();

    // Clear the accessToken and refreshToken cookies
    reply.cookie('accessToken', '', { expires: new Date(0), httpOnly: true });
    reply.cookie('refreshToken', '', { expires: new Date(0), httpOnly: true });

    return reply.send({ message: 'Logged out successfully' });
  }
  return reply.status(400).send({ message: 'No token provided' });
};

const authenticate = async (req, reply) => {
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

const refreshToken = async (req, reply) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return reply.status(401).send({ message: 'No refresh token provided' });

  const decoded = await req.jwt.verify(refreshToken);
  const existingToken = await RefreshToken.findOne({ token: refreshToken, user: decoded.id });
  if (!existingToken) return reply.status(401).send({ message: 'Invalid refresh token' });

  const newAccessToken = req.jwt.sign({ id: decoded.id }, { expiresIn: '1m' }); // 1 minute for testing
  const newRefreshToken = req.jwt.sign({ id: decoded.id }, { expiresIn: '7d' }); // 7 days

  existingToken.token = newRefreshToken;
  existingToken.expiresAt = JWT_REFRESH_EXPIRES_IN;
  await existingToken.save();

  setTokenCookie(req, reply, newAccessToken, 'accessToken', 'JWT_EXPIRES_IN');
  setTokenCookie(req, reply, newRefreshToken, 'refreshToken', 'JWT_REFRESH_EXPIRES_IN');

  return reply.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
};

const requestPasswordReset = async (req, reply) => {
  // 1. Receive Email: Extract the email from the request body.
  // 2. Find User: Look up the user by email.
  // 3. Generate Reset Token: Create a unique token and set an expiration time.
  // 4. Send Email: Send an email to the user with the reset token.
  // 5. Save Token: Save the token and expiration time to the user's record.
};

const resetPassword = async (req, reply) => {
  // 1. Receive Token and New Password: Extract the token and new password from the request body.
  // 2. Validate Token: Check if the token is valid and not expired.
  // 3. Hash New Password: Use a hashing algorithm to hash the new password.
  // 4. Update Password: Update the user's password in the database.
  // 5. Send Response: Confirm the password has been reset.
};

const verifyEmail = async (req, reply) => {
  // 1. Generate Verification Token: Create a unique token for email verification.
  // 2. Send Email: Send an email to the user with the verification token.
  // 3. Verify Token: When the user clicks the link, validate the token.
  // 4. Activate Account: Mark the user's email as verified in the database.
  // 5. Send Response: Confirm the email has been verified.
};

const restrictTo = (...roles) => {
  return (req, reply, next) => {
    // 1. Define Roles and Permissions: Define what each role can do.
    // 2. Check User Role: Check the user's role from the request object.
    // 3. Authorize Access: Allow or deny access based on the user's role and the required permissions for the route.
    next();
  };
};

const verify2FA = async (req, reply) => {
  // 1. Setup 2FA: Allow users to set up 2FA (e.g., using an app like Google Authenticator).
  // 2. Generate 2FA Code: Generate a 2FA code when the user logs in.
  // 3. Verify 2FA Code: Verify the 2FA code provided by the user.
  // 4. Complete Login: Allow the user to log in if the 2FA code is correct.
};

const socialLogin = async (req, reply) => {
  // 1. Integrate with Social Provider: Use OAuth to integrate with social login providers (e.g., Google, Facebook).
  // 2. Receive Social Token: Extract the token from the social provider.
  // 3. Verify Social Token: Verify the token with the social provider.
  // 4. Find or Create User: Find the user in the database or create a new user.
  // 5. Generate Token: Create a JWT or session token for the user.
  // 6. Send Response: Respond with the user data and token.
};

module.exports = {
  login,
  register,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  refreshToken,
  authenticate,
  restrictTo,
  verify2FA,
  socialLogin,
};
