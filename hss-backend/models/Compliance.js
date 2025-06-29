const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema(
  {
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hospital',   // Reference to Hospital model
      required: true,
      index: true,
    },
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    documentName: {
      type: String,
      required: [true, 'Document name is required'],
      trim: true,
    },
    expiryDate: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    status: {
      type: String,
      enum: ['Valid', 'Expired', 'Expiring Soon'],
      required: [true, 'Status is required'],
    },
    fileUrl: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Compliance', complianceSchema);
