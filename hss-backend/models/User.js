const userSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone_number: String,
  password: { type: String, required: true },
  role: String,
  department: String,
  biometric_hash: String,
  device_fingerprint: String,
  location_zone: String,
  isApproved: { type: Boolean, default: false }, // <-- NEW
}, { timestamps: true });
