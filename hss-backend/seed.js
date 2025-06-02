const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // adjust path if needed

const mongoURI = 'mongodb://localhost:27017/users'; // adjust if needed

async function seedAdmin() {
  try {
    await mongoose.connect(mongoURI);

    const existingAdmin = await User.findOne({ email: 'admin@hss.com' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const adminUser = new User({
      full_name: 'System Administrator',
      email: 'admin@hss.com',
      phone_number: '+1-555-000-0000',
      password: hashedPassword,
      role: 'Admin',
      department: 'IT',
      biometric_hash: null,
      device_fingerprint: null,
      location_zone: 'Server Room',
      created_at: new Date(),
      updated_at: new Date()
    });

    await adminUser.save();
    console.log('✅ Admin user seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
    process.exit(1);
  }
}

seedAdmin();
