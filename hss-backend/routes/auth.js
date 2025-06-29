const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const axios = require('axios');
const User = require('../models/User');
const Staff = require('../models/Staff');
require('dotenv').config();

const router = express.Router();

// Email transporter - FIXED: Changed createTransporter to createTransport
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
// AUTHENTICATION MIDDLEWARE
// ===============================
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification error:', err);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ===============================
// DASHBOARD ROUTES
// ===============================

// Dashboard stats
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const { hospitalId } = req.user;
    
    // Get total staff count
    const totalStaff = await Staff.countDocuments({ hospitalId });
    
    // Get active shifts (assuming all staff with active status)
    const activeShifts = await Staff.countDocuments({ 
      hospitalId,
      status: { $in: ['active', 'on-shift'] } // Adjust based on your Staff schema
    });
    
    // Get compliance data (you can customize this logic)
    const allStaff = await Staff.find({ hospitalId });
    const validCompliance = allStaff.filter(staff => {
      // Add your compliance logic here, e.g., valid certifications
      return staff.certificationExpiry && new Date(staff.certificationExpiry) > new Date();
    }).length;
    
    const compliance = {
      valid: validCompliance,
      invalid: totalStaff - validCompliance
    };
    
    // Get pending approvals (staff awaiting approval)
    const pendingApprovals = await Staff.countDocuments({ 
      hospitalId,
      status: 'pending' 
    });
    
    res.json({
      totalStaff,
      activeShifts: activeShifts || Math.floor(totalStaff * 0.7), // Fallback calculation
      compliance,
      pendingApprovals: pendingApprovals || Math.floor(Math.random() * 5)
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Dashboard alerts
router.get('/dashboard/alerts', authenticateToken, async (req, res) => {
  try {
    const { hospitalId } = req.user;
    
    const alerts = [];
    
    // Check for expiring certifications
    const expiringCerts = await Staff.countDocuments({
      hospitalId,
      certificationExpiry: {
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    
    if (expiringCerts > 0) {
      alerts.push({
        id: `cert-${Date.now()}`,
        title: 'Staff Certifications Expiring',
        description: `${expiringCerts} staff member${expiringCerts > 1 ? 's have' : ' has'} certification${expiringCerts > 1 ? 's' : ''} expiring within 30 days`,
        level: 'high'
      });
    }
    
    // Check for understaffed shifts (mock logic)
    const totalStaff = await Staff.countDocuments({ hospitalId });
    if (totalStaff < 5) {
      alerts.push({
        id: `staff-${Date.now()}`,
        title: 'Low Staff Count',
        description: 'Consider recruiting additional staff members',
        level: 'critical'
      });
    }
    
    // Add a success message if no critical issues
    if (alerts.length === 0) {
      alerts.push({
        id: `success-${Date.now()}`,
        title: 'All Systems Normal',
        description: 'No critical issues detected in your hospital operations',
        level: 'info'
      });
    }
    
    res.json(alerts);
  } catch (err) {
    console.error('Dashboard alerts error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard alerts' });
  }
});

// Dashboard shifts
router.get('/dashboard/shifts', authenticateToken, async (req, res) => {
  try {
    const { hospitalId } = req.user;
    
    // Get staff for upcoming shifts (next 24 hours)
    const staff = await Staff.find({ 
      hospitalId,
      status: { $in: ['active', 'on-shift', 'scheduled'] }
    }).limit(10);
    
    const shifts = staff.map((member, index) => {
      // Generate realistic shift times (you can replace this with actual shift data)
      const now = new Date();
      const shiftStart = new Date(now.getTime() + (index * 3 * 60 * 60 * 1000)); // Staggered by 3 hours
      const shiftEnd = new Date(shiftStart.getTime() + 8 * 60 * 60 * 1000); // 8-hour shifts
      
      return {
        id: member._id.toString(),
        name: member.name || `${member.firstName || 'Staff'} ${member.lastName || ''}`.trim(),
        start: shiftStart.toISOString(),
        end: shiftEnd.toISOString(),
        role: member.role || member.position || member.department || 'Staff',
        avatarUrl: member.avatarUrl || member.profileImage || null
      };
    });
    
    res.json(shifts);
  } catch (err) {
    console.error('Dashboard shifts error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard shifts' });
  }
});

// ===============================
// ADMIN ROUTES
// ===============================

// Get all users
router.get('/admin/users', authenticateToken, async (req, res) => {
  try {
    // Optional: Add role-based access control
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    const users = await User.find().select('-password'); // Exclude passwords
    res.json(users);
  } catch (err) {
    console.error('Admin users fetch error:', err);
    res.status(500).json({ error: 'Could not fetch users' });
  }
});

// Approve user
router.patch('/admin/users/:id/approve', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
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
    res.json({ success: true, message: 'User approved and email sent' });
  } catch (err) {
    console.error('User approval error:', err);
    res.status(500).json({ error: 'Approval failed', details: err.message });
  }
});

// Reject user (delete)
router.patch('/admin/users/:id/reject', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    await User.findByIdAndDelete(req.params.id);

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'HSS account registration status',
      html: `
        <div style="font-family:Arial,sans-serif;border:1px solid #f5c6cb;padding:20px;background:#f8d7da;border-radius:10px">
          <h2 style="color:#721c24">HSS Registration Update</h2>
          <p>Hello ${user.contactPersonName},</p>
          <p>Unfortunately, your registration for <strong>${user.hospitalName}</strong> was <strong>not approved</strong> at this time.</p>
          <p>If you believe this is an error, please contact our support team.</p>
          <hr style="margin:20px 0">
          <p style="font-size:12px;color:#666">This is an automated message from the HSS System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'User rejected and deleted' });
  } catch (err) {
    console.error('User rejection error:', err);
    res.status(500).json({ error: 'Rejection failed', details: err.message });
  }
});

// Unapprove user (reverse approval)
router.patch('/admin/users/:id/unapprove', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.isApproved = false;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'HSS account status changed',
      html: `
        <div style="font-family:Arial,sans-serif;border:1px solid #ffeeba;padding:20px;background:#fff3cd;border-radius:10px">
          <h2 style="color:#856404">Account Status Update</h2>
          <p>Hello ${user.contactPersonName},</p>
          <p>Your HSS account approval for <strong>${user.hospitalName}</strong> has been <strong>temporarily revoked</strong>.</p>
          <p>Please contact our support team for more information.</p>
          <hr style="margin:20px 0">
          <p style="font-size:12px;color:#666">This is an automated message from the HSS System.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'User unapproved and email sent' });
  } catch (err) {
    console.error('User unapproval error:', err);
    res.status(500).json({ error: 'Unapproval failed', details: err.message });
  }
});

// ===============================
// STAFF ROUTES
// ===============================

// Get staff members by hospitalId (now authenticated)
router.get('/staff', authenticateToken, async (req, res) => {
  try {
    const { hospitalId } = req.user; // Get from authenticated user
    
    const staff = await Staff.find({ hospitalId }).lean();
    res.json({ success: true, staff });
  } catch (err) {
    console.error('Error fetching staff:', err);
    res.status(500).json({ error: 'Could not fetch staff' });
  }
});

// ===============================
// AUTHENTICATION ROUTES
// ===============================

// Register
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
    if (!recaptchaRes.success) return res.status(400).json({ error: 'reCAPTCHA verification failed' });

    const existing = await User.findOne({ emailId: email_id });
    if (existing) return res.status(400).json({ error: 'User already exists with this Employer ID' });

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'User already exists with this email address' });

    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds for better security
    const newUser = new User({
      ...mapRequestToUserSchema(req.body),
      password: hashedPassword,
      isApproved: false,
      createdAt: new Date(),
    });

    await newUser.save();

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

// Login
router.post('/login', async (req, res) => {
  try {
    const { email_id, password } = req.body;
    
    if (!email_id || !password) {
      return res.status(400).json({ error: 'Email ID and password are required' });
    }

    const user = await User.findOne({ emailId: email_id });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isApproved) {
      return res.status(403).json({ error: 'Account not approved yet. Please wait for admin approval.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        hospitalId: user._id, // Using user ID as hospital ID for now
        hospitalName: user.hospitalName,
        role: user.role || 'user',
        email: user.email,
        contactPersonName: user.contactPersonName
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '24h' } // Extended to 24 hours
    );

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        hospitalName: user.hospitalName,
        contactPersonName: user.contactPersonName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', details: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Check authentication status
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      user: {
        id: user._id,
        hospitalName: user.hospitalName,
        contactPersonName: user.contactPersonName,
        email: user.email,
        role: user.role || 'user',
        isApproved: user.isApproved
      }
    });
  } catch (err) {
    console.error('Auth check error:', err);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// ===============================
// 2FA ROUTES (Currently disabled)
// ===============================
/*
// Uncomment and configure when ready to enable 2FA
const { Resend } = require('resend');
const resend = new Resend(process.env.VITE_RESEND_API_KEY);

router.post('/send-2fa', async (req, res) => {
  try {
    const { email_id } = req.body;

    if (!email_id) {
      return res.status(400).json({ error: 'Missing email_id' });
    }

    const user = await User.findOne({ emailId: email_id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    user.twoFA_code = code;
    user.twoFA_expires = expires;
    await user.save();

    await resend.emails.send({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your HSS 2FA Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2>HSS Login Code</h2>
          <p>Hello ${user.contactPersonName || 'User'},</p>
          <p>Your verification code is:</p>
          <h1 style="color: #6A0DAD">${code}</h1>
          <p>This code is valid for 10 minutes.</p>
        </div>
      `,
    });

    res.json({ success: true, message: '2FA code sent successfully' });
  } catch (err) {
    console.error('Error sending 2FA:', err.message);
    res.status(500).json({ error: 'Failed to send 2FA code', details: err.message });
  }
});

router.post('/verify-2fa', async (req, res) => {
  try {
    const { email_id, code, tempToken } = req.body;
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET || 'secret');

    const user = await User.findOne({ emailId: email_id });
    if (!user || user.twoFA_code !== code || new Date() > user.twoFA_expires) {
      return res.status(400).json({ error: 'Invalid or expired code' });
    }

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
      { expiresIn: '24h' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
      maxAge: 24 * 60 * 60 * 1000,
    }).json({ success: true, message: '2FA verified successfully' });

  } catch (err) {
    console.error('2FA verification error:', err);
    res.status(500).json({ error: 'Verification failed', details: err.message });
  }
});
*/

// ===============================
// UTILITY ROUTES
// ===============================

// Geocode
router.post('/geocode', async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: 'Missing latitude and longitude' });

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { format: 'json', lat, lon },
      headers: { 'User-Agent': 'HSS-Geocoder/1.0 (support@yourdomain.com)' },
    });

    res.json({ 
      success: true, 
      address: response.data.display_name,
      details: response.data.address 
    });
  } catch (err) {
    console.error('Geocoding error:', err);
    res.status(500).json({ error: 'Geocoding failed' });
  }
});

module.exports = router;