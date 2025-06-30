const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const centralAuthSchema = require('./models/CentralAuth').schema; // or require('./models/CentralAuth') if it exports schema directly
require('dotenv').config();

const userData = {
  hospitalName: "demo",
  hospitalDbName: "demo",
  province: "Gauteng",
  city: "Johannesburg",
  contactPersonName: "Demo",
  email: "Demo@gmail.com",
  emailId: "demo_admin",
  phoneNumber: "+27111234567",
  password: "Password123!",  // plaintext to hash
  device_fingerprint: "abc123xyz987",
  gps_coordinates: "-26.2041,28.0473",
  location_address: "44 Alstain Road Respublica",
  isApproved: true,
  role: "admin",
  twoFA_code: null,
  twoFA_expires: null,
  createdAt: new Date("2025-06-30T12:00:00Z"),
  lastLogin: new Date("2025-06-29T08:30:00Z"),
};

async function seedUser() {
  try {
    // Connect to MongoDB and wait until connection is ready
    const connection = await mongoose.createConnection(process.env.MONGO_URI, {
      dbName: 'HSSDB',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await new Promise((resolve, reject) => {
      connection.once('open', resolve);
      connection.on('error', reject);
    });

    console.log('Connected to MongoDB HSSDB database!');

    // Bind model to this connection
    const CentralAuth = connection.model('CentralAuth', centralAuthSchema);

    // Check if user already exists
    const existing = await CentralAuth.findOne({ emailId: userData.emailId });
    if (existing) {
      console.log('User already exists');
      process.exit(0);
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    const newUser = new CentralAuth({
      ...userData,
      password: hashedPassword,
    });

    await newUser.save();

    console.log('User seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding user:', err);
    process.exit(1);
  }
}

seedUser();
