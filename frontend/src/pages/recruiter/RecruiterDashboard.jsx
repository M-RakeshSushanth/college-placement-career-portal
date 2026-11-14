import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  Award,
  Calendar,
  PlusCircle,
  TrendingUp,
  FileCheck2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export default function RecruiterDashboard({ setCurrentTab, setSelectedJobForReview }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/recruiter/my-jobs')
      .then((res) => {
        if (res.data?.jobs) setJobs(res.data.jobs);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-blue-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
            Recruiter Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-blue-100/90 max-w-xl leading-relaxed">
            Manage your campus recruitment pipeline, publish job openings with automated academic filtering, inspect candidates' ATS scores, and schedule interviews.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('post-job')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-800 text-xs font-bold hover:bg-blue-50 transition-all shadow-md whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4 text-blue-600" />
          Publish New Opening
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Openings</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{jobs.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Published placement drives</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Automated Eligibility</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">Active</p>
          <p className="text-[11px] text-slate-500 mt-1">Filtering by CGPA, branch, and backlogs</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recruitment Status</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">Campus 2026</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">Institutional Drive in Progress</p>
        </div>
      </div>

      {/* Posted Openings List */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-blue-600" />
            Your Published Placement Opportunities
          </h3>
          <button
            onClick={() => setCurrentTab('manage-jobs')}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Manage All
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading openings...</div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No placement opportunities posted yet. Click "Publish New Opening" to get started!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Package: <strong className="text-slate-800">{job.salaryPackage?.ctc} LPA</strong> &bull; Location: {job.jobLocation} &bull; Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {job.eligibleBranches?.map((b, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px]">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedJobForReview(job);
                    setCurrentTab('applicant-review');
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5" />
                  Review Candidates
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
