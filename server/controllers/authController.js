const validator = require('validator');
const crypto = require('crypto');
const User = require('../models/user');
const BlacklistToken = require('../models/blacklistToken');
const RefreshToken = require('../models/refreshToken');
const ApiError = require('../utils/ApiError');
const { sendEmail, checkRateLimit } = require('../utils/email');
const { JWT_REFRESH_EXPIRES_IN } = require('../utils/constants');

// TODO : Remove comments from the sendEmail functions (disabled to avoid exceeding the limit)

//* Token handlers
// Set token in cookies
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
// Generate access token and refresh token and send em
const createSendToken = async (user, statusCode, req, reply, message) => {
  const accessToken = req.jwt.sign({ id: user._id }, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = req.jwt.sign({ id: user._id }, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });

  // Store refresh token in the database
  await RefreshToken.create({
    token: refreshToken,
    user: user._id,
    expiresAt: JWT_REFRESH_EXPIRES_IN,
  });

  // Hide sensitive fields
  user.password = undefined;
  user.emailVerification = undefined;
  user.passwordReset = undefined;

  setTokenCookie(req, reply, accessToken, 'accessToken', 'JWT_EXPIRES_IN');
  setTokenCookie(req, reply, refreshToken, 'refreshToken', 'JWT_REFRESH_EXPIRES_IN');

  return reply.status(statusCode).send(message || { status: 'success', accessToken, refreshToken, data: { user } });
};
// Retrieve access token
const getToken = (req) => {
  if (req.cookies.accessToken) {
    return req.cookies.accessToken;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    return req.headers.authorization.replace('Bearer ', '');
  }
  return null;
};
// Generate and send the verification email
const sendVerificationToken = async (user, req, reply) => {
  try {
    // Generate email verification token
    let verificationToken;
    if (!user.emailVerification.expiresAt || user.emailVerification.expiresAt < Date.now()) {
      verificationToken = user.createEmailVerificationToken();
      await user.save({ validateBeforeSave: false });
    } else {
      verificationToken = user.emailVerification.token;
    }

    // Create the verification URL
    const verificationUrl = `${req.protocol}://${req.hostname}/api/v1/users/verify-email/${verificationToken}`;

    // Email content
    const message = `
  Hi ${user.firstName} ${user.lastName},

  Welcome to Join! To complete your registration, please verify your email address by clicking the link below:

  ${verificationUrl}
   
  This link is valid for 24 hours.

  If you did not create an account with Join, please ignore this email.

  Thank you,
  The Join Team
`;

    console.log({ email: user.email, subject: 'Verify Your Email Address for Join', message });
    // await sendEmail({ email: user.email, subject: 'Verify Your Email Address for Join', message });

    reply.status(200).send({
      status: 'success',
      message:
        'A verification email has been sent to your email address. Please check your inbox and follow the instructions to verify your email. If you do not receive the email within a few minutes, please check your spam folder.',
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      'Failed to send the verification email. Please try again later or contact support if the issue persists.'
    );
  }
};

//* Authentication handlers
exports.login = async (req, reply) => {
  // Verify if the user is already logged in
  const token = getToken(req);
  if (token) {
    const decoded = await req.jwt.verify(token);
    const user = await User.findById(decoded.id);
    if (user) return reply.status(200).send({ status: 'success', message: 'You are already logged in' });
  }

  const { email, username, password } = req.body;
  if (!email && !username) throw new ApiError('Email or username is required', 400);

  if (email && !validator.isEmail(email)) throw new ApiError('Please provide a valid email address', 400);

  if (!password) throw new ApiError('Password is required', 400);

  const user = await User.findOne({ $or: [{ email }, { username }] }).select('+password');
  if (!user) throw new ApiError('Invalid credentials. Please try again.', 404);

  if (!user.password && user.googleId) {
    throw new ApiError('This account does not have a password set. Please use Google login.', 400);
  }

  const isMatch = await user.correctPassword(password, user.password);
  if (!isMatch) throw new ApiError('Invalid credentials. Please try again.', 401);

  if (!user.isEmailVerified) {
    throw new ApiError(
      'Your email is not verified. Please check your inbox and follow the instructions to verify your email. If you did not receive the email, please check your spam folder or request a new verification email.',
      403
    );
  }

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

  // Send the email
  await sendVerificationToken(newUser, req, reply);
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
  if (user.password && !user.googleId) {
    if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
      throw new ApiError('Your current password is wrong.', 401);
    }
  }

  // 3. If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateModifiedOnly: true });

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

  // 3. Generate Reset Token
  const resetToken =
    !user.passwordReset.expiresAt || user.passwordReset.expiresAt < Date.now()
      ? user.createPasswordResetToken()
      : user.passwordReset.token;

  // Rate limiting: Check the last password reset email request timestamp
  user.passwordReset.lastSentAt = checkRateLimit(
    user.passwordReset.lastSentAt || 0,
    process.env.RESET_EMAIL_COOL_DOWN_PERIOD * 60 * 1000
  );
  await user.save({ validateBeforeSave: false });

  // 4. Send Email: Send an email to the user with the reset token.
  const resetUrl = `${req.protocol}://${req.hostname}/api/v1/users/reset-password/${resetToken}`;
  const message = `
  Hi ${user.name},

  We received a request to reset your password for your Join account. You can reset your password by clicking the link below:

  ${resetUrl}

  This link is valid for 15 minutes.

  If you did not request a password reset, please ignore this email or contact our support team if you have any questions.

  Thank you,
  The Join Team
`;

  try {
    // await sendEmail({ email, subject: 'Reset Your Password for Join', message });
    console.log({ email, subject: 'Reset Your Password for Join', message });
    reply.status(200).send({ status: 'success', message: 'Email sent successfully' });
  } catch (error) {
    user.passwordReset.token = undefined;
    user.passwordReset.expiresAt = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(
      'Failed to send the reset email. Please try again later or contact support if the issue persists.'
    );
  }
};

exports.resetPassword = async (req, reply) => {
  // 1. Get user based on the token
  const encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    'passwordReset.token': encryptedToken,
    'passwordReset.expiresAt': { $gt: Date.now() },
  });

  // 2. Check if the token is valid
  if (!user) throw new ApiError('Token is invalid or expired. Please request another one.', 400);

  // 3. Update the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordReset.token = undefined;
  user.passwordReset.expiresAt = undefined;
  await user.save({ validateModifiedOnly: true });

  reply.status(200).send({
    status: 'success',
    message: 'Password has been reset successfully. You can now log in with your new password.',
  });
};

//* Authorization handlers
exports.verifyEmail = async (req, reply) => {
  // 1. Get user based on the token
  const encryptedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    'emailVerification.token': encryptedToken,
    'emailVerification.expiresAt': { $gt: Date.now() },
  });

  if (!user) throw new ApiError('Token is invalid or expired. Please request another one.', 400);

  if (user.isEmailVerified) {
    return reply.status(200).send({
      status: 'success',
      message: 'Your email is already verified. You can log in to your account.',
    });
  }
  // 3. Activate the account
  user.isEmailVerified = true;
  user.emailVerification.verifiedAt = Date.now();
  await user.save({ validateBeforeSave: false });

  // Send a success email
  const message = `
  Hi ${user.firstName} ${user.lastName},

  Congratulations! Your email address has been successfully verified.

  You can now log in to your account and start using our services.

  For added security, we recommend enabling two-factor authentication (2FA) on your account. This provides an extra layer of protection for your personal information.

  If you have any questions or need assistance, please don't hesitate to contact our support team.

  Thank you for joining us!

  Best regards,
  The Join Team`;

  console.log({ email: user.email, subject: 'Your Email Has Been Verified', message });
  // await sendEmail({ email: user.email, subject: 'Your Email Has Been Verified', message });

  // Log user in
  return createSendToken(user, 200, req, reply);
};

exports.resendVerificationEmail = async (req, reply) => {
  const { email } = req.body;
  if (email && !validator.isEmail(email)) throw new ApiError('Please provide a valid email address', 400);

  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new ApiError('There is no user with that email address.', 404);

  if (user.isEmailVerified) {
    return reply.status(200).send({
      status: 'success',
      message: 'Your email is already verified. You can log in to your account.',
    });
  }

  // Rate limiting: Check the last verification email request timestamp
  user.lastVerificationEmailSentAt = checkRateLimit(
    user.lastVerificationEmailSentAt || 0,
    process.env.VERIFICATION_EMAIL_COOL_DOWN_PERIOD * 60 * 1000
  );
  await user.save({ validateBeforeSave: false });

  // Send the email
  await sendVerificationToken(user, req, reply);
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

//* Google Authentication
exports.initiateGoogleAuth = (req, reply) => {
  const url = req.server.googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/user.birthday.read',
      'https://www.googleapis.com/auth/user.phonenumbers.read',
      'https://www.googleapis.com/auth/user.gender.read',
    ],
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });
  reply.redirect(url);
};

exports.googleAuth = async (req, reply) => {
  const { code } = req.query;

  // Retrieve tokens
  const { tokens } = await req.server.googleOAuth2Client.getToken({
    code,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });

  // Verify ID token
  const ticket = await req.server.googleOAuth2Client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  const { sub, at_hash, email, given_name, family_name, picture, email_verified } = payload;
  const username = `${given_name.replace(/[^a-zA-Z0-9]/g, '')}_${at_hash.slice(0, 6)}`;

  // Check if the email is already used and if so link the account to Google
  let user = await User.findOne({ email });
  if (user && !user.googleId) {
    user.googleId = sub;
    await user.save({ validateBeforeSave: false });
  } else {
    // Find or create user in your database
    user = await User.findOne({ googleId: sub });
    if (!user) {
      user = new User({
        googleId: sub,
        email,
        username,
        firstName: given_name,
        lastName: family_name,
        profilePicture: picture,
        isEmailVerified: email_verified,
      });
      await user.save({ validateBeforeSave: false });
    }
  }

  return createSendToken(user, 200, req, reply);
};
