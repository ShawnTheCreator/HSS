const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',  // Reference to your Hospital model
      required: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
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
      trim: true,
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      trim: true,
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
