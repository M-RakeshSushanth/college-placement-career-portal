const express = require('express');
const router = express.Router();
const aiController = require('./ai.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const upload = require('../../middleware/upload.middleware');

router.post('/ats-analyze', verifyToken, upload.single('resume'), aiController.analyzeResumeForJob);
router.post('/resume-improve', verifyToken, aiController.improveResume);
router.post('/mock-interview/questions', verifyToken, aiController.generateMockQuestions);
router.post('/mock-interview/evaluate', verifyToken, aiController.evaluateMockAnswer);

module.exports = router;
