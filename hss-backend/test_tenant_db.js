const mongoose = require('mongoose');
const { getTenantModels } = require('./utils/multiTenantDb');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URL || process.env.MONGO_URI;

async function test() {
  try {
    console.log('Connecting to MongoDB...');
    if (!MONGO_URI) {
        throw new Error('MONGO_URI is missing in .env');
    }
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const dbName = 'hss_demo_hospital';
    console.log(`Getting models for ${dbName}...`);
    
    const models = await getTenantModels(dbName);
    console.log('Models retrieved:', Object.keys(models));

    if (!models.Staff) throw new Error('Staff model missing');

    const count = await models.Staff.countDocuments();
    console.log(`Staff count in ${dbName}: ${count}`);
    
    // Check if we can find one
    const staff = await models.Staff.findOne();
    if (staff) {
        console.log('Found staff:', staff.firstName, staff.lastName);
    } else {
        console.log('No staff found.');
    }

  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

test();
