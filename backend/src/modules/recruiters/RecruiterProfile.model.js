const mongoose = require('mongoose');

const recruiterProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  companyWebsite: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    default: 'Information Technology',
  },
  companyDescription: {
    type: String,
  },
  headquarters: {
    type: String,
    default: 'Bangalore, India',
  },
  designation: {
    type: String,
    default: 'Talent Acquisition Lead',
  },
  phone: {
    type: String,
  },
  isVerifiedByAdmin: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('RecruiterProfile', recruiterProfileSchema);
