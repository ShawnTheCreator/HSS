const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    staffName: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: [true, 'Shift date is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    department: {
      type: String,
      trim: true,
    },
    shiftType: {
      type: String,
      enum: ['Morning', 'Evening', 'Night', 'Custom'],
      default: 'Custom',
    },
    status: {
      type: String,
      enum: ['Scheduled', 'Completed', 'Missed', 'Cancelled', 'In Progress'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

// Export Schema only for Multi-tenant use
module.exports = shiftSchema;
