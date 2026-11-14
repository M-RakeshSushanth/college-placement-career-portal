const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Job = require('../jobs/Job.model');
const StudentProfile = require('../students/StudentProfile.model');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

const analyzeResumeForJob = async (req, res) => {
  try {
    const { jobId, resumeId, resumeText } = req.body;

    let jobTitle = 'Software Engineer';
    let jobDescription = 'Full Stack Development, Algorithms, System Design';
    let requiredSkills = ['JavaScript', 'React', 'Node.js', 'MongoDB'];

    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        jobTitle = job.title;
        jobDescription = job.description;
        requiredSkills = job.requiredSkills;
      }
    }

    // Check if file uploaded directly
    if (req.file) {
      const form = new FormData();
      form.append('resume', fs.createReadStream(req.file.path), req.file.originalname);
      form.append('job_title', jobTitle);
      form.append('job_description', jobDescription);
      form.append('required_skills', JSON.stringify(requiredSkills));

      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ats/analyze-file`, form, {
        headers: form.getHeaders(),
        timeout: 45000,
      });

      return res.json({ success: true, ...aiResponse.data });
    }

    // If existing resumeId from student profile
    if (resumeId) {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      if (profile && profile.resumes) {
        const resume = profile.resumes.find(r => r._id.toString() === resumeId);
        if (resume && resume.filePath) {
          const absolutePath = path.join(__dirname, '../../..', resume.filePath);
          if (fs.existsSync(absolutePath)) {
            const form = new FormData();
            form.append('resume', fs.createReadStream(absolutePath), resume.originalName);
            form.append('job_title', jobTitle);
            form.append('job_description', jobDescription);
            form.append('required_skills', JSON.stringify(requiredSkills));

            const aiResponse = await axios.post(`${AI_SERVICE_URL}/ats/analyze-file`, form, {
              headers: form.getHeaders(),
              timeout: 45000,
            });

            return res.json({ success: true, ...aiResponse.data });
          }
        }
      }
    }

    // If resumeText or constructed from student profile
    let textToAnalyze = resumeText;
    if (!textToAnalyze && req.user) {
      const profile = await StudentProfile.findOne({ user: req.user.id }).populate('user', 'name email');
      if (profile) {
        textToAnalyze = `
Candidate Name: ${profile.user?.name || ''}
Department: ${profile.department} | CGPA: ${profile.cgpa} | Graduation: ${profile.graduationYear}
Technical Skills: ${profile.technicalSkills?.join(', ')}
Projects: ${profile.projects?.map(p => `${p.title}: ${p.description} (Tech: ${p.technologies?.join(', ')})`).join('\n')}
Internships: ${profile.internships?.map(i => `${i.role} at ${i.company}: ${i.description}`).join('\n')}
Certifications: ${profile.certifications?.map(c => `${c.title} by ${c.issuer}`).join('\n')}
Achievements: ${profile.achievements?.join(', ')}
        `.trim();
      }
    }

    if (!textToAnalyze) {
      return res.status(400).json({ success: false, message: 'Please provide resume text or upload a resume file.' });
    }

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ats/analyze`, {
      resume_text: textToAnalyze,
      job_title: jobTitle,
      job_description: jobDescription,
      required_skills: requiredSkills,
    }, { timeout: 45000 });

    res.json({ success: true, ...aiResponse.data });
  } catch (error) {
    console.error('AI ATS analysis error:', error.message);
    res.status(500).json({ success: false, message: 'AI processing failed: ' + (error.response?.data?.detail || error.message) });
  }
};

const improveResume = async (req, res) => {
  try {
    const { jobId, resumeText } = req.body;

    let jobTitle = 'Software Engineer';
    let jobDescription = 'Frontend, Backend, Database optimization, Problem solving';

    if (jobId) {
      const job = await Job.findById(jobId);
      if (job) {
        jobTitle = job.title;
        jobDescription = job.description;
      }
    }

    let textToImprove = resumeText;
    if (!textToImprove && req.user) {
      const profile = await StudentProfile.findOne({ user: req.user.id });
      if (profile) {
        textToImprove = `
Skills: ${profile.technicalSkills?.join(', ')}
Projects: ${profile.projects?.map(p => `${p.title}: ${p.description}`).join('; ')}
Experience: ${profile.internships?.map(i => `${i.role} at ${i.company}: ${i.description}`).join('; ')}
        `;
      }
    }

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/resume/improve`, {
      resume_text: textToImprove || 'General Software Engineering Student with Web Development projects',
      job_title: jobTitle,
      job_description: jobDescription,
    }, { timeout: 45000 });

    res.json({ success: true, ...aiResponse.data });
  } catch (error) {
    console.error('AI Resume Improve error:', error.message);
    res.status(500).json({ success: false, message: 'AI processing failed: ' + (error.response?.data?.detail || error.message) });
  }
};

const generateMockQuestions = async (req, res) => {
  try {
    const { role, technology, experienceLevel, count } = req.body;
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/mock-interview/generate-questions`, {
      role: role || 'Software Developer',
      technology: technology || '',
      experience_level: experienceLevel || 'Entry Level / Fresher',
      count: count || 4,
    }, { timeout: 35000 });

    res.json({ success: true, ...aiResponse.data });
  } catch (error) {
    console.error('Mock questions error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const evaluateMockAnswer = async (req, res) => {
  try {
    const { question, studentAnswer, expectedTopics, role } = req.body;
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/mock-interview/evaluate-answer`, {
      question,
      student_answer: studentAnswer,
      expected_topics: expectedTopics || [],
      role: role || '',
    }, { timeout: 35000 });

    res.json({ success: true, ...aiResponse.data });
  } catch (error) {
    console.error('Evaluate answer error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  analyzeResumeForJob,
  improveResume,
  generateMockQuestions,
  evaluateMockAnswer,
};
