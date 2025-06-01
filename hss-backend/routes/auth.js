const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // This schema must reflect your HSS structure
const router = express.Router();

// Register a staff user
router.post('/register', async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone_number,
      password,
      role, // e.g., Doctor, Nurse
      department,
      biometric_hash, // Optional
      device_fingerprint,
      location_zone
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

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
      created_at: new Date(),
      updated_at: new Date()
    });

    await newUser.save();

    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, device_fingerprint } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Optional: check fingerprint match
    if (device_fingerprint && user.device_fingerprint !== device_fingerprint) {
      return res.status(403).json({ msg: 'Unrecognized device fingerprint' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    res.json({
      token,
      user: {
        id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

module.exports = router;
