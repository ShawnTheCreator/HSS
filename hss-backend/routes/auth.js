const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// @route POST 
router.post('/api/auth/register', async (req, res) => {
  try {
    const {
      hospital_name,
      province,
      city,
      contact_person_name,
      email,
      email_id,
      phone_number,
      password,
      device_fingerprint,
      gps_coordinates,
      location_address,
      recaptcha_token,
    } = req.body;

    if (
      !hospital_name ||
      !province ||
      !city ||
      !contact_person_name ||
      !email ||
      !email_id ||
      !phone_number ||
      !password
    ) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // Check for existing user by email_id (unique login)
    const existing = await User.findOne({ emailId: email_id });
    if (existing)
      return res.status(400).json({ error: 'User already exists with this email ID' });

    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      hospital_name,
      province,
      city,
      contact_person_name,
      email,
      emailId: email_id,
      phone_number,
      password: hashed,
      device_fingerprint,
      location_zone: location_address,
      isApproved: false,
      // biometric_hash can be added if collected
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
        <p>Hello ${contact_person_name},</p>
        <p>Thank you for registering your hospital on the HSS platform.</p>
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

// @route POST 
router.post('/api/auth/login', async (req, res) => {
  try {
    const { email_id, password } = req.body;

    if (!email_id || !password)
      return res.status(400).json({ error: 'Email ID and password are required' });

    const user = await User.findOne({ emailId: email_id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isApproved) {
      return res.status(403).json({ error: 'Account not approved by admin yet' });
    }

    // Clear any previous 2FA codes
    if (user.twoFA_code) {
      user.twoFA_code = undefined;
      user.twoFA_expires = undefined;
      await user.save();
    }

    // Issue temporary token for 2FA verification
    const tempToken = jwt.sign(
      { userId: user._id, twoFAPending: true },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '10m' }
    );

    res.json({
      success: true,
      twoFARequired: true,
      tempToken,
      message: 'Two-factor authentication required. Please verify your 2FA code.',
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// @route POST /api/auth/send-2fa
router.post('/send-2fa', async (req, res) => {
  try {
    const { email_id } = req.body;
    if (!email_id) return res.status(400).json({ error: 'Email ID is required' });

    const user = await User.findOne({ emailId: email_id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.twoFA_code = code;
    user.twoFA_expires = expires;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your HSS 2FA Code',
      html: `
        <p>Hi ${user.contact_person_name || 'User'},</p>
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
    const { email_id, code, tempToken } = req.body;
    if (!email_id || !code || !tempToken)
      return res.status(400).json({ error: 'Email ID, code, and token are required' });

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret');
      if (!decoded.twoFAPending) {
        return res.status(401).json({ error: 'Invalid token for 2FA verification' });
      }
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = await User.findOne({ emailId: email_id });
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

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res.json({ success: true, token, message: '2FA verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

module.exports = router;
