const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

router.get('/overview', verifyToken, authorizeRoles('admin', 'recruiter'), analyticsController.getPlacementAnalytics);

module.exports = router;
