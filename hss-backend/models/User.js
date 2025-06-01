// Example fields in models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  full_name: String,
  email: { type: String, unique: true },
  phone_number: String,
  password: String,
  role: String,
  department: String,
  biometric_hash: String,
  device_fingerprint: String,
  location_zone: String,
  created_at: Date,
  updated_at: Date
});

module.exports = mongoose.model('User', userSchema);
