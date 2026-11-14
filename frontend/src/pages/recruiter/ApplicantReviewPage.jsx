import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Sparkles,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  Clock
} from 'lucide-react';

export default function ApplicantReviewPage({ selectedJobForReview }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(selectedJobForReview?._id || '');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [minCgpaFilter, setMinCgpaFilter] = useState('');

  // Interview scheduling modal state
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [interviewRound, setInterviewRound] = useState('Technical Interview I');
  const [interviewDate, setInterviewDate] = useState('');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/xyz-campus-round');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // View Candidate Resume / ATS modal
  const [viewingCandidate, setViewingCandidate] = useState(null);

  useEffect(() => {
    api.get('/jobs/recruiter/my-jobs').then((res) => {
      if (res.data?.jobs) {
        setJobs(res.data.jobs);
        if (!selectedJobId && res.data.jobs.length > 0) {
          setSelectedJobId(res.data.jobs[0]._id);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      fetchApplicants(selectedJobId);
    }
  }, [selectedJobId]);

  const fetchApplicants = async (jobId) => {
    setLoading(true);
    try {
      const res = await api.get(`/applications/job/${jobId}`);
      if (res.data?.applications) {
        setApplicants(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, newStatus, extraData = {}) => {
    setUpdating(true);
    try {
      const res = await api.put(`/applications/${applicationId}/status`, {
        status: newStatus,
        ...extraData,
      });
      if (res.data?.success) {
        setApplicants((prev) =>
          prev.map((a) => (a._id === applicationId ? res.data.application : a))
        );
        setSchedulingApp(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedulingApp) return;

    await handleUpdateStatus(schedulingApp._id, 'Interview', {
      notes: `Scheduled ${interviewRound} on ${new Date(interviewDate).toLocaleString()}`,
      interviewDetails: {
        roundName: interviewRound,
        scheduledAt: new Date(interviewDate),
        meetingLink,
        interviewerNotes: notes,
      },
    });
  };

  const filteredApplicants = applicants.filter((app) => {
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchesCgpa = !minCgpaFilter || (app.studentProfile?.cgpa || 0) >= Number(minCgpaFilter);
    return matchesStatus && matchesCgpa;
  });

  return (
    <div className="space-y-6">
      {/* Header and Job Selector */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Candidate Pipeline & Application Review
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review applicant profiles, inspect ATS matching scores, advance candidates through recruitment stages, or schedule interview rounds.
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
            Select Opening:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-slate-50 focus:bg-white font-semibold text-slate-800"
          >
            {jobs.map((j) => (
              <option key={j._id} value={j._id}>
                {j.title} ({j.salaryPackage?.ctc} LPA)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 text-xs">
        <span className="font-bold text-slate-700 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter Candidates:
        </span>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-1.5 bg-slate-50 text-slate-700 font-medium"
        >
          <option value="All">All Stages ({applicants.length})</option>
          <option value="Applied">Applied</option>
          <option value="Under Review">Under Review</option>
          <option value="Shortlisted">Shortlisted</option>
          <option value="Assessment">Assessment</option>
          <option value="Interview">Interview</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </select>

        <input
          type="number"
          step="0.1"
          placeholder="Min CGPA (e.g. 8.0)"
          value={minCgpaFilter}
          onChange={(e) => setMinCgpaFilter(e.target.value)}
          className="rounded-xl border border-slate-300 px-3 py-1.5 w-36 bg-slate-50"
        />
      </div>

      {/* Applicants Table */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading candidates...</div>
      ) : filteredApplicants.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs rounded-3xl bg-white border border-slate-200">
          No applicants match the selected criteria for this job opening.
        </div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Academic Credentials</th>
                  <th className="p-4">Technical Skills</th>
                  <th className="p-4">ATS Match</th>
                  <th className="p-4">Current Stage</th>
                  <th className="p-4 text-right">Recruitment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredApplicants.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Candidate Name & Contact */}
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{app.student?.name}</span>
                        <span className="text-[11px] text-slate-400">{app.student?.email}</span>
                        <span className="text-[10px] text-blue-600 block mt-0.5">
                          Roll: {app.studentProfile?.registrationNumber}
                        </span>
                      </div>
                    </td>

                    {/* Academics */}
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-blue-700 block">
                          CGPA: {app.studentProfile?.cgpa}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {app.studentProfile?.department}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Backlogs: {app.studentProfile?.activeBacklogs || 0}
                        </span>
                      </div>
                    </td>

                    {/* Skills */}
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {app.studentProfile?.technicalSkills?.slice(0, 3).map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px]"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* ATS Score */}
                    <td className="p-4">
                      {app.atsScoreReport ? (
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                            {app.atsScoreReport.overallScore}%
                          </span>
                          <button
                            onClick={() => setViewingCandidate(app)}
                            className="text-[10px] text-blue-600 hover:underline"
                          >
                            Report
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Not scanned</span>
                      )}
                    </td>

                    {/* Current Stage */}
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          app.status === 'Selected'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : app.status === 'Shortlisted'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingCandidate(app)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-[11px]"
                          title="View Profile & Resume"
                        >
                          Profile
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-[11px] font-bold"
                        >
                          Shortlist
                        </button>

                        <button
                          onClick={() => setSchedulingApp(app)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold"
                        >
                          Schedule
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(app._id, 'Selected')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-[11px] font-bold"
                        >
                          Offer
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSchedulingApp(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Schedule Interview for {schedulingApp.student?.name}
              </h3>
              <button
                onClick={() => setSchedulingApp(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Interview Round Title</label>
                <input
                  type="text"
                  required
                  value={interviewRound}
                  onChange={(e) => setInterviewRound(e.target.value)}
                  placeholder="e.g. Technical Round 1 (DSA & System Design)"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Virtual Meeting Link</label>
                <input
                  type="text"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz"
                  className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Instructions for Candidate</label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ensure stable internet connection and have your IDE ready..."
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSchedulingApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  {updating ? 'Saving...' : 'Send Schedule & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Candidate Details Modal */}
      {viewingCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setViewingCandidate(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {viewingCandidate.student?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  {viewingCandidate.studentProfile?.department} &bull; CGPA: {viewingCandidate.studentProfile?.cgpa}
                </p>
              </div>
              <button
                onClick={() => setViewingCandidate(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resume file link if available */}
            {viewingCandidate.resume && (
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-blue-900 font-semibold">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Submitted Resume: {viewingCandidate.resume.title || viewingCandidate.resume.originalName}</span>
                </div>
                {viewingCandidate.resume.filePath && (
                  <a
                    href={viewingCandidate.resume.filePath}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-700 underline flex items-center gap-1"
                  >
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {/* ATS Score Details */}
            {viewingCandidate.atsScoreReport && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase text-[10px]">ATS Score Match</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {viewingCandidate.atsScoreReport.overallScore}%
                  </span>
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  "{viewingCandidate.atsScoreReport.summary}"
                </p>
              </div>
            )}

            {/* Projects */}
            {viewingCandidate.studentProfile?.projects?.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Projects</h4>
                <div className="space-y-2">
                  {viewingCandidate.studentProfile.projects.map((p, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <p className="font-bold text-slate-800">{p.title}</p>
                      <p className="text-slate-600 text-[11px] mt-0.5">{p.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 text-right">
              <button
                onClick={() => setViewingCandidate(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
