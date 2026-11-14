const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  registrationNumber: {
    type: String,
    required: true,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  academicYear: {
    type: String,
    default: '2022-2026',
  },
  graduationYear: {
    type: Number,
    required: true,
    default: 2026,
  },
  currentSemester: {
    type: Number,
    default: 7,
  },
  cgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10,
    default: 8.0,
  },
  tenthPercentage: {
    type: Number,
    default: 85,
  },
  twelfthPercentage: {
    type: Number,
    default: 85,
  },
  activeBacklogs: {
    type: Number,
    default: 0,
  },
  historyOfBacklogs: {
    type: Number,
    default: 0,
  },
  semesterGrades: [
    {
      semester: Number,
      sgpa: Number,
      backlogs: { type: Number, default: 0 },
    }
  ],
  technicalSkills: [{
    type: String,
    trim: true,
  }],
  certifications: [
    {
      title: String,
      issuer: String,
      issueDate: String,
      credentialUrl: String,
    }
  ],
  projects: [
    {
      title: String,
      description: String,
      technologies: [String],
      githubUrl: String,
      liveUrl: String,
    }
  ],
  internships: [
    {
      company: String,
      role: String,
      duration: String,
      description: String,
    }
  ],
  achievements: [String],
  resumes: [
    {
      title: String,
      filePath: String,
      originalName: String,
      isPrimary: { type: Boolean, default: false },
      uploadedAt: { type: Date, default: Date.now },
      parsedTextSnippet: String,
    }
  ],
  phone: String,
  linkedin: String,
  github: String,
  isProfileVerified: {
    type: Boolean,
    default: false,
  },
  placementStatus: {
    type: String,
    enum: ['unplaced', 'placed', 'opted_out'],
    default: 'unplaced',
  },
  placedOffers: [
    {
      company: String,
      role: String,
      packageCTC: Number, // in LPA
      date: { type: Date, default: Date.now },
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
