require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); 


const mongoURI = process.env.MONGO_URI; 

const seedAdmin = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const existingAdmin = await User.findOne({ email: 'admin@hss.com' });
    if (existingAdmin) {
      console.log('Admin already exists.');
      return process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);

    const admin = new User({
      full_name: 'System Administrator',
      email: 'admin@hss.com',
      phone_number: '+1-555-000-0000',
      role: 'Admin',
      department: 'IT',
      password: hashedPassword,
      biometric_hash: null,
      device_fingerprint: null,
      location_zone: 'Server Room',
      created_at: new Date(),
      updated_at: new Date()
    });

    await admin.save();
    console.log('Admin user seeded successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedAdmin();
