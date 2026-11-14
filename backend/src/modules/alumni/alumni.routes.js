const express = require('express');
const router = express.Router();
const alumniController = require('./alumni.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

router.get('/', alumniController.getAllAlumniFeedback);
router.post('/', verifyToken, alumniController.createAlumniFeedback);
router.put('/:id/upvote', verifyToken, alumniController.upvoteAlumniFeedback);
router.delete('/:id', verifyToken, authorizeRoles('admin'), alumniController.deleteAlumniFeedbackAdmin);

module.exports = router;
