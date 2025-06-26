const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
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

// @route POST /api/auth/register
// Add this enhanced logging to your auth.js register route
// Replace the existing register route with this version for debugging

router.post('/register', async (req, res) => {
  console.log('=== REGISTRATION REQUEST START ===');
  console.log('Request Body:', JSON.stringify(req.body, null, 2));
  console.log('Headers:', req.headers);
  
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

    console.log('=== FIELD VALIDATION ===');
    console.log('hospital_name:', hospital_name);
    console.log('province:', province);
    console.log('city:', city);
    console.log('contact_person_name:', contact_person_name);
    console.log('email:', email);
    console.log('email_id:', email_id);
    console.log('phone_number:', phone_number);
    console.log('password length:', password?.length);
    console.log('device_fingerprint:', device_fingerprint);
    console.log('gps_coordinates:', gps_coordinates);
    console.log('location_address:', location_address);
    console.log('recaptcha_token present:', !!recaptcha_token);

    // Check required fields
    if (
      !hospital_name || !province || !city || !contact_person_name ||
      !email || !email_id || !phone_number || !password
    ) {
      console.log('=== MISSING REQUIRED FIELDS ===');
      return res.status(400).json({ error: 'Please fill all required fields' });
    }

    // reCAPTCHA validation
    if (!recaptcha_token) {
      console.log('=== MISSING RECAPTCHA TOKEN ===');
      return res.status(400).json({ error: 'Missing reCAPTCHA token' });
    }

    console.log('=== RECAPTCHA VALIDATION START ===');
    const secretKey = process.env.RECAPTCHA_SECRET;
    console.log('reCAPTCHA secret key present:', !!secretKey);
    
    if (!secretKey) {
      console.error('RECAPTCHA_SECRET environment variable not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha_token}`;
    console.log('Verifying reCAPTCHA...');

    const { data: googleVerify } = await axios.post(verifyUrl);
    console.log('reCAPTCHA response:', googleVerify);
    
    if (!googleVerify.success) {
      console.log('=== RECAPTCHA VERIFICATION FAILED ===');
      console.log('reCAPTCHA errors:', googleVerify['error-codes']);
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    console.log('=== DATABASE OPERATIONS START ===');
    console.log('Checking for existing user with email_id:', email_id);

    // Check if user exists
    const existing = await User.findOne({ emailId: email_id });
    console.log('Existing user found:', !!existing);
    
    if (existing) {
      console.log('=== USER ALREADY EXISTS ===');
      return res.status(400).json({ error: 'User already exists with this email ID' });
    }

    console.log('=== PASSWORD HASHING ===');
    // Hash password
    const hashed = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    console.log('=== CREATING NEW USER ===');
    // Create new user
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
      gps_coordinates,
      isApproved: false,
    });

    console.log('User object created, attempting to save...');
    await newUser.save();
    console.log('User saved successfully with ID:', newUser._id);

    console.log('=== JWT TOKEN GENERATION ===');
    // Generate JWT token for verification
    const jwtSecret = process.env.JWT_SECRET || 'verify-secret';
    console.log('JWT secret present:', !!process.env.JWT_SECRET);
    
    const token = jwt.sign(
      { userId: newUser._id },
      jwtSecret,
      { expiresIn: '15m' }
    );
    console.log('JWT token generated');

    console.log('=== EMAIL SENDING ===');
    const verificationLink = `https://healthcaresecuresystem.netlify.app/verify?token=${token}`;
    console.log('Verification link:', verificationLink);
    
    // Check email configuration
    console.log('Email service:', process.env.EMAIL_SERVICE || 'gmail');
    console.log('Email user present:', !!process.env.EMAIL_USER);
    console.log('Email pass present:', !!process.env.EMAIL_PASS);

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

    console.log('Sending email to:', email);
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    console.log('=== REGISTRATION SUCCESS ===');
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please wait for admin approval.',
    });
    
  } catch (err) {
    console.error('=== REGISTRATION ERROR ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Check for specific error types
    if (err.name === 'ValidationError') {
      console.error('Mongoose validation error:', err.errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: Object.keys(err.errors).map(key => ({
          field: key,
          message: err.errors[key].message
        }))
      });
    }
    
    if (err.name === 'MongoError' || err.name === 'MongoServerError') {
      console.error('MongoDB error:', err);
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      console.error('Network/Email error:', err);
      return res.status(500).json({ error: 'Email service error', details: err.message });
    }
    
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// Also add this middleware to log all requests for debugging
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Request headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body keys:', Object.keys(req.body));
  }
  next();
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email_id, password } = req.body;

    if (!email_id || !password) {
      return res.status(400).json({ error: 'Email ID and password are required' });
    }

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
      message: 'Two-factor authentication required. Please verify your 2FA code.',
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
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
    const expires = new Date(Date.now() + 10 * 60 * 1000);

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
    console.error('[SEND 2FA ERROR]', err);
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
    console.error('[VERIFY 2FA ERROR]', err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

module.exports = router;
