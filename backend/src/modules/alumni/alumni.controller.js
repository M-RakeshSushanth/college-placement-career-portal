const AlumniFeedback = require('./AlumniFeedback.model');

const getAllAlumniFeedback = async (req, res) => {
  try {
    const { company, role, department, search } = req.query;
    const filter = { isApprovedByAdmin: true };

    if (company) filter.currentCompany = { $regex: company, $options: 'i' };
    if (role) filter.role = { $regex: role, $options: 'i' };
    if (department) filter.department = department;

    if (search) {
      filter.$or = [
        { currentCompany: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { interviewProcess: { $regex: search, $options: 'i' } },
        { preparationTips: { $regex: search, $options: 'i' } },
        { skillsRecommended: { $regex: search, $options: 'i' } },
      ];
    }

    const feedbacks = await AlumniFeedback.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: feedbacks.length, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAlumniFeedback = async (req, res) => {
  try {
    const feedback = new AlumniFeedback({
      ...req.body,
      author: req.user ? req.user.id : null,
      authorName: req.body.authorName || (req.user ? req.user.name : 'Alumni Graduate'),
      isApprovedByAdmin: true, // auto approved or can be reviewed by admin
    });

    await feedback.save();
    res.status(201).json({ success: true, message: 'Alumni interview experience shared successfully', feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upvoteAlumniFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await AlumniFeedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }

    const userIdStr = req.user.id.toString();
    const existingIndex = feedback.upvotes.findIndex(u => u.toString() === userIdStr);

    if (existingIndex > -1) {
      feedback.upvotes.splice(existingIndex, 1);
    } else {
      feedback.upvotes.push(req.user.id);
    }

    await feedback.save();
    res.json({ success: true, upvotesCount: feedback.upvotes.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAlumniFeedbackAdmin = async (req, res) => {
  try {
    await AlumniFeedback.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Feedback removed successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAllAlumniFeedback,
  createAlumniFeedback,
  upvoteAlumniFeedback,
  deleteAlumniFeedbackAdmin,
};
