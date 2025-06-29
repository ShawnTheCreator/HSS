const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const Staff = require('../models/Staff');
const Shift = require('../models/Shift');
const Compliance = require('../models/Compliance');

// Authentication middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Authorization header missing' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Should contain user info, including hospitalId
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Protect all routes under /api/dashboard
router.use(authMiddleware);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId;
    if (!hospitalId) {
      return res.status(400).json({ message: 'Hospital ID missing in token' });
    }

    const totalStaff = await Staff.countDocuments({ hospitalId });
    const activeShifts = await Shift.countDocuments({ hospitalId, isActive: true });
    const pendingApprovals = await Staff.countDocuments({ hospitalId, isApproved: false });

    const compliantCount = await Compliance.countDocuments({ hospitalId, status: 'valid' });
    const nonCompliantCount = await Compliance.countDocuments({ hospitalId, status: { $ne: 'valid' } });

    res.status(200).json({
      totalStaff,
      activeShifts,
      pendingApprovals,
      compliance: {
        valid: compliantCount,
        invalid: nonCompliantCount,
      },
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
});

module.exports = router;
