import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Briefcase, Users, Plus, Trash2, ChevronRight } from 'lucide-react';

export default function RecruiterJobsPage({ setCurrentTab, setSelectedJobForReview }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs/recruiter/my-jobs');
      if (res.data?.jobs) setJobs(res.data.jobs);
    } catch (err) {
      console.error('Failed to load my jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j._id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Manage Posted Opportunities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track active drives, inspect candidate submissions, or post new opportunities.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('post-job')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" />
          Create New Job Opening
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading posted openings...</div>
      ) : jobs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs rounded-3xl bg-white border border-slate-200">
          You haven't posted any jobs yet.
        </div>
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
                    onClick={() => handleDelete(job._id)}
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

                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">CGPA Requirement:</span>
                    <span className="font-bold text-blue-600">&ge; {job.minimumCGPA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deadline:</span>
                    <span className="text-slate-700 font-medium">
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => {
                    setSelectedJobForReview(job);
                    setCurrentTab('applicant-review');
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  Review Candidates & Applications
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
