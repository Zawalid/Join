const validator = require('validator');
const User = require('../models/user');
const { fastify } = require('../server');

const createSendToken = (user, statusCode, req, reply) => {
  const token = fastify.jwt.sign({ id: user._id }, { expiresIn: fastify.config.JWT_EXPIRES_IN });

  reply.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  reply.status(statusCode).send({
    status: 'success',
    token,
    data: { user },
  });
};

const login = async (req, reply) => {
  // 1. Receive Credentials: Extract email/username and password from the request body.
  const { email, username, password } = req.body;

  // 2. Validate Data: Ensure the provided data meets your validation criteria.
  if (!email && !username) return reply.status(400).send({ message: 'Email or username is required' });
  if (email && !validator.isEmail(email))
    return reply.status(400).send({ message: 'Please provide a valid email address' });
  if (!password) return reply.status(400).send({ message: 'Password is required' });

  // 3. Find User: Look up the user in the database by email/username.
  const user = await User.findOne({ $or: [{ email }, { username }] }).select('+password');
  if (!user) return reply.status(404).send({ message: 'Invalid credentials. Please try again.' });

  // 4. Check Password: Compare the provided password with the hashed password in the database.
  const isMatch = await user.correctPassword(password, user.password);
  if (!isMatch) return reply.status(401).send({ message: 'Invalid credentials. Please try again.' });

  // 6. Generate and send token
  createSendToken(user, 200, req, reply);
};

const register = async (req, reply) => {
  // 1. Receive User Data: Extract username, email, and password from the request body.
  const { firstName, lastName, username, email, password, passwordConfirm, phone, birthDate, gender } = req.body;

  // 3. Check for Existing User: Verify that the email or username is not already in use.
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    return reply.status(400).send({ message: 'Email or username already in use. Please choose a different one.' });
  }

  // 5. Save User: Save the new user to the database.
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

  // 6. Generate and send token
  createSendToken(newUser, 201, req, reply);
};

const logout = async (req, reply) => {
  // 1. Invalidate Token: If using JWT, implement token blacklisting. If using sessions, destroy the session.
  // 2. Send Response: Confirm the user has been logged out.
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

const refreshToken = async (req, reply) => {
  // 1. Receive Refresh Token: Extract the refresh token from the request body.
  // 2. Validate Refresh Token: Check if the refresh token is valid.
  // 3. Generate New Token: Create a new JWT.
  // 4. Send Response: Respond with the new token.
};

const protect = async (req, reply) => {
  // 1. Extract Token: Extract the token from the request headers.
  // 2. Validate Token: Check if the token is valid.
  // 3. Attach User to Request: Attach the user information to the request object.
  // 4. Proceed to Next Middleware: Allow the request to proceed to the next middleware or route handler.
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
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  refreshToken,
  protect,
  restrictTo,
  verify2FA,
  socialLogin,
};
