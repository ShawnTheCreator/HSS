// /services/resendService.js
require('dotenv').config(); // this loads .env variables
const { Resend } = require('resend');

const resend = new Resend(process.env.VITE_RESEND_API_KEY); // or RESEND_API_KEY

const sendVerificationEmail = async (toEmail, token) => {
  const verifyLink = `https://healthcaresecuresystem.netlify.app/verify?token=${token}`;

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev', // You can use your domain if verified
      to: toEmail,
      subject: 'Verify Your HSS Account',
      html: `<p>Click the link to verify your account:</p><a href="${verifyLink}">${verifyLink}</a>`,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

module.exports = sendVerificationEmail;
