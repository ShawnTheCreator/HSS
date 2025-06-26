const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
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

// Helper: Map frontend fields to Mongoose schema
const mapRequestToUserSchema = (body) => ({
  hospitalName: body.hospital_name,
  province: body.province,
  city: body.city,
  contactPersonName: body.contact_person_name,
  email: body.email,
  emailId: body.email_id,
  phoneNumber: body.phone_number,
  password: body.password,
  device_fingerprint: body.device_fingerprint,
  gps_coordinates: body.gps_coordinates,
  location_address: body.location_address,
});

// Middleware: Log requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body keys:', Object.keys(req.body));
  }
  next();
});

// ===============================
// POST /api/auth/register
// ===============================
router.post('/register', async (req, res) => {
  try {
    const {
      hospital_name, province, city,
      contact_person_name, email, email_id,
      phone_number, password, recaptcha_token
    } = req.body;

    if (!hospital_name || !province || !city || !contact_person_name || !email || !email_id || !phone_number || !password) {
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    if (!recaptcha_token) return res.status(400).json({ error: 'Missing reCAPTCHA token' });

    const secretKey = process.env.RECAPTCHA_SECRET;
    if (!secretKey) return res.status(500).json({ error: 'Missing reCAPTCHA secret key' });

    const { data: recaptchaRes } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha_token}`
    );
    if (!recaptchaRes.success) {
      return res.status(400).json({ error: 'reCAPTCHA failed', details: recaptchaRes['error-codes'] });
    }

    const existing = await User.findOne({ emailId: email_id });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = mapRequestToUserSchema(req.body);

    const newUser = new User({
      ...userData,
      password: hashedPassword,
      isApproved: false,
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET || 'verify-secret',
      { expiresIn: '15m' }
    );

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm your registration with HSS',
      html: `
        <p>Hello ${contact_person_name},</p>
        <p>Thank you for registering your hospital on the HSS platform.</p>
        <p>Your account will be reviewed by the HSS admin team. You'll be notified once your account is approved.</p>
        <p>If this wasn't you, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Await admin approval.',
    });
  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: Object.keys(err.errors).map(key => ({
          field: key,
          message: err.errors[key].message
        }))
      });
    }
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// ===============================
// POST /api/auth/login
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email_id, password } = req.body;
    if (!email_id || !password) return res.status(400).json({ error: 'Email ID and password are required' });

    const user = await User.findOne({ emailId: email_id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isApproved) {
      return res.status(403).json({ error: 'Account not approved by admin yet' });
    }

    user.twoFA_code = undefined;
    user.twoFA_expires = undefined;
    await user.save();

    const tempToken = jwt.sign(
      { userId: user._id, twoFAPending: true },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '10m' }
    );

    res.json({
      success: true,
      twoFARequired: true,
      tempToken,
      message: '2FA code sent. Verify your identity.',
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// ===============================
// POST /api/auth/send-2fa
// ===============================
router.post('/send-2fa', async (req, res) => {
  try {
    const { email_id } = req.body;
    if (!email_id) return res.status(400).json({ error: 'Email ID is required' });

    const user = await User.findOne({ emailId: email_id });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.twoFA_code = code;
    user.twoFA_expires = expires;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your HSS 2FA Code',
      html: `
        <p>Hi ${user.contactPersonName || 'User'},</p>
        <p>Your 2FA verification code is:</p>
        <h2>${code}</h2>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: '2FA code sent successfully' });
  } catch (err) {
    console.error('[SEND 2FA ERROR]', err);
    res.status(500).json({ error: 'Failed to send 2FA code', details: err.message });
  }
});

// ===============================
// POST /api/auth/verify-2fa
// ===============================
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email_id, code, tempToken } = req.body;
    if (!email_id || !code || !tempToken) {
      return res.status(400).json({ error: 'Email ID, code, and token are required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret');
      if (!decoded.twoFAPending) {
        return res.status(401).json({ error: 'Invalid 2FA token' });
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
    console.error('[VERIFY 2FA ERROR]', err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

module.exports = router;
