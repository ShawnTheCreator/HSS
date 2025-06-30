const mongoose = require('mongoose');

// Import schemas only — not full models
const UserSchema = require('../models/User');
const StaffSchema = require('../models/Staff');
const ShiftSchema = require('../models/Shift');
const AlertSchema = require('../models/Alert');  // ✅ Make sure this file exists

const connections = {};

/**
 * Generate database name dynamically from emailId.
 * Replaces non-alphanumeric chars with underscores.
 */
function getDatabaseName(emailId) {
  const base = emailId.split('@')[0].toLowerCase().replace(/\W+/g, '_');
  return `hss_${base}`;
}

/**
 * Get or create tenant-specific connection and register models.
 * Returns all models for the tenant database.
 */
async function getTenantModel(emailId) {
  const dbName = getDatabaseName(emailId);

  // Reuse existing connection or create new tenant connection
  if (!connections[dbName]) {
    connections[dbName] = mongoose.connection.useDb(dbName, { useCache: true });
  }

  const conn = connections[dbName];

  // Register schemas as models if not already registered on this connection
  if (!conn.models.User) conn.model('User', UserSchema);
  if (!conn.models.Staff) conn.model('Staff', StaffSchema);
  if (!conn.models.Shift) conn.model('Shift', ShiftSchema);
  if (!conn.models.Alert) conn.model('Alert', AlertSchema);  // ✅ Register Alert model

  // Return all tenant-specific models
  return {
    User: conn.models.User,
    Staff: conn.models.Staff,
    Shift: conn.models.Shift,
    Alert: conn.models.Alert,
  };
}

module.exports = { getTenantModel };
