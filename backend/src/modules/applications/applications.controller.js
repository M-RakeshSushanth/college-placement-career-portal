const Application = require('./Application.model');
const Job = require('../jobs/Job.model');
const StudentProfile = require('../students/StudentProfile.model');
const Notification = require('../notifications/Notification.model');
const { checkStudentEligibility } = require('../eligibility/eligibility.service');
const { emitToUser, emitToRole } = require('../../config/socket');

const applyForJob = async (req, res) => {
  try {
    const { jobId, resumeId, atsScoreReport } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job opportunity not found.' });
    }

    // 1. Check Deadline
    if (new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({ success: false, message: 'Application deadline for this job has expired.' });
    }

    // 2. Check Student Profile
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(400).json({ success: false, message: 'Please complete your student profile before applying.' });
    }

    // 3. Automated Eligibility Verification
    const eligibility = checkStudentEligibility(profile, job);
    if (!eligibility.isEligible) {
      return res.status(403).json({
        success: false,
        message: 'You are not eligible for this job opportunity.',
        ineligibilityReasons: eligibility.reasons,
      });
    }

    // 4. Check for duplicate application
    const existing = await Application.findOne({ job: jobId, student: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already submitted an application for this position.' });
    }

    // 5. Select Resume
    let selectedResume = null;
    if (resumeId && profile.resumes && profile.resumes.length > 0) {
      selectedResume = profile.resumes.find(r => r._id.toString() === resumeId);
    }
    if (!selectedResume && profile.resumes && profile.resumes.length > 0) {
      selectedResume = profile.resumes.find(r => r.isPrimary) || profile.resumes[0];
    }

    const application = new Application({
      job: jobId,
      student: req.user.id,
      studentProfile: profile._id,
      resume: selectedResume ? {
        title: selectedResume.title,
        filePath: selectedResume.filePath,
        originalName: selectedResume.originalName,
      } : null,
      status: 'Applied',
      stageHistory: [
        {
          stage: 'Applied',
          updatedBy: req.user.id,
          notes: 'Application successfully received.',
          updatedAt: new Date(),
        }
      ],
      atsScoreReport: atsScoreReport || null,
      appliedAt: new Date(),
    });

    await application.save();

    // Notify recruiter
    const recruiterNotif = await Notification.create({
      recipient: job.recruiter,
      recipientRole: 'recruiter',
      title: 'New Candidate Application',
      message: `${req.user.name} applied for "${job.title}".`,
      type: 'application_status',
      link: `/recruiter/jobs/${job._id}/applicants`,
    });
    emitToUser(job.recruiter.toString(), 'notification:new', recruiterNotif);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user.id })
      .populate('job')
      .populate('studentProfile')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, minCgpa, branch } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found.' });
    }

    // Verify ownership if recruiter
    if (req.user.role === 'recruiter' && job.recruiter.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view applicants for this job.' });
    }

    const filter = { job: jobId };
    if (status) filter.status = status;

    let applications = await Application.find(filter)
      .populate('student', 'name email')
      .populate('studentProfile')
      .sort({ appliedAt: -1 });

    if (minCgpa) {
      applications = applications.filter(a => a.studentProfile && a.studentProfile.cgpa >= Number(minCgpa));
    }
    if (branch) {
      applications = applications.filter(a => a.studentProfile && a.studentProfile.department === branch);
    }

    res.json({ success: true, count: applications.length, applications, job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes, interviewDetails } = req.body;

    const application = await Application.findById(applicationId).populate('job').populate('student', 'name email');
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }

    if (status) {
      application.status = status;
      application.stageHistory.push({
        stage: status,
        updatedBy: req.user.id,
        notes: notes || `Moved to ${status} stage.`,
        updatedAt: new Date(),
      });
    }

    if (interviewDetails) {
      application.interviewDetails = interviewDetails;
    }

    // If selected, update student's placement status
    if (status === 'Selected') {
      await StudentProfile.findOneAndUpdate(
        { user: application.student._id },
        {
          placementStatus: 'placed',
          $push: {
            placedOffers: {
              company: application.job.companyName,
              role: application.job.title,
              packageCTC: application.job.salaryPackage?.ctc || 0,
              date: new Date(),
            }
          }
        }
      );
    }

    await application.save();

    // Send real-time notification to student
    const studentNotif = await Notification.create({
      recipient: application.student._id,
      recipientRole: 'student',
      title: `Application Status: ${status}`,
      message: `Your application for "${application.job.title}" at ${application.job.companyName} has been updated to "${status}".`,
      type: status === 'Shortlisted' ? 'shortlist_alert' : (status === 'Interview' ? 'interview_scheduled' : 'application_status'),
      link: '/student/applications',
    });

    emitToUser(application.student._id.toString(), 'notification:new', studentNotif);
    emitToUser(application.student._id.toString(), 'application:status_updated', {
      applicationId: application._id,
      status,
      jobTitle: application.job.title,
    });

    res.json({ success: true, message: `Application status updated to ${status}`, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllApplicationsAdmin = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('job', 'title companyName salaryPackage jobLocation')
      .populate('student', 'name email')
      .populate('studentProfile')
      .sort({ appliedAt: -1 });

    res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  applyForJob,
  getMyApplications,
  getJobApplicants,
  updateApplicationStatus,
  getAllApplicationsAdmin,
};
