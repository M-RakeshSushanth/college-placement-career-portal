const express = require('express');
const router = express.Router();
const studentsController = require('./students.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

// Student profile management
router.get('/profile', verifyToken, authorizeRoles('student'), studentsController.getMyProfile);
router.put('/profile', verifyToken, authorizeRoles('student'), studentsController.updateMyProfile);
router.post('/resumes', verifyToken, authorizeRoles('student'), upload.single('resume'), studentsController.uploadResume);
router.delete('/resumes/:resumeId', verifyToken, authorizeRoles('student'), studentsController.deleteResume);
router.put('/resumes/:resumeId/primary', verifyToken, authorizeRoles('student'), studentsController.setPrimaryResume);

// Admin student directory and verification
router.get('/admin/all', verifyToken, authorizeRoles('admin'), studentsController.getAllStudentsAdmin);
router.put('/admin/verify/:studentProfileId', verifyToken, authorizeRoles('admin'), studentsController.verifyStudentAdmin);

module.exports = router;
