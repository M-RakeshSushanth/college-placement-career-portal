const express = require('express');
const router = express.Router();
const jobsController = require('./jobs.controller');
const { verifyToken, authorizeRoles } = require('../../middleware/auth.middleware');

// Public or authenticated list
router.get('/', (req, res, next) => {
  // Optional token check so student gets personalized eligibility
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, () => jobsController.getPublishedJobs(req, res));
  }
  return jobsController.getPublishedJobs(req, res);
});

router.get('/:id', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyToken(req, res, () => jobsController.getJobById(req, res));
  }
  return jobsController.getJobById(req, res);
});

// Recruiter endpoints
router.post('/', verifyToken, authorizeRoles('recruiter', 'admin'), jobsController.createJob);
router.get('/recruiter/my-jobs', verifyToken, authorizeRoles('recruiter'), jobsController.getMyPostedJobs);
router.put('/:id', verifyToken, authorizeRoles('recruiter', 'admin'), jobsController.updateJob);
router.delete('/:id', verifyToken, authorizeRoles('recruiter', 'admin'), jobsController.deleteJob);

// Admin endpoints
router.get('/admin/all', verifyToken, authorizeRoles('admin'), jobsController.getAllJobsAdmin);

module.exports = router;
