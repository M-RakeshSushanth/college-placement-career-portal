import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Sparkles,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Cpu,
  Database,
  ArrowRight,
  ListChecks,
  ChevronRight
} from 'lucide-react';

export default function ATSAnalyzerPage({ selectedJobForATS }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(selectedJobForATS?._id || '');
  const [profile, setProfile] = useState(null);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [atsResult, setAtsResult] = useState(null);

  useEffect(() => {
    api.get('/jobs').then((res) => {
      if (res.data?.jobs) {
        setJobs(res.data.jobs);
        if (!selectedJobId && res.data.jobs.length > 0) {
          setSelectedJobId(res.data.jobs[0]._id);
        }
      }
    });

    api.get('/students/profile').then((res) => {
      if (res.data?.profile) {
        setProfile(res.data.profile);
        const primary = res.data.profile.resumes?.find((r) => r.isPrimary);
        if (primary) setSelectedResumeId(primary._id);
        else if (res.data.profile.resumes?.length > 0) setSelectedResumeId(res.data.profile.resumes[0]._id);
      }
    });
  }, []);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setAtsResult(null);

    try {
      const selectedJob = jobs.find((j) => j._id === selectedJobId);

      if (uploadedFile) {
        const formData = new FormData();
        formData.append('resume', uploadedFile);
        formData.append('jobId', selectedJobId);

        const res = await api.post('/ai/ats-analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        if (res.data?.data) {
          setAtsResult(res.data.data);
        }
      } else {
        const res = await api.post('/ai/ats-analyze', {
          jobId: selectedJobId,
          resumeId: selectedResumeId || undefined,
        });
        if (res.data?.data) {
          setAtsResult(res.data.data);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'ATS Analysis encountered an issue');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-amber-600 bg-amber-50 border-amber-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold backdrop-blur-md mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            LangChain & FAISS RAG Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI-Powered ATS Resume Analyzer
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Evaluates semantic resume alignment against company requirements using HuggingFace embeddings, FAISS vector indexing, and Gemini LLM. Identify skill gaps before applying.
          </p>
        </div>
      </div>

      {/* Input Selection Card */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Target Job */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              1. Select Target Placement Opening
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

          {/* Resume Choice */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              2. Select Resume Source
            </label>
            <div className="space-y-3">
              {profile?.resumes && profile.resumes.length > 0 && (
                <select
                  value={selectedResumeId}
                  onChange={(e) => {
                    setSelectedResumeId(e.target.value);
                    setUploadedFile(null);
                  }}
                  className="w-full rounded-2xl border border-slate-300 p-3 text-xs bg-slate-50 focus:bg-white font-medium text-slate-800"
                >
                  {profile.resumes.map((r) => (
                    <option key={r._id} value={r._id}>
                      Saved: {r.title} ({r.originalName}) {r.isPrimary ? '★ Primary' : ''}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-semibold uppercase">Or Upload File:</span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => setUploadedFile(e.target.files[0])}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRunAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            {analyzing ? 'Extracting, Indexing & Scanning...' : 'Run RAG ATS Evaluation'}
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {analyzing && (
        <div className="rounded-3xl bg-white p-12 border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">Processing Semantic Embedding & Retrieval</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            LangChain is chunking the document text, generating HuggingFace numerical vector representations, and querying FAISS for contextual relevance.
          </p>
        </div>
      )}

      {/* ATS Results View */}
      {atsResult && (
        <div className="space-y-6 animate-scale-up">
          {/* Top Score Banner */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Overall Gauge */}
              <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Overall ATS Score
                </span>
                <div className={`mt-3 w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ${getScoreColor(atsResult.overallScore)}`}>
                  <span className="text-3xl font-black">{atsResult.overallScore}%</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5">Match</span>
                </div>
              </div>

              {/* Breakdown metrics */}
              <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Skills Alignment</span>
                  <p className="mt-1 text-2xl font-black text-blue-600">{atsResult.skillsScore}%</p>
                  <p className="text-[11px] text-slate-500 mt-1">Direct keyword & context match</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Experience & Semantic</span>
                  <p className="mt-1 text-2xl font-black text-indigo-600">{atsResult.experienceScore}%</p>
                  <p className="text-[11px] text-slate-500 mt-1">FAISS vector cosine similarity</p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase block">Education & Structure</span>
                  <p className="mt-1 text-2xl font-black text-emerald-600">{atsResult.educationScore}%</p>
                  <p className="text-[11px] text-slate-500 mt-1">Degree & section completeness</p>
                </div>

                {/* Summary paragraph */}
                <div className="sm:col-span-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs text-blue-900 leading-relaxed">
                  <strong>Executive Summary:</strong> {atsResult.summary}
                </div>
              </div>
            </div>
          </div>

          {/* Skills Grid: Matching vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Matching Technical Skills ({atsResult.matchingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {atsResult.matchingSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200"
                  >
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-rose-700 uppercase flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                Missing Required Skills / Skill Gaps ({atsResult.missingSkills?.length || 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {atsResult.missingSkills?.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200"
                  >
                    ✕ {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Recommendations */}
          <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-blue-600" />
              Actionable Resume Improvement Recommendations
            </h4>
            <div className="space-y-2">
              {atsResult.recommendations?.map((rec, i) => (
                <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
