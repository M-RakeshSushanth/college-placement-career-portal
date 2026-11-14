const jwt = require('jsonwebtoken');
const User = require('./User.model');
const StudentProfile = require('../students/StudentProfile.model');
const RecruiterProfile = require('../recruiters/RecruiterProfile.model');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, ...profileData } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = new User({
      name,
      email,
      password,
      role,
      isVerified: role === 'admin' ? true : false,
    });
    await user.save();

    // Create role-specific profile
    if (role === 'student') {
      await StudentProfile.create({
        user: user._id,
        registrationNumber: profileData.registrationNumber || `REG-${Date.now().toString().slice(-6)}`,
        department: profileData.department || 'Computer Science & Engineering',
        graduationYear: profileData.graduationYear || 2026,
        cgpa: profileData.cgpa || 8.0,
        activeBacklogs: profileData.activeBacklogs || 0,
        technicalSkills: profileData.technicalSkills || ['JavaScript', 'React', 'Node.js', 'Python'],
      });
    } else if (role === 'recruiter') {
      await RecruiterProfile.create({
        user: user._id,
        companyName: profileData.companyName || 'Tech Innovations Ltd',
        companyWebsite: profileData.companyWebsite || 'https://example.com',
        industry: profileData.industry || 'Software & Technology',
        designation: profileData.designation || 'Technical Hiring Manager',
      });
    }

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken(user);

    // Retrieve specific profile
    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    let profile = null;
    if (user.role === 'student') {
      profile = await StudentProfile.findOne({ user: user._id });
    } else if (user.role === 'recruiter') {
      profile = await RecruiterProfile.findOne({ user: user._id });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        profile,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
