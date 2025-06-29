const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',  // Reference to Hospital model
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
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
      required: [true, 'Email ID is required'],
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
      type: String, // Example: "lat,lon"
      trim: true,
    },
    location_address: {
      type: String,
      trim: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    twoFA_code: {
      type: String,
      default: null,
    },
    twoFA_expires: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'doctor', 'nurse', 'staff'], // extend roles as needed
      default: 'user',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
