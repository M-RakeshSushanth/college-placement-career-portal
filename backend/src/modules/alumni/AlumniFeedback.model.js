const mongoose = require('mongoose');

const alumniFeedbackSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  authorName: {
    type: String,
    required: true,
  },
  graduationYear: {
    type: Number,
    required: true,
  },
  currentCompany: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  interviewProcess: {
    type: String,
    required: true,
  },
  technicalRoundsDescription: {
    type: String,
  },
  sampleQuestionsAsked: [String],
  preparationTips: {
    type: String,
    required: true,
  },
  skillsRecommended: [String],
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  isApprovedByAdmin: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('AlumniFeedback', alumniFeedbackSchema);
