const nodemailer = require('nodemailer');
require('dotenv').config();

function send2FAMessage(toEmail, code) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    }
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: toEmail,
    subject: 'Your 2FA Verification Code',
    html: `
      <h2>Your Security Code</h2>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code expires in 15 minutes.</p>
      <p>If you didn't request this, please secure your account.</p>
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { send2FAMessage };