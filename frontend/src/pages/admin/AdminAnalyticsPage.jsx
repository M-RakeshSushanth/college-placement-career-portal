import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  IndianRupee,
  Cpu,
  GraduationCap
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/overview')
      .then((res) => {
        if (res.data?.data) setData(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const summary = data?.summary;

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Generating analytics & statistical charts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Institutional Placement Analytics & Reporting
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Comprehensive intelligence on campus recruitment drives, department outcomes, package distributions, and industry skill demand.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Placement Rate</span>
          <p className="mt-1 text-3xl font-black text-emerald-600">{summary?.placementRate}%</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{summary?.placedStudents} of {summary?.totalStudents} students placed</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Highest Salary CTC</span>
          <p className="mt-1 text-3xl font-black text-blue-600">{summary?.highestCTC} LPA</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Campus 2026 Season Top Offer</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Average CTC</span>
          <p className="mt-1 text-3xl font-black text-indigo-600">{summary?.averageCTC} LPA</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Mean institutional package</p>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Active Recruiters</span>
          <p className="mt-1 text-3xl font-black text-purple-600">{summary?.totalCompanies}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Participating technology corporations</p>
        </div>
      </div>

      {/* Skills Demand & Department Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Demanded Skills */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" />
            Most In-Demand Technical Skills (From Recruiters)
          </h3>
          <p className="text-xs text-slate-500">
            Synthesized from company job specifications and required technologies.
          </p>

          <div className="space-y-3">
            {data?.topSkills?.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-800">{item.skill}</span>
                  <span className="text-blue-600 font-bold">{item.count} Openings</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${Math.min(100, Math.max(15, item.count * 35))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department-wise Placement Rates */}
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            Departmental Placement Ratios
          </h3>
          <p className="text-xs text-slate-500">
            Comparative performance across engineering departments.
          </p>

          <div className="space-y-4">
            {data?.departmentStats?.map((dept, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-900">{dept.department}</span>
                  <span className="font-extrabold text-emerald-700">{dept.percentage}% Placed</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${dept.percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Avg CGPA: {dept.avgCgpa}</span>
                  <span>{dept.placed} of {dept.total} candidates</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
