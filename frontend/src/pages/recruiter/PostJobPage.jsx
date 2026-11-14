import React, { useState } from 'react';
import api from '../../services/api';
import { Briefcase, Plus, CheckCircle2, AlertCircle, Save } from 'lucide-react';

const BRANCH_OPTIONS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
];

export default function PostJobPage({ setCurrentTab }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requiredSkills, setRequiredSkills] = useState('React, Node.js, MongoDB, Docker, Python');
  const [eligibleBranches, setEligibleBranches] = useState(['Computer Science & Engineering', 'Information Technology']);
  const [minimumCGPA, setMinimumCGPA] = useState('7.5');
  const [maxActiveBacklogs, setMaxActiveBacklogs] = useState('0');
  const [jobLocation, setJobLocation] = useState('Bangalore / Hybrid');
  const [ctc, setCtc] = useState('14.0');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [deadline, setDeadline] = useState('2026-12-31');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const toggleBranch = (branch) => {
    if (eligibleBranches.includes(branch)) {
      setEligibleBranches(eligibleBranches.filter((b) => b !== branch));
    } else {
      setEligibleBranches([...eligibleBranches, branch]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);

    try {
      const skillsArray = requiredSkills.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.post('/jobs', {
        title,
        description,
        requiredSkills: skillsArray,
        eligibleBranches,
        minimumCGPA: Number(minimumCGPA),
        maxActiveBacklogs: Number(maxActiveBacklogs),
        jobLocation,
        salaryPackage: {
          ctc: Number(ctc),
          currency: 'INR',
          breakupText: `Base: ${Math.round(Number(ctc) * 0.75)} LPA + Bonus/Benefits`,
        },
        employmentType,
        applicationDeadline: new Date(deadline),
        selectionRounds: [
          { roundNumber: 1, roundName: 'Online Coding Assessment', description: 'Technical & Algorithmic Test' },
          { roundNumber: 2, roundName: 'Technical Interview I', description: 'Core Domain & Project Discussion' },
          { roundNumber: 3, roundName: 'HR & Cultural Alignment', description: 'Behavioral & Leadership' },
        ],
      });

      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => {
          setCurrentTab('manage-jobs');
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to post opening');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Publish Placement Opportunity
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Specify role expectations and eligibility criteria. When published, the eligibility filtering engine evaluates all student profiles and broadcasts real-time alerts to eligible candidates.
        </p>
      </div>

      {success && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Opportunity published successfully! Eligible students are being notified via real-time Socket.IO.
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        {/* Title and Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Associate Software Engineer - Campus 2026"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium bg-white"
            >
              <option value="Full-Time">Full-Time</option>
              <option value="Internship">Internship</option>
              <option value="Internship + PPO">Internship + PPO</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Description & Responsibilities</label>
          <textarea
            rows="4"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline daily engineering responsibilities, project scope, team overview, and performance expectations..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs"
          />
        </div>

        {/* Required Skills */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Required Technical Skills (comma separated)</label>
          <input
            type="text"
            required
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
            placeholder="e.g. React, Node.js, Python, MongoDB, Docker"
            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
          />
        </div>

        {/* Eligibility Criteria Section */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
            Automated Student Eligibility Criteria
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Eligible Engineering Branches</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {BRANCH_OPTIONS.map((branch) => {
                const checked = eligibleBranches.includes(branch);
                return (
                  <label
                    key={branch}
                    onClick={() => toggleBranch(branch)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      checked
                        ? 'border-blue-500 bg-blue-50/60 font-semibold text-blue-900'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {}}
                      className="rounded text-blue-600"
                    />
                    <span>{branch}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={minimumCGPA}
                onChange={(e) => setMinimumCGPA(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Maximum Active Backlogs Permitted</label>
              <input
                type="number"
                min="0"
                required
                value={maxActiveBacklogs}
                onChange={(e) => setMaxActiveBacklogs(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Application Deadline</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Compensation & Location */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Salary Package CTC (LPA)</label>
            <input
              type="number"
              step="0.5"
              required
              value={ctc}
              onChange={(e) => setCtc(e.target.value)}
              placeholder="e.g. 18.5"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-bold text-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Work Location</label>
            <input
              type="text"
              required
              value={jobLocation}
              onChange={(e) => setJobLocation(e.target.value)}
              placeholder="e.g. Bangalore, Hyderabad, Remote"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {submitting ? 'Publishing & Evaluating...' : 'Publish Job Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
}
