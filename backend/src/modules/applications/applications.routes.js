const express = require('express');
const router = express.Router();
const applicationsController = require('./applications.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

// Student routes
router.post('/apply', verifyToken, authorizeRoles('student'), applicationsController.applyForJob);
router.get('/my-applications', verifyToken, authorizeRoles('student'), applicationsController.getMyApplications);

// Recruiter & Admin routes
router.get('/job/:jobId', verifyToken, authorizeRoles('recruiter', 'admin'), applicationsController.getJobApplicants);
router.put('/:applicationId/status', verifyToken, authorizeRoles('recruiter', 'admin'), applicationsController.updateApplicationStatus);

// Admin route
router.get('/admin/all', verifyToken, authorizeRoles('admin'), applicationsController.getAllApplicationsAdmin);

module.exports = router;
