const mongoose = require('mongoose');

const centralAuthSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
    },
    hospitalDbName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    province: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    contactPersonName: {
      type: String,
      required: [true, 'Contact person name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, 'Please enter a valid email address'],
    },
    emailId: {
      type: String,
      required: [true, 'Employee id is required'],
      unique: true,
      trim: true,
      minlength: 3,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
    },
    device_fingerprint: {
      type: String,
      trim: true,
    },
    gps_coordinates: {
      type: String, // Format example: "lat,lon"
      trim: true,
    },
    location_address: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['hospital_admin', 'admin', 'super_admin'],
      default: 'hospital_admin',
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CentralAuth', centralAuthSchema);
