const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./src/config/db');
const { initSocket } = require('./src/config/socket');
const { seedInitialData } = require('./src/utils/seedData');

// Route imports
const authRoutes = require('./src/modules/auth/auth.routes');
const studentsRoutes = require('./src/modules/students/students.routes');
const recruitersRoutes = require('./src/modules/recruiters/recruiters.routes');
const jobsRoutes = require('./src/modules/jobs/jobs.routes');
const eligibilityRoutes = require('./src/modules/eligibility/eligibility.routes');
const applicationsRoutes = require('./src/modules/applications/applications.routes');
const notificationsRoutes = require('./src/modules/notifications/notifications.routes');
const alumniRoutes = require('./src/modules/alumni/alumni.routes');
const analyticsRoutes = require('./src/modules/analytics/analytics.routes');
const aiRoutes = require('./src/modules/ai/ai.routes');

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
initSocket(io);

// Core Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Campus Placement & Career Management Backend',
    timestamp: new Date().toISOString(),
  });
});

// API Modules Routing
app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/recruiters', recruitersRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    await seedInitialData();

    server.listen(PORT, () => {
      console.log(`===================================================`);
      console.log(` Campus Placement Backend Server is running!`);
      console.log(` Local URL: http://localhost:${PORT}`);
      console.log(` Real-time Socket.IO connected & ready`);
      console.log(`===================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
