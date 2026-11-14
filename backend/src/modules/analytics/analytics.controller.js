const StudentProfile = require('../students/StudentProfile.model');
const Job = require('../jobs/Job.model');
const Application = require('../applications/Application.model');
const RecruiterProfile = require('../recruiters/RecruiterProfile.model');
const User = require('../auth/User.model');

const getPlacementAnalytics = async (req, res) => {
  try {
    const totalStudents = await StudentProfile.countDocuments();
    const placedStudents = await StudentProfile.countDocuments({ placementStatus: 'placed' });
    const unplacedStudents = totalStudents - placedStudents;
    const placementRate = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'published' });
    const totalCompanies = await RecruiterProfile.countDocuments();
    const totalApplications = await Application.countDocuments();

    // Applications status funnel
    const applicationStatusCounts = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const funnel = {
      applied: 0,
      underReview: 0,
      shortlisted: 0,
      assessment: 0,
      interview: 0,
      selected: 0,
      rejected: 0,
    };
    applicationStatusCounts.forEach(item => {
      const key = item._id ? item._id.toLowerCase().replace(/\s+/g, '') : '';
      if (key === 'applied') funnel.applied = item.count;
      else if (key === 'underreview') funnel.underReview = item.count;
      else if (key === 'shortlisted') funnel.shortlisted = item.count;
      else if (key === 'assessment') funnel.assessment = item.count;
      else if (key === 'interview') funnel.interview = item.count;
      else if (key === 'selected') funnel.selected = item.count;
      else if (key === 'rejected') funnel.rejected = item.count;
    });

    // Department-wise stats
    const departmentStats = await StudentProfile.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          placed: {
            $sum: {
              $cond: [{ $eq: ['$placementStatus', 'placed'] }, 1, 0]
            }
          },
          avgCgpa: { $avg: '$cgpa' },
        }
      },
      {
        $project: {
          department: '$_id',
          total: 1,
          placed: 1,
          avgCgpa: { $round: ['$avgCgpa', 2] },
          percentage: {
            $cond: [
              { $gt: ['$total', 0] },
              { $round: [{ $multiply: [{ $divide: ['$placed', '$total'] }, 100] }, 1] },
              0
            ]
          }
        }
      }
    ]);

    // Salary packages metrics (from jobs and offers)
    const salaryMetrics = await Job.aggregate([
      {
        $group: {
          _id: null,
          highestCTC: { $max: '$salaryPackage.ctc' },
          lowestCTC: { $min: '$salaryPackage.ctc' },
          averageCTC: { $avg: '$salaryPackage.ctc' },
        }
      }
    ]);

    const highestCTC = salaryMetrics.length > 0 ? (salaryMetrics[0].highestCTC || 0) : 0;
    const averageCTC = salaryMetrics.length > 0 ? Math.round((salaryMetrics[0].averageCTC || 0) * 10) / 10 : 0;

    // Top in-demand technical skills from Job openings
    const topSkillsAgg = await Job.aggregate([
      { $unwind: '$requiredSkills' },
      { $group: { _id: { $toLower: '$requiredSkills' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const topSkills = topSkillsAgg.map(s => ({
      skill: s._id.charAt(0).toUpperCase() + s._id.slice(1),
      count: s.count,
    }));

    // Top Recruiting Companies
    const topCompanies = await Job.aggregate([
      {
        $group: {
          _id: '$companyName',
          openingsCount: { $sum: 1 },
          maxPackage: { $max: '$salaryPackage.ctc' },
        }
      },
      { $sort: { openingsCount: -1 } },
      { $limit: 6 }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalStudents,
          placedStudents,
          unplacedStudents,
          placementRate,
          totalJobs,
          activeJobs,
          totalCompanies,
          totalApplications,
          highestCTC,
          averageCTC,
        },
        funnel,
        departmentStats,
        topSkills,
        topCompanies,
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPlacementAnalytics,
};
