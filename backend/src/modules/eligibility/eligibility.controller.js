const { getEligibleStudentsForJob, checkStudentEligibility } = require('./eligibility.service');
const StudentProfile = require('../students/StudentProfile.model');
const Job = require('../jobs/Job.model');

const getJobEligibleStudents = async (req, res) => {
  try {
    const { jobId } = req.params;
    const report = await getEligibleStudentsForJob(jobId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const checkEligibilityManual = async (req, res) => {
  try {
    const { studentProfileId, jobId } = req.body;
    const student = await StudentProfile.findById(studentProfileId).populate('user', 'name email');
    const job = await Job.findById(jobId);

    if (!student || !job) {
      return res.status(404).json({ success: false, message: 'Student profile or Job not found.' });
    }

    const result = checkStudentEligibility(student, job);
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getJobEligibleStudents,
  checkEligibilityManual,
};
