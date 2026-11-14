const Job = require('./Job.model');
const RecruiterProfile = require('../recruiters/RecruiterProfile.model');
const StudentProfile = require('../students/StudentProfile.model');
const { checkStudentEligibility } = require('../eligibility/eligibility.service');
const { emitToRole, broadcastEvent } = require('../../config/socket');
const Notification = require('../notifications/Notification.model');

const createJob = async (req, res) => {
  try {
    const recruiterProfile = await RecruiterProfile.findOne({ user: req.user.id });
    const companyName = recruiterProfile ? recruiterProfile.companyName : (req.body.companyName || 'Company');

    const job = new Job({
      ...req.body,
      recruiter: req.user.id,
      companyName,
      approvedByAdmin: true, // Auto-approve or pending based on policy
    });

    await job.save();

    // Create Notification & Emit via Socket.io
    const notif = await Notification.create({
      recipient: null,
      recipientRole: 'student',
      title: 'New Placement Opportunity',
      message: `${companyName} is hiring for ${job.title} (${job.salaryPackage?.ctc || 'Competitive'} LPA). Check your eligibility and apply!`,
      type: 'job_posted',
      link: `/student/jobs/${job._id}`,
    });

    emitToRole('student', 'notification:new', notif);
    broadcastEvent('job:new_published', { job });

    res.status(201).json({ success: true, message: 'Job opportunity published successfully', job });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublishedJobs = async (req, res) => {
  try {
    const { branch, search, employmentType } = req.query;
    const filter = { status: 'published' };

    if (employmentType) filter.employmentType = employmentType;
    if (branch) filter.eligibleBranches = branch;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { requiredSkills: { $regex: search, $options: 'i' } },
      ];
    }

    const jobs = await Job.find(filter).sort({ createdAt: -1 });

    // If current logged-in user is a student, evaluate eligibility for each job!
    let studentProfile = null;
    if (req.user && req.user.role === 'student') {
      studentProfile = await StudentProfile.findOne({ user: req.user.id });
    }

    const enrichedJobs = jobs.map(job => {
      const jobObj = job.toObject();
      if (studentProfile) {
        const evalResult = checkStudentEligibility(studentProfile, job);
        jobObj.isEligible = evalResult.isEligible;
        jobObj.ineligibilityReasons = evalResult.reasons;
        jobObj.criteriaStatus = evalResult.criteriaStatus;
      }
      return jobObj;
    });

    res.json({ success: true, count: enrichedJobs.length, jobs: enrichedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    const jobObj = job.toObject();

    // If student, attach comprehensive eligibility verification
    if (req.user && req.user.role === 'student') {
      const studentProfile = await StudentProfile.findOne({ user: req.user.id });
      if (studentProfile) {
        const evalResult = checkStudentEligibility(studentProfile, job);
        jobObj.isEligible = evalResult.isEligible;
        jobObj.ineligibilityReasons = evalResult.reasons;
        jobObj.criteriaStatus = evalResult.criteriaStatus;
      }
    }

    res.json({ success: true, job: jobObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiter: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, recruiter: req.user.id });
    if (!job && req.user.role !== 'admin') {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json({ success: true, message: 'Job updated successfully', job: updatedJob });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, recruiter: req.user.id };
    const job = await Job.findOneAndDelete(filter);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or unauthorized' });
    }
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllJobsAdmin = async (req, res) => {
  try {
    const jobs = await Job.find().populate('recruiter', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, count: jobs.length, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createJob,
  getPublishedJobs,
  getJobById,
  getMyPostedJobs,
  updateJob,
  deleteJob,
  getAllJobsAdmin,
};
