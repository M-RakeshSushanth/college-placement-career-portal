import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Trash2,
  X,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Eligibility inspection modal state
  const [inspectingJob, setInspectingJob] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [loadingEligibility, setLoadingEligibility] = useState(false);
  const [activeTab, setActiveTab] = useState('eligible'); // 'eligible' or 'ineligible'

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/admin/all');
      if (res.data?.jobs) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load admin jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectEligibility = async (job) => {
    setInspectingJob(job);
    setEligibilityData(null);
    setLoadingEligibility(true);
    setActiveTab('eligible');

    try {
      const res = await api.get(`/eligibility/job/${job._id}/students`);
      if (res.data?.data) {
        setEligibilityData(res.data.data);
      }
    } catch (err) {
      alert('Failed to calculate eligibility for this drive');
    } finally {
      setLoadingEligibility(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to remove this job opportunity?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Placement Drives & Automated Eligibility Verification
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Inspect automated student filtering criteria across corporate drives. View exactly which students qualify or get excluded, and review reasons for ineligibility.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading drives...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                    {job.companyName}
                  </span>
                  <button
                    onClick={() => handleDeleteJob(job._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Package: <strong className="text-slate-800">{job.salaryPackage?.ctc} LPA</strong> &bull; {job.jobLocation}
                </p>

                {/* Eligibility rules summary */}
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Min CGPA:</span>
                    <span className="font-bold text-blue-600">&ge; {job.minimumCGPA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Max Active Backlogs:</span>
                    <span className="font-semibold">{job.maxActiveBacklogs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Branches:</span>
                    <span className="font-semibold text-slate-700 text-right truncate max-w-[140px]">
                      {job.eligibleBranches?.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleInspectEligibility(job)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Inspect Eligible Student Pool
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Eligibility Inspection Breakdown Modal */}
      {inspectingJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setInspectingJob(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                  Automated Eligibility Audit
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {inspectingJob.title} &bull; {inspectingJob.companyName}
                </h3>
              </div>
              <button
                onClick={() => setInspectingJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingEligibility ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Evaluating student profiles against eligibility rules...
              </div>
            ) : eligibilityData ? (
              <div className="space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Students</span>
                    <span className="text-xl font-black text-slate-900">{eligibilityData.totalStudents}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">Eligible Pool</span>
                    <span className="text-xl font-black text-emerald-600">{eligibilityData.eligibleCount}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100">
                    <span className="text-[10px] font-bold text-rose-700 uppercase block">Excluded / Ineligible</span>
                    <span className="text-xl font-black text-rose-600">{eligibilityData.ineligibleCount}</span>
                  </div>
                </div>

                {/* Switch between eligible and ineligible */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab('eligible')}
                    className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                      activeTab === 'eligible'
                        ? 'border-emerald-600 text-emerald-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Eligible Candidates ({eligibilityData.eligibleCount})
                  </button>
                  <button
                    onClick={() => setActiveTab('ineligible')}
                    className={`pb-2.5 px-4 text-xs font-bold border-b-2 transition-colors ${
                      activeTab === 'ineligible'
                        ? 'border-rose-600 text-rose-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Ineligible Candidates ({eligibilityData.ineligibleCount})
                  </button>
                </div>

                {/* Candidate List */}
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {activeTab === 'eligible' ? (
                    eligibilityData.eligibleStudents?.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">No eligible students found.</p>
                    ) : (
                      eligibilityData.eligibleStudents.map((st, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">{st.name}</span>
                            <span className="text-slate-500 text-[11px]">{st.registrationNumber} &bull; {st.department}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-700">CGPA: {st.cgpa}</span>
                            <span className="text-[10px] text-slate-400 block">0 Backlogs</span>
                          </div>
                        </div>
                      ))
                    )
                  ) : (
                    eligibilityData.ineligibleStudents?.length === 0 ? (
                      <p className="p-4 text-center text-xs text-slate-400">All students are eligible!</p>
                    ) : (
                      eligibilityData.ineligibleStudents.map((st, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{st.name} ({st.registrationNumber})</span>
                            <span className="text-[11px] text-rose-700 font-semibold">CGPA: {st.cgpa}</span>
                          </div>
                          <ul className="text-[11px] text-rose-800 list-disc list-inside">
                            {st.reasons?.map((r, rIdx) => (
                              <li key={rIdx}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    )
                  )}
                </div>
              </div>
            ) : null}

            <div className="pt-2 text-right">
              <button
                onClick={() => setInspectingJob(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
