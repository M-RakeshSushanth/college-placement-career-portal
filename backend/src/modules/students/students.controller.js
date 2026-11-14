const StudentProfile = require('./StudentProfile.model');
const User = require('../auth/User.model');
const fs = require('fs');
const path = require('path');

const getMyProfile = async (req, res) => {
  try {
    let profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email role');
    if (!profile) {
      profile = await StudentProfile.create({
        user: req.user.id,
        registrationNumber: `REG-${Date.now().toString().slice(-6)}`,
        department: 'Computer Science & Engineering',
        graduationYear: 2026,
        cgpa: 8.0,
      });
      profile = await StudentProfile.findById(profile._id).populate('user', 'name email role');
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.user; // Don't allow changing ownership
    delete updateData.resumes; // Handled separately via upload endpoints

    const profile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    ).populate('user', 'name email role');

    // Also update User name if provided
    if (req.body.name) {
      await User.findByIdAndUpdate(req.user.id, { name: req.body.name });
    }

    res.json({ success: true, message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No resume file uploaded.' });
    }

    const { title, isPrimary } = req.body;
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const newResume = {
      title: title || req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      isPrimary: isPrimary === 'true' || profile.resumes.length === 0,
      uploadedAt: new Date(),
    };

    if (newResume.isPrimary) {
      profile.resumes.forEach(r => { r.isPrimary = false; });
    }

    profile.resumes.push(newResume);
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      resumes: profile.resumes,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const resumeIndex = profile.resumes.findIndex(r => r._id.toString() === resumeId);
    if (resumeIndex === -1) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    const wasPrimary = profile.resumes[resumeIndex].isPrimary;
    profile.resumes.splice(resumeIndex, 1);

    if (wasPrimary && profile.resumes.length > 0) {
      profile.resumes[0].isPrimary = true;
    }

    await profile.save();
    res.json({ success: true, message: 'Resume deleted successfully', resumes: profile.resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const setPrimaryResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const profile = await StudentProfile.findOne({ user: req.user.id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found.' });
    }

    let found = false;
    profile.resumes.forEach(r => {
      if (r._id.toString() === resumeId) {
        r.isPrimary = true;
        found = true;
      } else {
        r.isPrimary = false;
      }
    });

    if (!found) {
      return res.status(404).json({ success: false, message: 'Resume not found.' });
    }

    await profile.save();
    res.json({ success: true, message: 'Primary resume updated', resumes: profile.resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin endpoints
const getAllStudentsAdmin = async (req, res) => {
  try {
    const { department, graduationYear, placementStatus, search } = req.query;
    const filter = {};
    if (department) filter.department = department;
    if (graduationYear) filter.graduationYear = Number(graduationYear);
    if (placementStatus) filter.placementStatus = placementStatus;

    let students = await StudentProfile.find(filter)
      .populate('user', 'name email status createdAt')
      .sort({ cgpa: -1 });

    if (search) {
      const q = search.toLowerCase();
      students = students.filter(s =>
        (s.user && s.user.name.toLowerCase().includes(q)) ||
        (s.user && s.user.email.toLowerCase().includes(q)) ||
        s.registrationNumber.toLowerCase().includes(q)
      );
    }

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyStudentAdmin = async (req, res) => {
  try {
    const { studentProfileId } = req.params;
    const { isProfileVerified } = req.body;

    const profile = await StudentProfile.findByIdAndUpdate(
      studentProfileId,
      { isProfileVerified },
      { new: true }
    ).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    res.json({ success: true, message: 'Student verification status updated', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  uploadResume,
  deleteResume,
  setPrimaryResume,
  getAllStudentsAdmin,
  verifyStudentAdmin,
};
