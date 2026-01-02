const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Import Schemas
const CentralAuth = require('./models/CentralAuth');
const staffSchema = require('./models/Staff');
const shiftSchema = require('./models/Shift');
const alertSchema = require('./models/Alert');

dotenv.config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI not found in .env file');
  process.exit(1);
}

// ---------------------------------------------------------
// DATA CONFIGURATION
// ---------------------------------------------------------

const DEMO_USER = {
  hospitalName: "HSS Demo Hospital",
  hospitalDbName: "hss_demo_hospital",
  province: "Gauteng",
  city: "Johannesburg",
  contactPersonName: "Demo User",
  email: "demo@hss-system.com",
  emailId: "demo_user",
  phoneNumber: "+27110000000",
  password: "hss123demo", // Will be hashed
  device_fingerprint: "demo_fingerprint_123",
  gps_coordinates: "-26.2041,28.0473",
  location_address: "123 Demo Street, Tech City",
  isApproved: true,
  role: "hospital_admin",
};

// Seed Data for the Tenant Database
const SEED_DATA = {
  staff: [
    {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.j@demo.com",
      emailId: "S_JOHNSON",
      phoneNumber: "+27820001111",
      role: "Nurse",
      department: "ICU",
      shift: "Morning",
      status: "active",
      availability: "Available",
      idNumber: "9001010000080",
      complianceStatus: "Compliant"
    },
    {
      firstName: "Mike",
      lastName: "Peters",
      email: "mike.p@demo.com",
      emailId: "M_PETERS",
      phoneNumber: "+27820002222",
      role: "Doctor",
      department: "Emergency",
      shift: "Night",
      status: "on-shift",
      availability: "Not Available",
      idNumber: "8505050000080",
      complianceStatus: "Compliant"
    },
    {
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.d@demo.com",
      emailId: "E_DAVIS",
      phoneNumber: "+27820003333",
      role: "Nurse",
      department: "Pediatrics",
      shift: "Evening",
      status: "active",
      availability: "Available",
      idNumber: "9502020000080",
      complianceStatus: "Review Needed"
    },
    {
      firstName: "David",
      lastName: "Wilson",
      email: "david.w@demo.com",
      emailId: "D_WILSON",
      phoneNumber: "+27820004444",
      role: "Surgeon",
      department: "Surgery",
      shift: "Morning",
      status: "leave",
      availability: "Not Available",
      idNumber: "8008080000080",
      complianceStatus: "Compliant"
    },
    {
      firstName: "Jessica",
      lastName: "Brown",
      email: "jessica.b@demo.com",
      emailId: "J_BROWN",
      phoneNumber: "+27820005555",
      role: "Staff",
      department: "General",
      shift: "Flexible",
      status: "pending",
      availability: "Available",
      idNumber: "9809090000080",
      complianceStatus: "Non-Compliant"
    }
  ],
  alerts: [
    {
      title: "Certification Expiring",
      description: "Nurse Emily Davis certification expires in 5 days.",
      level: "high",
      isRead: false
    },
    {
      title: "Low Staff Warning",
      description: "Night shift in Emergency department is understaffed.",
      level: "critical",
      isRead: false
    },
    {
      title: "System Update",
      description: "Scheduled maintenance on Sunday at 2 AM.",
      level: "info",
      isRead: true
    }
  ]
};

// ---------------------------------------------------------
// SEEDING FUNCTION
// ---------------------------------------------------------

async function seed() {
  let mainConnection = null;
  let tenantConnection = null;

  try {
    console.log('🚀 Starting Seed Process...');
    console.log(`📡 Connecting to: ${MONGO_URI.split('@')[1] || 'Localhost'}...`); // Log safe URI part

    // 1. Connect to Main Database
    mainConnection = await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to Main Database');

    // 2. Seed CentralAuth User
    console.log(`\n👤 Seeding User: ${DEMO_USER.emailId}...`);
    
    // Check if user exists
    const existingUser = await CentralAuth.findOne({ emailId: DEMO_USER.emailId });
    if (existingUser) {
      console.log('⚠️ User already exists. Updating password...');
      existingUser.password = await bcrypt.hash(DEMO_USER.password, 12);
      existingUser.hospitalDbName = DEMO_USER.hospitalDbName; // Ensure correct DB mapping
      existingUser.isApproved = true;
      await existingUser.save();
      console.log('✅ User updated.');
    } else {
      const hashedPassword = await bcrypt.hash(DEMO_USER.password, 12);
      const newUser = new CentralAuth({
        ...DEMO_USER,
        password: hashedPassword
      });
      await newUser.save();
      console.log('✅ New user created.');
    }

    // 3. Connect to Tenant Database
    console.log(`\n🏥 Switching to Tenant Database: ${DEMO_USER.hospitalDbName}...`);
    tenantConnection = mongoose.connection.useDb(DEMO_USER.hospitalDbName, { useCache: true });
    
    // Register Models for this connection
    const Staff = tenantConnection.model('Staff', staffSchema);
    const Shift = tenantConnection.model('Shift', shiftSchema);
    const Alert = tenantConnection.model('Alert', alertSchema);

    // 4. Clear existing data in tenant DB to avoid duplicates
    await Staff.deleteMany({});
    await Shift.deleteMany({});
    await Alert.deleteMany({});
    console.log('🧹 Cleared existing tenant data.');

    // 5. Seed Staff
    console.log(`🌱 Seeding ${SEED_DATA.staff.length} staff members...`);
    const createdStaff = await Staff.insertMany(SEED_DATA.staff);
    console.log('✅ Staff seeded.');

    // 6. Seed Alerts
    console.log(`🌱 Seeding ${SEED_DATA.alerts.length} alerts...`);
    await Alert.insertMany(SEED_DATA.alerts);
    console.log('✅ Alerts seeded.');

    // 7. Seed Shifts (Dynamic dates)
    console.log('🌱 Seeding shifts...');
    const shifts = [];
    const today = new Date();
    const activeStaff = createdStaff.filter(s => s.status !== 'inactive');

    // Create shifts for the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Assign 3 random staff per day
      const dailyStaff = activeStaff.sort(() => 0.5 - Math.random()).slice(0, 3);

      dailyStaff.forEach(staff => {
        const startTime = new Date(date);
        startTime.setHours(8, 0, 0, 0); // 08:00 AM
        
        const endTime = new Date(date);
        endTime.setHours(16, 0, 0, 0); // 04:00 PM

        shifts.push({
          staffId: staff._id,
          staffName: `${staff.firstName} ${staff.lastName}`,
          date: date,
          startTime: startTime,
          endTime: endTime,
          department: staff.department,
          shiftType: "Morning",
          status: "Scheduled"
        });
      });
    }
    
    await Shift.insertMany(shifts);
    console.log(`✅ ${shifts.length} Shifts seeded.`);

    console.log('\n✨ SEEDING COMPLETE! ✨');
    console.log(`👉 Login with: ${DEMO_USER.emailId} / ${DEMO_USER.password}`);

  } catch (error) {
    console.error('\n❌ SEEDING FAILED:', error);
  } finally {
    if (mainConnection) {
      await mongoose.disconnect();
      console.log('👋 Disconnected.');
    }
    process.exit(0);
  }
}

seed();
