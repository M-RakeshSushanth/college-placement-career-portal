import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  FileEdit,
  Sparkles,
  CheckCircle2,
  Copy,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Briefcase
} from 'lucide-react';

export default function ResumeImproverPage() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.get('/jobs').then((res) => {
      if (res.data?.jobs) {
        setJobs(res.data.jobs);
        if (res.data.jobs.length > 0) setSelectedJobId(res.data.jobs[0]._id);
      }
    });
  }, []);

  const handleImprove = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/ai/resume-improve', { jobId: selectedJobId });
      if (res.data?.data) {
        setResult(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Improvement assistant encountered an issue');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 to-slate-900 p-6 sm:p-8 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            AI Career Advisor
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI Job-Specific Resume Tailoring
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tailor your projects, professional summaries, and action verbs to the exact terminology required by recruiters without fabricating qualifications.
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
            Select Company Job Opening to Target:
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 p-3 text-xs bg-slate-50 focus:bg-white font-medium text-slate-800"
          >
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.companyName} &bull; {job.title} ({job.salaryPackage?.ctc} LPA)
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleImprove}
          disabled={loading || !selectedJobId}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-indigo-200" />
          {loading ? 'Analyzing & Re-architecting...' : 'Generate Tailored Resume Recommendations'}
        </button>
      </div>

      {loading && (
        <div className="rounded-3xl bg-white p-12 border border-slate-200 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">
            Synthesizing job keywords with your actual project experience...
          </p>
        </div>
      )}

      {result && (
        <div className="space-y-6 animate-scale-up">
          {/* Tailored Professional Summary */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Tailored Professional Summary (Drop-in Ready)
              </h3>
              <button
                onClick={() => copyToClipboard(result.tailored_summary)}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied!' : 'Copy Summary'}
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-xs text-slate-800 leading-relaxed font-serif italic">
              "{result.tailored_summary}"
            </div>
          </div>

          {/* Project Bullet Points Enhancements */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              High-Impact Project Bullet Points (Action-Verb Driven)
            </h3>

            <div className="space-y-4">
              {result.project_enhancements?.map((proj, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-indigo-900">{proj.current_or_topic}</h4>
                    <span className="text-[10px] text-slate-500 italic">{proj.rationale}</span>
                  </div>
                  <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700">
                    {proj.suggested_bullet_points?.map((pt, pIdx) => (
                      <li key={pIdx} className="leading-relaxed">
                        <span className="font-medium text-slate-900">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Skills and Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                Skills to Position at Top of Resume
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.skills_to_highlight?.map((s, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200"
                  >
                    ★ {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase">
                Keywords & Industry Terminology to Weave in
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.keywords_to_embed?.map((k, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200"
                  >
                    # {k}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
