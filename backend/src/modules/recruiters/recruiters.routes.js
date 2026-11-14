const express = require('express');
const router = express.Router();
const recruitersController = require('./recruiters.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

router.get('/profile', verifyToken, authorizeRoles('recruiter'), recruitersController.getMyProfile);
router.put('/profile', verifyToken, authorizeRoles('recruiter'), recruitersController.updateMyProfile);

// Admin recruiter management
router.get('/admin/all', verifyToken, authorizeRoles('admin'), recruitersController.getAllRecruitersAdmin);
router.put('/admin/verify/:recruiterProfileId', verifyToken, authorizeRoles('admin'), recruitersController.verifyRecruiterAdmin);

module.exports = router;
