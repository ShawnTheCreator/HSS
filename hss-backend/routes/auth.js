const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
const CentralAuth = require('../models/CentralAuth');
const staffSchema = require('../models/Staff');
const { getTenantModel } = require('../utils/multiTenantDb');
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

// Map frontend request body to central auth schema fields
const mapRequestToCentralAuthSchema = (body) => ({
  hospitalName: body.hospital_name,
  hospitalDbName:
    body.hospital_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '') + '_hospital',
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

// Middleware to authenticate JWT token and set req.user
const authenticateToken = (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    if (!req.user.hospitalDbName) {
      return res.status(401).json({ error: 'Invalid token: missing hospital context' });
    }
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// ====================
// REGISTRATION ROUTE
// ====================
router.post('/register', async (req, res) => {
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
      recaptcha_token,
      device_fingerprint,
      gps_coordinates,
      location_address,
    } = req.body;

    if (!recaptcha_token) return res.status(400).json({ error: 'Missing reCAPTCHA token' });

    // Verify reCAPTCHA
    const secretKey = process.env.RECAPTCHA_SECRET;
    const { data: recaptchaRes } = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptcha_token}`
    );

    if (!recaptchaRes.success) return res.status(400).json({ error: 'reCAPTCHA verification failed' });

    // Check if hospital already exists by email or emailId
    const existing = await CentralAuth.findOne({
      $or: [{ emailId: email_id }, { email }],
    });

    if (existing) {
      return res.status(400).json({ error: 'Hospital already registered with this Email ID or email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newHospital = new CentralAuth({
      ...mapRequestToCentralAuthSchema(req.body),
      password: hashedPassword,
      isApproved: false,
      createdAt: new Date(),
      device_fingerprint,
      gps_coordinates,
      location_address,
    });

    await newHospital.save();

    // Send registration confirmation email
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirm your registration with HSS',
      html: `
        <div style="font-family:Arial,sans-serif;border:1px solid #ddd;padding:20px;border-radius:10px">
          <h2 style="color:#6A0DAD">Welcome to HSS</h2>
          <p>Hello ${contact_person_name},</p>
          <p>Thank you for registering <strong>${hospital_name}</strong> with our Healthcare Staff Scheduling system.</p>
          <p>Your registration is currently under review. You'll receive a notification email once your account has been approved.</p>
          <p>This process typically takes 1-2 business days.</p>
          <hr style="margin:20px 0">
          <p style="font-size:12px;color:#666">This is an automated message from the HSS System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, message: 'Registration successful. Please wait for admin approval.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

// ====================
// LOGIN ROUTE
// ====================
router.post('/login', async (req, res) => {
  try {
    const { email_id, password } = req.body;

    console.log('Login attempt:', { email_id, password });

    if (!email_id || !password) {
      console.log('Missing email_id or password');
      return res.status(400).json({ error: 'Email ID and password are required' });
    }

    // Use the provided regex to find the user
    const user = await CentralAuth.findOne({ emailId: new RegExp(`^${email_id}$`, 'i') });
    console.log('User  fetched from DB:', user);

    if (!user) {
      console.log('User  not found with emailId:', email_id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Stored hash:', user.password);
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password match:', validPassword);

    if (!validPassword) {
      console.log('Password does not match for emailId:', email_id);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      console.log('User  not approved:', email_id);
      return res.status(403).json({ error: 'Account not approved yet. Please wait for admin approval.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        emailId: user.emailId,
        hospitalDbName: user.hospitalDbName,
        hospitalName: user.hospitalName,
        role: user.role || 'hospital_admin',
        email: user.email,
        contactPersonName: user.contactPersonName,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    console.log('Token generated for:', user.emailId);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
    });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        hospitalName: user.hospitalName,
        contactPersonName: user.contactPersonName,
        email: user.email,
        role: user.role || 'hospital_admin',
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});




// ====================
// LOGOUT ROUTE
// ====================
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ====================
// AUTH CHECK
// ====================
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await CentralAuth.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user._id,
        hospitalName: user.hospitalName,
        hospitalDbName: user.hospitalDbName,
        contactPersonName: user.contactPersonName,
        email: user.email,
        role: user.role || 'hospital_admin',
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// ====================
// REFRESH TOKEN ROUTE
// ====================
router.post('/refresh-token', authenticateToken, async (req, res) => {
  try {
    const user = await CentralAuth.findById(req.user.userId);
    if (!user || !user.isApproved) {
      return res.status(401).json({ error: 'User not found or not approved' });
    }

    const newToken = jwt.sign(
      {
        userId: user._id,
        hospitalDbName: user.hospitalDbName,
        hospitalName: user.hospitalName,
        role: user.role || 'hospital_admin',
        email: user.email,
        contactPersonName: user.contactPersonName,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000,
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined,
    });

    res.json({ success: true, message: 'Token refreshed successfully', token: newToken });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// ====================
// ADMIN USER MANAGEMENT ROUTES
// ====================

// List all registered hospitals (admin only)
router.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    const users = await CentralAuth.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error('Admin users fetch error:', err);
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// Approve hospital registration (admin only)
router.patch('/admin/users/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (!['admin', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }

    const user = await CentralAuth.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isApproved = true;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your HSS account has been approved!',
      html: `
        <div style="font-family:Arial,sans-serif;border:1px solid #ddd;padding:20px;border-radius:10px">
          <h2 style="color:#6A0DAD">Welcome to HSS</h2>
          <p>Hello ${user.contactPersonName},</p>
          <p>Your hospital account for <strong>${user.hospitalName}</strong> has been <strong>approved</strong>.</p>
          <p>You can now log in to your HSS dashboard using your credentials.</p>
          <hr style="margin:20px 0">
          <p style="font-size:12px;color:#666">This is an automated message from the HSS System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Hospital approved and email sent' });
  } catch (err) {
    console.error('Hospital approval error:', err);
    res.status(500).json({ error: 'Approval failed', details: err.message });
  }
});

// ====================
// MULTI-TENANT DASHBOARD ROUTES
// ====================

// Get dashboard stats for tenant hospital
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const Staff = await getTenantModel(req.user.hospitalDbName, 'Staff', staffSchema);

    const totalStaff = await Staff.countDocuments();
    const activeShifts = await Staff.countDocuments({ status: { $in: ['active', 'on-shift'] } });
    const allStaff = await Staff.find({});

    const validCompliance = allStaff.filter((staff) => {
      const certExpiry = staff.certificationExpiry;
      return certExpiry && new Date(certExpiry) > new Date();
    }).length;

    const compliance = {
      valid: validCompliance,
      invalid: totalStaff - validCompliance,
    };

    const pendingApprovals = await Staff.countDocuments({ status: 'pending' });

    res.json({
      totalStaff,
      activeShifts: activeShifts || Math.floor(totalStaff * 0.7),
      compliance,
      pendingApprovals: pendingApprovals || 0,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get dashboard alerts
router.get('/dashboard/alerts', authenticateToken, async (req, res) => {
  try {
    const Staff = await getTenantModel(req.user.hospitalDbName, 'Staff', staffSchema);

    const alerts = [];

    const expiringCerts = await Staff.countDocuments({
      'certifications.expiryDate': {
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    if (expiringCerts > 0) {
      alerts.push({
        id: `cert-${Date.now()}`,
        title: 'Staff Certifications Expiring',
        description: `${expiringCerts} staff member${expiringCerts > 1 ? 's have' : ' has'} certification${expiringCerts > 1 ? 's' : ''} expiring within 30 days`,
        level: 'high',
      });
    }

    const totalStaff = await Staff.countDocuments();
    if (totalStaff < 5) {
      alerts.push({
        id: `staff-${Date.now()}`,
        title: 'Low Staff Count',
        description: 'Consider recruiting additional staff members',
        level: 'critical',
      });
    }

    const pendingStaff = await Staff.countDocuments({ status: 'pending' });
    if (pendingStaff > 0) {
      alerts.push({
        id: `pending-${Date.now()}`,
        title: 'Pending Staff Approvals',
        description: `${pendingStaff} staff member${pendingStaff > 1 ? 's are' : ' is'} awaiting approval`,
        level: 'high',
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: `success-${Date.now()}`,
        title: 'All Systems Normal',
        description: 'No critical issues detected in your hospital operations',
        level: 'info',
      });
    }

    res.json(alerts);
  } catch (err) {
    console.error('Dashboard alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard alerts' });
  }
});

// Get dashboard shifts info
router.get('/dashboard/shifts', authenticateToken, async (req, res) => {
  try {
    const Staff = await getTenantModel(req.user.hospitalDbName, 'Staff', staffSchema);

    const staff = await Staff.find({ status: { $in: ['active', 'on-shift'] } }).limit(10);

    const shifts = staff.map((member, index) => {
      const now = new Date();
      const shiftStart = new Date(now.getTime() + index * 3 * 60 * 60 * 1000);
      const shiftEnd = new Date(shiftStart.getTime() + 8 * 60 * 60 * 1000);

      return {
        id: member._id.toString(),
        name: member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        start: shiftStart.toISOString(),
        end: shiftEnd.toISOString(),
        role: member.role || member.position || 'Staff',
        avatarUrl: member.profileImage || null,
      };
    });

    res.json(shifts);
  } catch (err) {
    console.error('Dashboard shifts error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard shifts' });
  }
});

// ====================
// STAFF MANAGEMENT ROUTES
// ====================

// Get all staff for tenant hospital
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    const Staff = await getTenantModel(req.user.hospitalDbName, 'Staff', staffSchema);
    const staff = await Staff.find({}).lean();
    res.json({ success: true, staff });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Could not fetch staff' });
  }
});

// Add new staff member
router.post('/staff', authenticateToken, async (req, res) => {
  try {
    const Staff = await getTenantModel(req.user.hospitalDbName, 'Staff', staffSchema);

    const existingStaff = await Staff.findOne({
      $or: [{ emailId: req.body.emailId }, { email: req.body.email }, { idNumber: req.body.idNumber }],
    });

    if (existingStaff) {
      return res.status(400).json({ error: 'Staff member already exists with this Email ID, email, or ID number' });
    }

    const newStaff = new Staff(req.body);
    await newStaff.save();

    res.status(201).json({ success: true, message: 'Staff member added', staff: newStaff });
  } catch (err) {
    console.error('Error adding staff:', err);
    res.status(500).json({ error: 'Failed to add staff' });
  }
});

// ====================
// PASSWORD RESET FLOW
// ====================

// Request password reset (generate 2FA code)
router.post('/password-reset/request', async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!emailId) return res.status(400).json({ error: 'Email ID is required' });

    const user = await CentralAuth.findOne({ emailId });
    if (!user) return res.status(404).json({ error: 'No user found with that Email ID' });

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    user.twoFA_code = code;
    user.twoFA_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min expiration
    await user.save();

    // Send reset code email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your password reset code',
      html: `<p>Your password reset code is <b>${code}</b>. It expires in 15 minutes.</p>`,
    });

    res.json({ success: true, message: 'Password reset code sent to your email' });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ error: 'Failed to request password reset' });
  }
});

// Confirm password reset (verify code and update password)
router.post('/password-reset/confirm', async (req, res) => {
  try {
    const { emailId, code, newPassword } = req.body;
    if (!emailId || !code || !newPassword) return res.status(400).json({ error: 'Missing required fields' });

    const user = await CentralAuth.findOne({ emailId });
    if (!user) return res.status(404).json({ error: 'No user found with that Email ID' });

    if (!user.twoFA_code || !user.twoFA_expires || user.twoFA_code !== code) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

    if (new Date() > user.twoFA_expires) {
      return res.status(400).json({ error: 'Code expired' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.twoFA_code = null;
    user.twoFA_expires = null;
    await user.save();

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error('Password reset confirm error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ====================
// UTILITY ROUTES
// ====================

// Example: Geocode address route using external API
router.post('/geocode', authenticateToken, async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Address is required' });

    // Use a geocoding API, e.g. Google Maps Geocode API
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address,
        key: apiKey,
      },
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: 'Failed to geocode address' });
    }

    const location = response.data.results[0].geometry.location;

    res.json({ success: true, location });
  } catch (err) {
    console.error('Geocode error:', err);
    res.status(500).json({ error: 'Failed to geocode address' });
  }
});

module.exports = router;
