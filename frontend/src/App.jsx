import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/auth/AuthPage';
import Navbar from './components/Navbar';
import Toast from './components/Toast';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import JobBrowsePage from './pages/student/JobBrowsePage';
import StudentProfilePage from './pages/student/StudentProfilePage';
import ATSAnalyzerPage from './pages/student/ATSAnalyzerPage';
import ResumeImproverPage from './pages/student/ResumeImproverPage';
import MockInterviewPage from './pages/student/MockInterviewPage';
import StudentApplicationsPage from './pages/student/StudentApplicationsPage';
import AlumniGuidancePage from './pages/student/AlumniGuidancePage';

// Recruiter Pages
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import PostJobPage from './pages/recruiter/PostJobPage';
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage';
import ApplicantReviewPage from './pages/recruiter/ApplicantReviewPage';
import CompanyProfilePage from './pages/recruiter/CompanyProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminJobsPage from './pages/admin/AdminJobsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminAnnouncementsPage from './pages/admin/AdminAnnouncementsPage';

export default function App() {
  const { user, role, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedJobForATS, setSelectedJobForATS] = useState(null);
  const [selectedJobForReview, setSelectedJobForReview] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs font-semibold text-slate-400">Loading College Placement Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderContent = () => {
    // STUDENT VIEWS
    if (role === 'student') {
      switch (currentTab) {
        case 'dashboard':
          return <StudentDashboard setCurrentTab={setCurrentTab} />;
        case 'jobs':
          return <JobBrowsePage setCurrentTab={setCurrentTab} setSelectedJobForATS={setSelectedJobForATS} />;
        case 'profile':
          return <StudentProfilePage />;
        case 'ats':
          return <ATSAnalyzerPage selectedJobForATS={selectedJobForATS} />;
        case 'improver':
          return <ResumeImproverPage />;
        case 'mock':
          return <MockInterviewPage />;
        case 'applications':
          return <StudentApplicationsPage />;
        case 'alumni':
          return <AlumniGuidancePage />;
        default:
          return <StudentDashboard setCurrentTab={setCurrentTab} />;
      }
    }

    // RECRUITER VIEWS
    if (role === 'recruiter') {
      switch (currentTab) {
        case 'recruiter-dashboard':
          return <RecruiterDashboard setCurrentTab={setCurrentTab} setSelectedJobForReview={setSelectedJobForReview} />;
        case 'post-job':
          return <PostJobPage setCurrentTab={setCurrentTab} />;
        case 'manage-jobs':
          return <RecruiterJobsPage setCurrentTab={setCurrentTab} setSelectedJobForReview={setSelectedJobForReview} />;
        case 'applicant-review':
          return <ApplicantReviewPage selectedJobForReview={selectedJobForReview} />;
        case 'company-profile':
          return <CompanyProfilePage />;
        default:
          return <RecruiterDashboard setCurrentTab={setCurrentTab} setSelectedJobForReview={setSelectedJobForReview} />;
      }
    }

    // ADMIN VIEWS
    if (role === 'admin') {
      switch (currentTab) {
        case 'admin-dashboard':
          return <AdminDashboard setCurrentTab={setCurrentTab} />;
        case 'admin-students':
          return <AdminStudentsPage />;
        case 'admin-jobs':
          return <AdminJobsPage />;
        case 'admin-analytics':
          return <AdminAnalyticsPage />;
        case 'admin-announcements':
          return <AdminAnnouncementsPage />;
        default:
          return <AdminDashboard setCurrentTab={setCurrentTab} />;
      }
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      {/* Real-time Socket.IO Toast alerts */}
      <Toast />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; {new Date().getFullYear()} College Placement & Career Management Portal. Modular Monolith Architecture.
          </p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Socket.IO Real-Time Live
            </span>
            <span>&bull;</span>
            <span className="font-semibold text-blue-600">
              FastAPI AI Vector Engine
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
