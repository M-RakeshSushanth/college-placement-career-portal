import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  CheckCircle2,
  FileCheck2,
  Sparkles,
  TrendingUp,
  Clock,
  ArrowRight,
  Video,
  Award,
  ChevronRight,
  FileText
} from 'lucide-react';

export default function StudentDashboard({ setCurrentTab }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [profRes, jobsRes, appsRes] = await Promise.all([
          api.get('/students/profile'),
          api.get('/jobs'),
          api.get('/applications/my-applications'),
        ]);
        if (profRes.data?.profile) setProfile(profRes.data.profile);
        if (jobsRes.data?.jobs) setJobs(jobsRes.data.jobs);
        if (appsRes.data?.applications) setApplications(appsRes.data.applications);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const eligibleJobsCount = jobs.filter((j) => j.isEligible).length;
  const shortlistedCount = applications.filter((a) => ['Shortlisted', 'Assessment', 'Interview', 'Selected'].includes(a.status)).length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            Batch of {profile?.graduationYear || 2026} Placement Drive
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Your profile is mapped with {profile?.department || 'Engineering'}. The system has automatically evaluated your academic criteria against active company openings.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentTab('jobs')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-800 text-xs font-bold hover:bg-blue-50 transition-all shadow-md"
            >
              <Briefcase className="w-4 h-4" />
              Explore Eligible Openings ({eligibleJobsCount})
            </button>
            <button
              onClick={() => setCurrentTab('ats')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/60 border border-blue-400/40 text-white text-xs font-semibold hover:bg-blue-600/80 transition-all backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-blue-300" />
              AI Resume Matcher
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Eligible Drives</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{eligibleJobsCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
            <span>Filtered by academic rules</span>
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Applications</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{applications.length}</p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            Active in recruitment lifecycle
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{shortlistedCount}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            Advanced to interview rounds
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement Status</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-extrabold capitalize text-slate-900">
            {profile?.placementStatus === 'placed' ? '🎉 Placed' : 'In Progress'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-1">
            CGPA: {profile?.cgpa || '8.0'} | Backlogs: {profile?.activeBacklogs || 0}
          </p>
        </div>
      </div>

      {/* AI Assistance Quick Launch Grid */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
          AI Career Assistance Engine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => setCurrentTab('ats')}
            className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors flex items-center justify-between">
              ATS Resume Matcher
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              LangChain & FAISS vector search compares your resume against company job descriptions to generate match scores & skill gaps.
            </p>
          </div>

          <div
            onClick={() => setCurrentTab('improver')}
            className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors flex items-center justify-between">
              Job Resume Tailoring
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Generate impactful, quantified bullet points and role summaries customized to employer expectations without fabricating facts.
            </p>
          </div>

          <div
            onClick={() => setCurrentTab('mock')}
            className="group cursor-pointer rounded-2xl bg-white p-5 border border-slate-200/80 hover:border-purple-400 hover:shadow-md transition-all relative overflow-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Video className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors flex items-center justify-between">
              AI Mock Interview Practice
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h4>
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              Practice role-specific technical & HR questions with instant AI scoring on correctness, clarity, and model solutions.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Openings & Application Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Openings */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              Latest Campus Drives
            </h3>
            <button
              onClick={() => setCurrentTab('jobs')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job._id}
                onClick={() => setCurrentTab('jobs')}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-slate-50/70 transition-all cursor-pointer flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{job.title}</h4>
                  <p className="text-[11px] text-slate-500">{job.companyName} &bull; {job.salaryPackage?.ctc} LPA</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      job.isEligible ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {job.isEligible ? 'Eligible' : 'Not Eligible'}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Tracker Snippet */}
        <div className="rounded-2xl bg-white p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              My Application Tracker
            </h3>
            <button
              onClick={() => setCurrentTab('applications')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              View All
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              You haven't submitted any applications yet. Browse the placement drives to apply!
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 3).map((app) => (
                <div
                  key={app._id}
                  onClick={() => setCurrentTab('applications')}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{app.job?.title || 'Job Opening'}</h4>
                    <p className="text-[11px] text-slate-500">{app.job?.companyName}</p>
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
