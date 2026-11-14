const express = require('express');
const router = express.Router();
const eligibilityController = require('./eligibility.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

router.get('/job/:jobId/students', verifyToken, authorizeRoles('admin', 'recruiter'), eligibilityController.getJobEligibleStudents);
router.post('/check-single', verifyToken, eligibilityController.checkEligibilityManual);

module.exports = router;
