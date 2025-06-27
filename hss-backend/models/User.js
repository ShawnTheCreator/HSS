const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      minlength: 2,
    },
    province: {
      type: String,
      required: [true, 'Province is required'],
      enum: [
        "Eastern Cape",
        "Free State",
        "Gauteng",
        "KwaZulu-Natal",
        "Limpopo",
        "Mpumalanga",
        "Northern Cape",
        "North West",
        "Western Cape",
      ],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      minlength: 2,
    },
    contactPersonName: {
      type: String,
      required: [true, 'Contact person name is required'],
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
      enum: ['admin', 'user'],
      default: 'user',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
