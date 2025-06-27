const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    hospital: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Refers to the hospital admin that owns this staff
      required: true,
    },
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
    department: {
      type: String,
      required: [true, 'Department is required'],
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
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Please enter a valid phone number'],
    },
    shift: {
      type: String,
      enum: ['Morning', 'Evening', 'Night'],
      required: [true, 'Shift is required'],
    },
    availability: {
      type: String,
      enum: ['Available', 'Not Available'],
      required: [true, 'Availability is required'],
    },
    complianceStatus: {
      type: String,
      enum: ['Compliant', 'Non-Compliant', 'Review Needed'],
      default: 'Review Needed',
    },
    profilePictureUrl: {
      type: String, // Optional field to store profile picture link
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Staff', staffSchema);
