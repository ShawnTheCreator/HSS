const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User'); // adjust path if needed

// Load environment variables
dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB Atlas');
    console.log('Database name:', mongoose.connection.name);

    const existingAdmin = await User.findOne({ email: 'admin@hss.com' });
    const desiredPassword = 'Admin@123';

    if (existingAdmin) {
      console.log('Admin already exists.');
      console.log('Updating password for existing admin...');

      const hashedPassword = await bcrypt.hash(desiredPassword, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.updated_at = new Date();

      await existingAdmin.save();
      console.log('✅ Admin password updated successfully.');

      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('Creating new admin user...');
    const hashedPassword = await bcrypt.hash(desiredPassword, 10);
    console.log('Generated hash for Admin@123');

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
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed admin:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();
