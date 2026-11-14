const mongoose = require('mongoose');
const User = require('../modules/auth/User.model');
const StudentProfile = require('../modules/students/StudentProfile.model');
const RecruiterProfile = require('../modules/recruiters/RecruiterProfile.model');
const Job = require('../modules/jobs/Job.model');
const Application = require('../modules/applications/Application.model');
const AlumniFeedback = require('../modules/alumni/AlumniFeedback.model');
const Notification = require('../modules/notifications/Notification.model');

const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      // Data already seeded
      return;
    }

    console.log('[Seeder] Populating database with realistic campus placement demo data...');

    // 1. Create Placement Admin
    const adminUser = new User({
      name: 'Dr. Rajesh Sharma',
      email: 'admin@campus.edu',
      password: 'password123',
      role: 'admin',
      isVerified: true,
      status: 'active',
    });
    await adminUser.save();

    // 2. Create Recruiters
    const googleRecruiter = new User({
      name: 'Priya Iyer',
      email: 'recruiter@google.com',
      password: 'password123',
      role: 'recruiter',
      isVerified: true,
      status: 'active',
    });
    await googleRecruiter.save();

    await RecruiterProfile.create({
      user: googleRecruiter._id,
      companyName: 'Google',
      companyWebsite: 'https://careers.google.com',
      industry: 'Internet & Cloud Services',
      companyDescription: 'Global technology leader in search, cloud computing, and artificial intelligence.',
      headquarters: 'Mountain View, CA / Hyderabad, India',
      designation: 'University Talent Acquisition Specialist',
      phone: '+91 98765 43210',
      isVerifiedByAdmin: true,
    });

    const msRecruiter = new User({
      name: 'Vikram Malhotra',
      email: 'recruiter@microsoft.com',
      password: 'password123',
      role: 'recruiter',
      isVerified: true,
      status: 'active',
    });
    await msRecruiter.save();

    await RecruiterProfile.create({
      user: msRecruiter._id,
      companyName: 'Microsoft',
      companyWebsite: 'https://careers.microsoft.com',
      industry: 'Software & Cloud Infrastructure',
      companyDescription: 'Empowering every person and every organization on the planet to achieve more.',
      headquarters: 'Redmond, WA / Bangalore, India',
      designation: 'Campus Hiring Lead',
      phone: '+91 98765 43211',
      isVerifiedByAdmin: true,
    });

    // 3. Create Students
    const student1User = new User({
      name: 'Aditya Verma',
      email: 'student@campus.edu',
      password: 'password123',
      role: 'student',
      isVerified: true,
      status: 'active',
    });
    await student1User.save();

    const student1Profile = await StudentProfile.create({
      user: student1User._id,
      registrationNumber: 'CS20220412',
      department: 'Computer Science & Engineering',
      academicYear: '2022-2026',
      graduationYear: 2026,
      currentSemester: 7,
      cgpa: 8.85,
      tenthPercentage: 92.5,
      twelfthPercentage: 89.0,
      activeBacklogs: 0,
      historyOfBacklogs: 0,
      semesterGrades: [
        { semester: 1, sgpa: 8.6, backlogs: 0 },
        { semester: 2, sgpa: 8.7, backlogs: 0 },
        { semester: 3, sgpa: 8.9, backlogs: 0 },
        { semester: 4, sgpa: 9.0, backlogs: 0 },
        { semester: 5, sgpa: 8.8, backlogs: 0 },
        { semester: 6, sgpa: 9.1, backlogs: 0 },
      ],
      technicalSkills: ['React', 'Node.js', 'Python', 'FastAPI', 'MongoDB', 'Docker', 'Data Structures', 'Algorithms'],
      projects: [
        {
          title: 'Distributed File Storage Engine',
          description: 'Engineered a fault-tolerant decentralized storage service utilizing Raft consensus and chunks replication.',
          technologies: ['Go', 'gRPC', 'Docker'],
          githubUrl: 'https://github.com/aditya/distributed-store',
        },
        {
          title: 'Smart E-Commerce Microservices',
          description: 'Developed scalable backend service with JWT authentication, Stripe payments, and Kafka event streaming.',
          technologies: ['Node.js', 'Express', 'MongoDB', 'React'],
          githubUrl: 'https://github.com/aditya/ecommerce-microservices',
        }
      ],
      internships: [
        {
          company: 'Acme Software Labs',
          role: 'Backend Engineering Intern',
          duration: 'May 2025 - July 2025 (3 mos)',
          description: 'Optimized PostgreSQL queries reducing read latency by 35% and developed internal REST endpoints.',
        }
      ],
      certifications: [
        {
          title: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: 'Jan 2025',
          credentialUrl: 'https://aws.amazon.com/verify',
        }
      ],
      achievements: [
        'Finalist in Smart India Hackathon 2024',
        'Solved 450+ LeetCode problems (Knight badge)',
      ],
      phone: '+91 91234 56789',
      github: 'https://github.com/aditya',
      linkedin: 'https://linkedin.com/in/aditya-verma',
      isProfileVerified: true,
      placementStatus: 'unplaced',
    });

    const student2User = new User({
      name: 'Sneha Patel',
      email: 'sneha@campus.edu',
      password: 'password123',
      role: 'student',
      isVerified: true,
      status: 'active',
    });
    await student2User.save();

    await StudentProfile.create({
      user: student2User._id,
      registrationNumber: 'IT20220815',
      department: 'Information Technology',
      academicYear: '2022-2026',
      graduationYear: 2026,
      currentSemester: 7,
      cgpa: 7.4,
      tenthPercentage: 84.0,
      twelfthPercentage: 81.0,
      activeBacklogs: 1, // Has 1 active backlog for testing eligibility restrictions!
      historyOfBacklogs: 1,
      technicalSkills: ['Java', 'Spring Boot', 'MySQL', 'HTML', 'CSS', 'JavaScript'],
      phone: '+91 98888 77777',
      isProfileVerified: true,
      placementStatus: 'unplaced',
    });

    const student3User = new User({
      name: 'Rohan Gupta',
      email: 'rohan@campus.edu',
      password: 'password123',
      role: 'student',
      isVerified: true,
      status: 'active',
    });
    await student3User.save();

    await StudentProfile.create({
      user: student3User._id,
      registrationNumber: 'EC20220199',
      department: 'Electronics & Communication',
      academicYear: '2022-2026',
      graduationYear: 2026,
      currentSemester: 7,
      cgpa: 9.2,
      tenthPercentage: 95.0,
      twelfthPercentage: 94.0,
      activeBacklogs: 0,
      historyOfBacklogs: 0,
      technicalSkills: ['Python', 'Machine Learning', 'PyTorch', 'TensorFlow', 'C++', 'Embedded Systems'],
      phone: '+91 99999 11111',
      isProfileVerified: true,
      placementStatus: 'placed',
      placedOffers: [
        {
          company: 'Google',
          role: 'Associate Machine Learning Engineer',
          packageCTC: 28.5,
          date: new Date(),
        }
      ]
    });

    // 4. Create Jobs
    const job1 = new Job({
      recruiter: googleRecruiter._id,
      companyName: 'Google',
      title: 'Software Development Engineer - Campus 2026',
      description: 'Join Google engineering teams to build products and systems that serve billions of users across Search, Cloud, and Android. You will write high-performance code, design resilient distributed systems, and collaborate with cross-functional product leaders.',
      requiredSkills: ['Data Structures', 'Algorithms', 'Python', 'Java', 'C++', 'Distributed Systems'],
      eligibleBranches: ['Computer Science & Engineering', 'Information Technology'],
      minimumCGPA: 8.0,
      maxActiveBacklogs: 0,
      maxHistoryOfBacklogs: 1,
      eligibleGraduationYears: [2026],
      tenthMinPercentage: 70,
      twelfthMinPercentage: 70,
      jobLocation: 'Bangalore / Hyderabad / Remote',
      salaryPackage: {
        ctc: 24.5,
        stipend: 75000,
        currency: 'INR',
        breakupText: 'Base: 18 LPA + Stocks: 4.5 LPA + Performance: 2 LPA',
      },
      employmentType: 'Full-Time',
      applicationDeadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days ahead
      selectionRounds: [
        { roundNumber: 1, roundName: 'Online Coding Assessment', description: 'DSA & Algorithmic test on HackerRank' },
        { roundNumber: 2, roundName: 'Technical Interview I', description: 'Data structures & problem solving' },
        { roundNumber: 3, roundName: 'Technical Interview II & System Design', description: 'High-level architecture and concurrency' },
        { roundNumber: 4, roundName: 'Googliness & Leadership', description: 'Cultural alignment and behavioral assessment' },
      ],
      status: 'published',
      approvedByAdmin: true,
    });
    await job1.save();

    const job2 = new Job({
      recruiter: msRecruiter._id,
      companyName: 'Microsoft',
      title: 'Full Stack Cloud Engineer',
      description: 'Develop next-generation cloud services and modern web experiences on Azure. You will architect robust RESTful APIs, modern frontend interfaces, and containerized microservices.',
      requiredSkills: ['React', 'Node.js', 'TypeScript', 'Docker', 'MongoDB', 'REST API'],
      eligibleBranches: ['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication'],
      minimumCGPA: 7.5,
      maxActiveBacklogs: 0,
      maxHistoryOfBacklogs: 2,
      eligibleGraduationYears: [2026],
      tenthMinPercentage: 65,
      twelfthMinPercentage: 65,
      jobLocation: 'Bangalore / Noida',
      salaryPackage: {
        ctc: 21.0,
        stipend: 65000,
        currency: 'INR',
        breakupText: 'Base: 16 LPA + Retarget Bonus: 3 LPA + Benefits: 2 LPA',
      },
      employmentType: 'Full-Time',
      applicationDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      selectionRounds: [
        { roundNumber: 1, roundName: 'Online Technical Test', description: 'Full stack development & coding' },
        { roundNumber: 2, roundName: 'Technical Round 1', description: 'Frontend and React depth' },
        { roundNumber: 3, roundName: 'Technical Round 2', description: 'Cloud, APIs, and Databases' },
        { roundNumber: 4, roundName: 'Director Round', description: 'Behavioral and project discussions' },
      ],
      status: 'published',
      approvedByAdmin: true,
    });
    await job2.save();

    // 5. Create Sample Applications
    const app1 = new Application({
      job: job1._id,
      student: student1User._id,
      studentProfile: student1Profile._id,
      resume: {
        title: 'Aditya_Verma_Resume_2026.pdf',
        filePath: '/uploads/sample_resume.pdf',
        originalName: 'Aditya_Verma_Resume_2026.pdf',
      },
      status: 'Shortlisted',
      stageHistory: [
        { stage: 'Applied', updatedBy: student1User._id, notes: 'Application submitted', updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { stage: 'Under Review', updatedBy: googleRecruiter._id, notes: 'Profile matches minimum criteria', updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { stage: 'Shortlisted', updatedBy: googleRecruiter._id, notes: 'Shortlisted for Online Assessment', updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      ],
      atsScoreReport: {
        overallScore: 88,
        skillsScore: 92,
        experienceScore: 85,
        matchingSkills: ['Python', 'Data Structures', 'Algorithms', 'Docker'],
        missingSkills: ['C++', 'Distributed Systems'],
        summary: 'Strong algorithmic skills with proven full-stack and systems engineering projects.',
      },
      appliedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });
    await app1.save();

    // 6. Create Alumni Feedback
    await AlumniFeedback.create([
      {
        authorName: 'Kavita Nair',
        graduationYear: 2024,
        currentCompany: 'Google',
        role: 'Software Engineer III',
        department: 'Computer Science & Engineering',
        interviewProcess: 'The recruitment process had 1 online assessment and 4 rounds of virtual interviews. Round 1 focused heavily on binary trees and dynamic programming. Round 2 was graph algorithms. Round 3 was object-oriented system design, and Round 4 was Googliness.',
        technicalRoundsDescription: 'Make sure your fundamentals on Time & Space complexity analysis are razor sharp. Interviewers expect you to think out loud and explain trade-offs before typing code.',
        sampleQuestionsAsked: [
          'Design an LRU Cache with O(1) get and put operations.',
          'Find the median in a running stream of integers.',
          'Word ladder BFS with minimum transformations.',
          'How does DNS resolution and HTTP/3 handshake work under high latency?'
        ],
        preparationTips: 'Solve the top 100 LeetCode Mediums and practice writing clean code on Google Docs without syntax highlighting.',
        skillsRecommended: ['Data Structures', 'C++', 'System Design', 'Algorithms', 'Operating Systems'],
        upvotes: [student1User._id, student2User._id],
        isApprovedByAdmin: true,
      },
      {
        authorName: 'Arjun Nambiar',
        graduationYear: 2023,
        currentCompany: 'Microsoft',
        role: 'Software Development Engineer II',
        department: 'Information Technology',
        interviewProcess: '3 technical rounds and 1 managerial AA (As Appropriate) round. Emphasized clean code, unit test coverage, and edge cases.',
        technicalRoundsDescription: 'They tested React lifecycle, state management pitfalls, REST vs GraphQL tradeoffs, and relational schema normalization.',
        sampleQuestionsAsked: [
          'Explain debounce vs throttle and implement custom hooks in React.',
          'Design a distributed locking mechanism using Redis Redlock.',
          'How do you manage database schema migrations without service downtime?'
        ],
        preparationTips: 'Highlight real engineering problems solved in your college projects and know every line of code on your resume.',
        skillsRecommended: ['React', 'TypeScript', 'Node.js', 'Azure', 'System Design'],
        upvotes: [student1User._id],
        isApprovedByAdmin: true,
      }
    ]);

    // 7. Initial Notification
    await Notification.create({
      recipientRole: 'all',
      title: 'Welcome to Campus Placement Portal 2026',
      message: 'The Campus Placement & Career Management portal is live. Complete your profiles and explore upcoming recruitment drives.',
      type: 'system_announcement',
    });

    console.log('[Seeder] Initial placement data seeded successfully!');
    console.log('  Admin: admin@campus.edu / password123');
    console.log('  Recruiter: recruiter@google.com / password123');
    console.log('  Recruiter: recruiter@microsoft.com / password123');
    console.log('  Student: student@campus.edu / password123');
  } catch (err) {
    console.error('[Seeder] Error seeding data:', err);
  }
};

module.exports = { seedInitialData };
