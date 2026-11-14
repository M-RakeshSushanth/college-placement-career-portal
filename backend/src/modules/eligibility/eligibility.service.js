const StudentProfile = require('../students/StudentProfile.model');
const Job = require('../jobs/Job.model');

/**
 * Evaluates whether a student meets all eligibility criteria for a given job opening.
 * Checks:
 * - Branch / Department
 * - Graduation Year
 * - Minimum CGPA
 * - Active Backlogs limit
 * - History of Backlogs limit
 * - 10th & 12th percentage thresholds
 */
const checkStudentEligibility = (studentProfile, job) => {
  const reasons = [];
  const criteriaStatus = {
    branch: { passed: true, studentValue: studentProfile.department, required: job.eligibleBranches },
    graduationYear: { passed: true, studentValue: studentProfile.graduationYear, required: job.eligibleGraduationYears },
    cgpa: { passed: true, studentValue: studentProfile.cgpa, required: job.minimumCGPA },
    activeBacklogs: { passed: true, studentValue: studentProfile.activeBacklogs, required: job.maxActiveBacklogs },
    historyOfBacklogs: { passed: true, studentValue: studentProfile.historyOfBacklogs, required: job.maxHistoryOfBacklogs },
    tenthPercentage: { passed: true, studentValue: studentProfile.tenthPercentage, required: job.tenthMinPercentage },
    twelfthPercentage: { passed: true, studentValue: studentProfile.twelfthPercentage, required: job.twelfthMinPercentage },
  };

  // 1. Department / Branch Check
  if (job.eligibleBranches && job.eligibleBranches.length > 0) {
    const isBranchEligible = job.eligibleBranches.some(
      branch => branch.toLowerCase().trim() === (studentProfile.department || '').toLowerCase().trim()
    );
    if (!isBranchEligible) {
      criteriaStatus.branch.passed = false;
      reasons.push(`Branch mismatch: "${studentProfile.department}" is not among eligible branches (${job.eligibleBranches.join(', ')}).`);
    }
  }

  // 2. Graduation Year Check
  if (job.eligibleGraduationYears && job.eligibleGraduationYears.length > 0) {
    const isGradYearEligible = job.eligibleGraduationYears.includes(Number(studentProfile.graduationYear));
    if (!isGradYearEligible) {
      criteriaStatus.graduationYear.passed = false;
      reasons.push(`Graduation year mismatch: batch ${studentProfile.graduationYear} is not eligible (Required: ${job.eligibleGraduationYears.join(', ')}).`);
    }
  }

  // 3. Minimum CGPA Check
  if (job.minimumCGPA !== undefined && job.minimumCGPA !== null) {
    if ((studentProfile.cgpa || 0) < job.minimumCGPA) {
      criteriaStatus.cgpa.passed = false;
      reasons.push(`CGPA requirement not met: Current CGPA is ${studentProfile.cgpa}, but minimum required is ${job.minimumCGPA}.`);
    }
  }

  // 4. Active Backlogs Check
  if (job.maxActiveBacklogs !== undefined && job.maxActiveBacklogs !== null) {
    if ((studentProfile.activeBacklogs || 0) > job.maxActiveBacklogs) {
      criteriaStatus.activeBacklogs.passed = false;
      reasons.push(`Active backlogs restriction: Student has ${studentProfile.activeBacklogs} active backlogs (Maximum allowed: ${job.maxActiveBacklogs}).`);
    }
  }

  // 5. History of Backlogs Check
  if (job.maxHistoryOfBacklogs !== undefined && job.maxHistoryOfBacklogs !== null) {
    if ((studentProfile.historyOfBacklogs || 0) > job.maxHistoryOfBacklogs) {
      criteriaStatus.historyOfBacklogs.passed = false;
      reasons.push(`Backlog history restriction: Student has ${studentProfile.historyOfBacklogs} historical backlogs (Maximum permitted: ${job.maxHistoryOfBacklogs}).`);
    }
  }

  // 6. 10th percentage check
  if (job.tenthMinPercentage && studentProfile.tenthPercentage) {
    if (studentProfile.tenthPercentage < job.tenthMinPercentage) {
      criteriaStatus.tenthPercentage.passed = false;
      reasons.push(`10th standard percentage is ${studentProfile.tenthPercentage}%, below minimum ${job.tenthMinPercentage}%.`);
    }
  }

  // 7. 12th percentage check
  if (job.twelfthMinPercentage && studentProfile.twelfthPercentage) {
    if (studentProfile.twelfthPercentage < job.twelfthMinPercentage) {
      criteriaStatus.twelfthPercentage.passed = false;
      reasons.push(`12th standard percentage is ${studentProfile.twelfthPercentage}%, below minimum ${job.twelfthMinPercentage}%.`);
    }
  }

  const isEligible = reasons.length === 0;

  return {
    isEligible,
    reasons,
    criteriaStatus,
  };
};

/**
 * Retrieve all students categorized into eligible and ineligible for a job.
 */
const getEligibleStudentsForJob = async (jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new Error('Job not found');

  const students = await StudentProfile.find().populate('user', 'name email');

  const eligibleList = [];
  const ineligibleList = [];

  for (const student of students) {
    const evalResult = checkStudentEligibility(student, job);
    const item = {
      studentId: student.user._id,
      profileId: student._id,
      name: student.user.name,
      email: student.user.email,
      registrationNumber: student.registrationNumber,
      department: student.department,
      graduationYear: student.graduationYear,
      cgpa: student.cgpa,
      activeBacklogs: student.activeBacklogs,
      isEligible: evalResult.isEligible,
      reasons: evalResult.reasons,
      criteriaStatus: evalResult.criteriaStatus,
    };

    if (evalResult.isEligible) {
      eligibleList.push(item);
    } else {
      ineligibleList.push(item);
    }
  }

  return {
    jobId: job._id,
    jobTitle: job.title,
    companyName: job.companyName,
    totalStudents: students.length,
    eligibleCount: eligibleList.length,
    ineligibleCount: ineligibleList.length,
    eligibleStudents: eligibleList,
    ineligibleStudents: ineligibleList,
  };
};

module.exports = {
  checkStudentEligibility,
  getEligibleStudentsForJob,
};
