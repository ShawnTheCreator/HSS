const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: 2,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
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
      trim: true,
      unique: true,
    },
    idNumber: {
      type: String,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number'],
    },
    role: {
      type: String,
      default: 'Staff',
    },
    position: {
      type: String,
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Flexible'],
      default: 'Flexible',
    },
    status: {
      type: String,
      enum: ['active', 'on-shift', 'leave', 'pending', 'inactive'],
      default: 'active',
    },
    certificationExpiry: {
      type: Date,
    },
    certifications: [
      {
        name: String,
        expiryDate: Date,
        fileUrl: String,
      },
    ],
    profileImage: {
      type: String, // URL to profile image
      trim: true,
    },
    availability: {
      type: String,
      enum: ['Available', 'Not Available'],
      default: 'Available',
    },
  },
  { timestamps: true }
);

// Export Schema only for Multi-tenant use
module.exports = staffSchema;
