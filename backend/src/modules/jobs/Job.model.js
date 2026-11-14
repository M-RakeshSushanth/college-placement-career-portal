const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  requiredSkills: [{
    type: String,
    trim: true,
  }],
  // Eligibility criteria fields
  eligibleBranches: [{
    type: String,
    trim: true,
  }],
  minimumCGPA: {
    type: Number,
    required: true,
    default: 7.0,
  },
  maxActiveBacklogs: {
    type: Number,
    default: 0,
  },
  maxHistoryOfBacklogs: {
    type: Number,
    default: 2,
  },
  eligibleGraduationYears: [{
    type: Number,
    default: [2026],
  }],
  tenthMinPercentage: {
    type: Number,
    default: 60,
  },
  twelfthMinPercentage: {
    type: Number,
    default: 60,
  },
  jobLocation: {
    type: String,
    default: 'Bangalore / Remote',
  },
  salaryPackage: {
    ctc: { type: Number, required: true }, // in LPA, e.g. 12.5
    stipend: { type: Number, default: 45000 }, // per month
    currency: { type: String, default: 'INR' },
    breakupText: { type: String, default: 'Base: 9.5 LPA + Performance Bonus: 3 LPA' },
  },
  employmentType: {
    type: String,
    enum: ['Full-Time', 'Internship', 'Internship + PPO'],
    default: 'Full-Time',
  },
  applicationDeadline: {
    type: Date,
    required: true,
  },
  selectionRounds: [
    {
      roundNumber: Number,
      roundName: String,
      description: String,
    }
  ],
  status: {
    type: String,
    enum: ['pending_review', 'published', 'closed', 'draft'],
    default: 'published',
  },
  approvedByAdmin: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
