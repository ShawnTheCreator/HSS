const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';

// ... (register and login routes go here — already in your code)

// --- Add 2FA Routes Below ---

// Send 2FA code
router.post('/send-2fa', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const twoFACode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.twoFA_code = twoFACode;
    user.twoFA_expires = expiresAt;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your HSS 2FA Verification Code',
      html: `
        <h2>Two-Factor Authentication</h2>
        <p>Dear ${user.full_name},</p>
        <p>Your 2FA verification code is:</p>
        <div style="font-size: 24px; font-weight: bold; color: #4a6fa5; text-align: center; padding: 20px; background-color: #f5f5f5; border-radius: 5px; margin: 20px 0;">
          ${twoFACode}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,<br>The HSS Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: '2FA code sent successfully',
      data: {
        email: email,
        expires_in: '10 minutes'
      }
    });

  } catch (err) {
    console.error('2FA send error:', err);
    res.status(500).json({ 
      error: 'Server error sending 2FA code',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Verify 2FA code
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 2FA code are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.twoFA_code || !user.twoFA_expires) {
      return res.status(400).json({ error: 'No 2FA code found. Please request a new one.' });
    }

    if (new Date() > user.twoFA_expires) {
      return res.status(400).json({ error: '2FA code has expired. Please request a new one.' });
    }

    if (user.twoFA_code !== code.toString()) {
      return res.status(400).json({ error: 'Invalid 2FA code' });
    }

    user.twoFA_code = undefined;
    user.twoFA_expires = undefined;
    await user.save();

    res.json({
      success: true,
      message: '2FA verification successful',
      data: {
        email: email,
        verified: true
      }
    });

  } catch (err) {
    console.error('2FA verification error:', err);
    res.status(500).json({ 
      error: 'Server error verifying 2FA code',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;
