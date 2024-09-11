const nodemailer = require('nodemailer');
const ApiError = require('./ApiError');

exports.sendEmail = async ({ email, subject, message }) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const options = {
    from: 'JOIN <join@info.com>',
    to: email,
    subject: subject,
    text: message,
    // html :
  };
  await transport.sendMail(options);
};

exports.checkRateLimit = (lastEmailSentAt, coolDownPeriod) => {
  const now = Date.now();
  if (now - lastEmailSentAt < coolDownPeriod) {
    const waitTime = Math.ceil((coolDownPeriod - (now - lastEmailSentAt)) / 1000 / 60);
    throw new ApiError(`Please wait ${waitTime} minutes before requesting another email.`, 429);
  }
  return now;
};
