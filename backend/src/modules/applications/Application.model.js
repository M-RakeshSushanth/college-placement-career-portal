const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true,
  },
  resume: {
    title: String,
    filePath: String,
    originalName: String,
  },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected'],
    default: 'Applied',
  },
  stageHistory: [
    {
      stage: {
        type: String,
        enum: ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected', 'Rejected'],
      },
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      notes: String,
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  interviewDetails: {
    roundName: String,
    scheduledAt: Date,
    meetingLink: String,
    interviewerNotes: String,
    feedbackScore: Number,
  },
  atsScoreReport: {
    overallScore: Number,
    skillsScore: Number,
    experienceScore: Number,
    matchingSkills: [String],
    missingSkills: [String],
    summary: String,
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Prevent duplicate applications by the same student for the same job
applicationSchema.index({ job: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
