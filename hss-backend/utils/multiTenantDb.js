const mongoose = require('mongoose');

// Import schemas only — not full models
const UserSchema = require('../models/User');
const StaffSchema = require('../models/Staff');
const ShiftSchema = require('../models/Shift');
const AlertSchema = require('../models/Alert');

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
 * Get tenant-specific models for a given database name.
 * @param {string} dbName - The database name (e.g., "hss_demo_hospital")
 */
async function getTenantModels(dbName) {
  if (!dbName) throw new Error('Database name is required');

  // Reuse existing connection or create new tenant connection
  if (!connections[dbName]) {
    // useDb returns a connection that shares the pool but targets a different DB
    connections[dbName] = mongoose.connection.useDb(dbName, { useCache: true });
  }

  const conn = connections[dbName];

  // Register schemas as models if not already registered on this connection
  // Note: We use the schemas imported at the top level
  if (!conn.models.User) conn.model('User', UserSchema);
  if (!conn.models.Staff) conn.model('Staff', StaffSchema);
  if (!conn.models.Shift) conn.model('Shift', ShiftSchema);
  if (!conn.models.Alert) conn.model('Alert', AlertSchema);

  // Return all tenant-specific models
  return {
    User: conn.models.User,
    Staff: conn.models.Staff,
    Shift: conn.models.Shift,
    Alert: conn.models.Alert,
  };
}

/**
 * Close all tenant connections (useful for graceful shutdown)
 */
async function closeAllTenantConnections() {
  const promises = Object.values(connections).map(conn => conn.close());
  await Promise.all(promises);
  connections = {}; // clear cache
}

// Maintain backward compatibility if needed, or just export the new function
module.exports = { 
  getTenantModels, 
  getDatabaseName,
  closeAllTenantConnections
};
