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

// Admin email (could also be an array for multiple admins)
const adminEmail = process.env.ADMIN_EMAIL || 'admin@yourdomain.com';

// Register a staff user
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone_number,
      password,
      role,
      department,
      biometric_hash,
      device_fingerprint,
      location_zone,
      recaptcha_token
    } = req.body;

    // Validate reCAPTCHA if enabled
    if (process.env.RECAPTCHA_ENABLED === 'true' && !recaptcha_token) {
      return res.status(400).json({ error: 'reCAPTCHA verification required' });
    }

    // Verify reCAPTCHA token if provided
    if (recaptcha_token) {
      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`;
      const recaptchaResponse = await fetch(verificationUrl);
      const recaptchaData = await recaptchaResponse.json();
      
      if (!recaptchaData.success) {
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      full_name,
      email,
      phone_number,
      password: hashedPassword,
      role,
      department,
      biometric_hash,
      device_fingerprint,
      location_zone,
      isApproved: false, // user must be approved by admin
      created_at: new Date(),
      updated_at: new Date()
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Prepare email templates
    const adminMailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: adminEmail,
      subject: 'New User Registration Requires Approval',
      html: `
        <h2>New User Registration</h2>
        <p>A new user has registered and requires approval:</p>
        <ul>
          <li>Name: ${savedUser.full_name}</li>
          <li>Email: ${savedUser.email}</li>
          <li>Phone: ${savedUser.phone_number}</li>
          <li>Role: ${savedUser.role}</li>
          <li>Department: ${savedUser.department}</li>
          <li>Registration IP: ${req.ip}</li>
          <li>Location: ${savedUser.location_zone}</li>
          <li>Registered at: ${savedUser.created_at.toLocaleString()}</li>
        </ul>
        <p>Please review and approve this registration in the admin panel.</p>
        <p><a href="${process.env.ADMIN_PANEL_URL || 'http://your-admin-panel.com'}">Go to Admin Panel</a></p>
      `,
    };

    const userMailOptions = {
      from: process.env.EMAIL_FROM || `"HSS System" <${process.env.EMAIL_USER}>`,
      to: savedUser.email,
      subject: 'Your Registration is Under Review',
      html: `
        <h2>Thank You for Registering</h2>
        <p>Dear ${savedUser.full_name},</p>
        <p>Your account registration has been received and is under review by our administrators.</p>
        <p>You will receive another email once your account has been approved.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The HSS Team</p>
      `,
    };

    // Send emails (fire and forget - don't wait for response)
    transporter.sendMail(adminMailOptions).catch(err => {
      console.error('Error sending admin notification email:', err);
    });
    
    transporter.sendMail(userMailOptions).catch(err => {
      console.error('Error sending user confirmation email:', err);
    });

    // Respond to client
    res.status(201).json({ 
      success: true,
      message: 'Registration successful. Please wait for admin approval.',
      data: {
        id: savedUser._id,
        email: savedUser.email,
        status: 'pending_approval'
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ 
      error: 'Server error during registration',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, device_fingerprint } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check approval status
    if (!user.isApproved) {
      return res.status(403).json({ 
        error: 'Account pending approval',
        message: 'Your account is still awaiting admin approval. Please try again later.'
      });
    }

    // Device fingerprint check (if enabled)
    if (process.env.DEVICE_FINGERPRINT_ENABLED === 'true' && 
        device_fingerprint && 
        user.device_fingerprint !== device_fingerprint) {
      return res.status(403).json({ 
        error: 'Unrecognized device',
        message: 'Login attempt from unrecognized device. Please verify your identity.'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,
        email: user.email
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Successful login response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department,
        isApproved: user.isApproved
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;