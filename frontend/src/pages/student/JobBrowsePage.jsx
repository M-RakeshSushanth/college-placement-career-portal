import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import EligibilityBadge from '../../components/EligibilityBadge';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Calendar,
  IndianRupee,
  Sparkles,
  ChevronRight,
  X,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Clock
} from 'lucide-react';

export default function JobBrowsePage({ setCurrentTab, setSelectedJobForATS }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedJob, setSelectedJob] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [profile, setProfile] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  useEffect(() => {
    fetchJobs();
    api.get('/students/profile').then((r) => {
      if (r.data?.profile) {
        setProfile(r.data.profile);
        const primary = r.data.profile.resumes?.find((res) => res.isPrimary);
        if (primary) setSelectedResumeId(primary._id);
        else if (r.data.profile.resumes?.length > 0) setSelectedResumeId(r.data.profile.resumes[0]._id);
      }
    });
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs');
      if (res.data?.jobs) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBranch =
      selectedBranch === 'All' ||
      !job.eligibleBranches ||
      job.eligibleBranches.length === 0 ||
      job.eligibleBranches.includes(selectedBranch);

    return matchesSearch && matchesBranch;
  });

  const handleApply = async () => {
    if (!selectedJob) return;
    setApplying(true);
    try {
      const res = await api.post('/applications/apply', {
        jobId: selectedJob._id,
        resumeId: selectedResumeId,
      });
      if (res.data?.success) {
        setApplySuccess(true);
        setTimeout(() => {
          setSelectedJob(null);
          setApplySuccess(false);
          setCurrentTab('applications');
        }, 1800);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Active Placement Drives & Opportunities
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Jobs are evaluated against your academic credentials in real-time. Click any eligibility badge to see requirement breakdown.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by job title, company, or skills (e.g. React, Python)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="rounded-xl border border-slate-300 py-2 px-3 text-xs bg-slate-50 focus:bg-white text-slate-700"
          >
            <option value="All">All Engineering Branches</option>
            <option value="Computer Science & Engineering">Computer Science & Engg</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electronics & Communication">Electronics & Communication</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading placement drives...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs rounded-3xl bg-white border border-slate-200">
          No opportunities match your search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              onClick={() => setSelectedJob(job)}
              className="group rounded-3xl bg-white p-6 border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      {job.companyName}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5 line-clamp-1">
                      {job.title}
                    </h3>
                  </div>
                  <EligibilityBadge
                    isEligible={job.isEligible}
                    ineligibilityReasons={job.ineligibilityReasons}
                    criteriaStatus={job.criteriaStatus}
                  />
                </div>

                <div className="flex flex-wrap gap-y-2 gap-x-4 text-xs text-slate-500 mb-4">
                  <div className="flex items-center gap-1 font-semibold text-slate-800">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{job.salaryPackage?.ctc} LPA</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.jobLocation}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Due: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {job.requiredSkills?.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills?.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded-lg bg-slate-50 text-slate-400 text-[10px]">
                      +{job.requiredSkills.length - 4}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                <span>View Details & Apply</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Job Details Modal Drawer */}
      {selectedJob && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelectedJob(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {selectedJob.companyName}
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                  {selectedJob.title}
                </h2>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">{selectedJob.salaryPackage?.ctc} LPA</span>
                  <span>&bull;</span>
                  <span>{selectedJob.jobLocation}</span>
                  <span>&bull;</span>
                  <span>{selectedJob.employmentType}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedJob(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Automated Eligibility Status Box */}
            <div
              className={`p-4 rounded-2xl border ${
                selectedJob.isEligible
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/70 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {selectedJob.isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <span className="text-xs font-bold">
                  {selectedJob.isEligible
                    ? 'You are eligible to apply for this campus opening!'
                    : 'Eligibility Criteria Not Met'}
                </span>
              </div>

              {!selectedJob.isEligible && (
                <ul className="text-xs space-y-1 list-disc list-inside text-rose-800">
                  {selectedJob.ineligibilityReasons?.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Job Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Job Description</h4>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {selectedJob.description}
              </p>
            </div>

            {/* Required Skills */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Required Technical Skills</h4>
              <div className="flex flex-wrap gap-2">
                {selectedJob.requiredSkills?.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Selection Rounds */}
            {selectedJob.selectionRounds && selectedJob.selectionRounds.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Recruitment Rounds</h4>
                <div className="space-y-2">
                  {selectedJob.selectionRounds.map((round) => (
                    <div
                      key={round.roundNumber}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center gap-3"
                    >
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {round.roundNumber}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{round.roundName}</p>
                        <p className="text-slate-500 text-[11px]">{round.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Choose Resume */}
            {selectedJob.isEligible && profile?.resumes && profile.resumes.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Resume to Submit:
                </label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                >
                  {profile.resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.title} ({r.originalName}) {r.isPrimary ? '★ Primary' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedJobForATS(selectedJob);
                  setSelectedJob(null);
                  setCurrentTab('ats');
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-300 bg-blue-50/60 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                Scan Resume With AI ATS
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Close
                </button>

                <button
                  type="button"
                  disabled={!selectedJob.isEligible || applying || applySuccess}
                  onClick={handleApply}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  <FileCheck2 className="w-4 h-4" />
                  {applySuccess ? 'Applied Successfully! 🎉' : applying ? 'Submitting...' : 'Confirm Application'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
