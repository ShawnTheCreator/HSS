const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
const User = require('../models/User');
const Staff = require('../models/Staff');
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

// Helper: map frontend fields
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

// ===============================
// ADMIN ROUTES
// ===============================

// Get all users
router.get('/admin/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// Approve user
router.patch('/admin/users/:id/approve', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isApproved = true;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your HSS account has been approved!',
      html: `
        <div style="font-family:Arial,sans-serif;border:1px solid #ddd;padding:20px;border-radius:10px">
          <h2>Welcome to HSS</h2>
          <p>Hello ${user.contactPersonName},</p>
          <p>Your hospital account has been <strong>approved</strong>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'User approved and email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Approval failed', details: err.message });
  }
});

// Reject user (delete)
router.patch('/admin/users/:id/reject', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await User.findByIdAndDelete(req.params.id);

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'HSS account not approved',
      html: `
        <div style="font-family:Arial,sans-serif;border:1px solid #f5c6cb;padding:20px;background:#f8d7da">
          <h2>HSS Registration Rejected</h2>
          <p>Hello ${user.contactPersonName},</p>
          <p>Unfortunately, your registration was <strong>not approved</strong>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'User rejected and deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed', details: err.message });
  }
});

// Unapprove user (reverse approval)
router.patch('/admin/users/:id/unapprove', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isApproved = false;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'HSS account status changed',
      html: `
        <div style="font-family:Arial,sans-serif;border:1px solid #ffeeba;padding:20px;background:#fff3cd">
          <h2>Account Unapproved</h2>
          <p>Hello ${user.contactPersonName},</p>
          <p>Your HSS account approval has been <strong>revoked</strong>.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'User unapproved and email sent' });
  } catch (err) {
    res.status(500).json({ error: 'Unapproval failed', details: err.message });
  }
});

// ===============================
// STAFF ROUTE
// ===============================

// Get staff members by hospitalId
router.get('/staff', async (req, res) => {
  try {
    const { hospitalId } = req.query;
    if (!hospitalId) {
      return res.status(400).json({ error: 'hospitalId query parameter is required' });
    }

    const staff = await Staff.find({ hospitalId }).lean();

    res.json({ success: true, staff });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Could not fetch staff' });
  }
});

// ===============================
// REGISTER
// ===============================
router.post('/register', async (req, res) => {
  try {
    const {
      hospital_name, province, city,
      contact_person_name, email, email_id,
      phone_number, password, recaptcha_token
    } = req.body;

    if (!recaptcha_token) return res.status(400).json({ error: 'Missing reCAPTCHA token' });

    const secretKey = process.env.RECAPTCHA_SECRET;
    const { data: recaptchaRes } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha_token}`
    );
    if (!recaptchaRes.success) return res.status(400).json({ error: 'reCAPTCHA failed' });

    const existing = await User.findOne({ emailId: email_id });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      ...mapRequestToUserSchema(req.body),
      password: hashedPassword,
      isApproved: false,
    });

    await newUser.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm your registration with HSS',
      html: `
        <div style="font-family:Arial,sans-serif;border:1px solid #ddd;padding:20px;border-radius:10px">
          <p>Hello ${contact_person_name},</p>
          <p>Thank you for registering. You'll be notified once approved.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(201).json({ success: true, message: 'Registered. Await approval.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// ===============================
// LOGIN
// ===============================
router.post('/login', async (req, res) => {
  try {
    const { email_id, password } = req.body;
    const user = await User.findOne({ emailId: email_id });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.isApproved)
      return res.status(403).json({ error: 'Account not approved yet' });

    const tempToken = jwt.sign(
      {
        userId: user._id,
        hospitalId: user.hospitalId,
        role: user.role,
        twoFAPending: true,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '10m' }
    );

    res.json({ success: true, twoFARequired: true, tempToken });
  } catch (err) {
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// ===============================
// SEND 2FA
// ===============================
router.post('/send-2fa', async (req, res) => {
  try {
    const { email_id } = req.body;
    const user = await User.findOne({ emailId: email_id });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.twoFA_code = code;
    user.twoFA_expires = expires;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your HSS 2FA Code',
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    });

    res.json({ success: true, message: '2FA code sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send 2FA code', details: err.message });
  }
});

// ===============================
// VERIFY 2FA
// ===============================
router.post('/verify-2fa', async (req, res) => {
  try {
    const { email_id, code, tempToken } = req.body;
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret');

    const user = await User.findOne({ emailId: email_id });
    if (!user || user.twoFA_code !== code || new Date() > user.twoFA_expires)
      return res.status(400).json({ error: 'Invalid or expired code' });

    user.twoFA_code = undefined;
    user.twoFA_expires = undefined;
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        hospitalId: user.hospitalId,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    res
      .cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
        maxAge: 60 * 60 * 1000,
      })
      .json({ success: true, message: '2FA verified successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});

// ===============================
// GEOCODE
// ===============================
router.post('/geocode', async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing coordinates' });

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { format: 'json', lat, lon },
      headers: { 'User-Agent': 'HSS-Geocoder/1.0 (support@yourdomain.com)' },
    });

    res.json({ address: response.data.address });
  } catch (err) {
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    sameSite: 'Strict',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
