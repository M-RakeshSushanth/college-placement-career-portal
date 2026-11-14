import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users,
  Award,
  TrendingUp,
  BarChart3,
  IndianRupee,
  Megaphone,
  ChevronRight
} from 'lucide-react';

export default function AdminDashboard({ setCurrentTab }) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then((res) => {
        if (res.data?.data) {
          setAnalytics(res.data.data);
        }
      })
      .catch((err) => console.error('Failed to load admin analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  const summary = analytics?.summary;
  const funnel = analytics?.funnel;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-800 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-purple-950/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
            Placement Administration Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome, {user?.name || 'Administrator'}!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-purple-100/90 max-w-xl leading-relaxed">
            Oversee campus placement operations, monitor automated student eligibility rules across drives, verify student credentials, and analyze hiring trends.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCurrentTab('admin-announcements')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md"
          >
            <Megaphone className="w-4 h-4" />
            Broadcast Notice
          </button>
          <button
            onClick={() => setCurrentTab('admin-analytics')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-purple-900 text-xs font-bold hover:bg-purple-50 transition-all shadow-md"
          >
            <BarChart3 className="w-4 h-4 text-purple-700" />
            Full Analytics
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{summary?.totalStudents || 0}</p>
          <p className="text-[11px] text-slate-500 mt-1">Registered student batch</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Placement Rate</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">{summary?.placementRate || 0}%</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {summary?.placedStudents || 0} Placed &bull; {summary?.unplacedStudents || 0} In Progress
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Drives</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{summary?.activeJobs || 0}</p>
          <p className="text-[11px] text-purple-600 font-medium mt-1">
            Across {summary?.totalCompanies || 0} corporate recruiters
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Salary CTC</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-xl font-extrabold text-slate-900">
            {summary?.highestCTC || 0} <span className="text-xs font-semibold text-slate-500">LPA (Peak)</span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Avg: <strong className="text-slate-800">{summary?.averageCTC || 0} LPA</strong>
          </p>
        </div>
      </div>

      {/* Recruitment Funnel & Department Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funnel */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            Recruitment Funnel Progress
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Applications Received', count: funnel?.applied || 0, color: 'bg-blue-500' },
              { label: 'Under Review', count: funnel?.underReview || 0, color: 'bg-indigo-500' },
              { label: 'Shortlisted for Test', count: funnel?.shortlisted || 0, color: 'bg-purple-500' },
              { label: 'Interview Scheduled', count: funnel?.interview || 0, color: 'bg-amber-500' },
              { label: 'Final Offers Made', count: funnel?.selected || 0, color: 'bg-emerald-500' },
            ].map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{step.label}</span>
                  <span className="text-slate-900 font-bold">{step.count} candidates</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${step.color} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${Math.min(100, Math.max(8, (step.count / (summary?.totalStudents || 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Placement Breakdown */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            Department Placement Statistics
          </h3>

          <div className="space-y-3">
            {analytics?.departmentStats?.map((dept, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{dept.department}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Avg CGPA: {dept.avgCgpa} &bull; Total: {dept.total} Students
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 text-sm">
                    {dept.percentage}%
                  </span>
                  <p className="text-[10px] text-slate-400">
                    {dept.placed}/{dept.total} Placed
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
