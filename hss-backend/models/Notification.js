const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',  // Reference to your Hospital model
      required: true,
      index: true,       // Add index for faster queries per hospital
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // or 'Staff', depending on your target model
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['info', 'alert', 'warning', 'success'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
