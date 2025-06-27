const mongoose = require('mongoose');

const complianceSchema = new mongoose.Schema(
  {
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true,
    },
    documentName: {
      type: String,
      required: [true, 'Document name is required'],
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
