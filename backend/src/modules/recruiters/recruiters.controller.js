const RecruiterProfile = require('./RecruiterProfile.model');
const User = require('../auth/User.model');

const getMyProfile = async (req, res) => {
  try {
    let profile = await RecruiterProfile.findOne({ user: req.user.id }).populate('user', 'name email');
    if (!profile) {
      profile = await RecruiterProfile.create({
        user: req.user.id,
        companyName: 'Company Name',
      });
      profile = await RecruiterProfile.findById(profile._id).populate('user', 'name email');
    }
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };
    delete updateData.user;
    delete updateData.isVerifiedByAdmin;

    const profile = await RecruiterProfile.findOneAndUpdate(
      { user: req.user.id },
      { $set: updateData },
      { new: true, upsert: true }
    ).populate('user', 'name email');

    if (req.body.name) {
      await User.findByIdAndUpdate(req.user.id, { name: req.body.name });
    }

    res.json({ success: true, message: 'Recruiter profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllRecruitersAdmin = async (req, res) => {
  try {
    const recruiters = await RecruiterProfile.find().populate('user', 'name email status createdAt');
    res.json({ success: true, count: recruiters.length, recruiters });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyRecruiterAdmin = async (req, res) => {
  try {
    const { recruiterProfileId } = req.params;
    const { isVerifiedByAdmin } = req.body;

    const profile = await RecruiterProfile.findByIdAndUpdate(
      recruiterProfileId,
      { isVerifiedByAdmin },
      { new: true }
    ).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Recruiter not found.' });
    }

    res.json({ success: true, message: 'Recruiter company verification updated', profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllRecruitersAdmin,
  verifyRecruiterAdmin,
};
