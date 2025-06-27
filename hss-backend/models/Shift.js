const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Shift date is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    shiftType: {
      type: String,
      enum: ['Morning', 'Evening', 'Night'],
      required: [true, 'Shift type is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shift', shiftSchema);
