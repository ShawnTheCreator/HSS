const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Email transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @route POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({
      full_name,
      email,
      password: hashed,
      isApproved: false,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'verify-secret',
      { expiresIn: '15m' }
    );

    const verificationLink = `https://healthcaresecuresystem.netlify.app/verify?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm your registration with HSS',
      html: `
        <p>Hello ${full_name},</p>
        <p>Thank you for registering on the HSS platform.</p>
        <p>Your account will be reviewed by the HSS admin team. You’ll be notified once your account is approved.</p>
        <p>If this wasn't you, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for admin approval.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isApproved) {
      return res.status(403).json({ error: 'Account not approved by admin yet' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// @route POST /api/auth/send-2fa
router.post('/send-2fa', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.twoFA_code = code;
    user.twoFA_expires = expires;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your HSS 2FA Code',
      html: `
        <p>Hi ${user.full_name},</p>
        <p>Your 2FA verification code is:</p>
        <h2 style="color: #4a6fa5;">${code}</h2>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: '2FA code sent successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send 2FA code', details: err.message });
  }
});

// @route POST /api/auth/verify-2fa
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ error: 'Email and code are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!user.twoFA_code || !user.twoFA_expires)
      return res.status(400).json({ error: 'No 2FA code set. Request a new one.' });

    if (new Date() > user.twoFA_expires)
      return res.status(400).json({ error: '2FA code expired' });

    if (user.twoFA_code !== code)
      return res.status(400).json({ error: 'Invalid 2FA code' });

    user.twoFA_code = undefined;
    user.twoFA_expires = undefined;
    await user.save();

    res.json({ success: true, message: '2FA verified' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

module.exports = router;
