import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Users2,
  ThumbsUp,
  Search,
  MessageSquare,
  Sparkles,
  BookOpen,
  Briefcase,
  PlusCircle,
  X
} from 'lucide-react';

export default function AlumniGuidancePage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);

  // New feedback form
  const [authorName, setAuthorName] = useState('');
  const [graduationYear, setGraduationYear] = useState('2024');
  const [currentCompany, setCurrentCompany] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [interviewProcess, setInterviewProcess] = useState('');
  const [preparationTips, setPreparationTips] = useState('');
  const [sampleQuestions, setSampleQuestions] = useState('');
  const [skillsRecommended, setSkillsRecommended] = useState('Data Structures, System Design, React');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await api.get('/alumni');
      if (res.data?.feedbacks) {
        setFeedbacks(res.data.feedbacks);
      }
    } catch (err) {
      console.error('Failed to load alumni feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const res = await api.put(`/alumni/${id}/upvote`);
      if (res.data?.success) {
        setFeedbacks((prev) =>
          prev.map((f) =>
            f._id === id
              ? {
                  ...f,
                  upvotes: f.upvotes?.length
                    ? [...f.upvotes, 'current_user']
                    : ['current_user'],
                }
              : f
          )
        );
        fetchFeedbacks();
      }
    } catch (err) {
      alert('Upvote failed');
    }
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/alumni', {
        authorName,
        graduationYear: Number(graduationYear),
        currentCompany,
        role,
        department,
        interviewProcess,
        preparationTips,
        sampleQuestionsAsked: sampleQuestions.split('\n').filter((q) => q.trim()),
        skillsRecommended: skillsRecommended.split(',').map((s) => s.trim()),
      });
      if (res.data?.success) {
        alert('Thank you! Your interview guidance has been shared.');
        setShowShareModal(false);
        fetchFeedbacks();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) => {
    const q = searchTerm.toLowerCase();
    return (
      f.currentCompany?.toLowerCase().includes(q) ||
      f.role?.toLowerCase().includes(q) ||
      f.preparationTips?.toLowerCase().includes(q) ||
      f.skillsRecommended?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Alumni Feedback & Career Guidance Knowledge Base
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse real campus recruitment experiences, technical interview questions, and prep tips contributed by placed alumni.
          </p>
        </div>

        <button
          onClick={() => setShowShareModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
        >
          <PlusCircle className="w-4 h-4" />
          Contribute Experience
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by company (Google, Microsoft), role, or skills..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-2xl border border-slate-300 py-2.5 pl-10 pr-4 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Feedbacks Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading alumni insights...</div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs rounded-3xl bg-white border border-slate-200">
          No alumni insights matched your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFeedbacks.map((item) => (
            <div
              key={item._id}
              className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">
                      {item.currentCompany}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {item.role}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Shared by <span className="font-semibold text-slate-700">{item.authorName}</span> &bull; Batch {item.graduationYear} &bull; {item.department}
                    </p>
                  </div>

                  <button
                    onClick={() => handleUpvote(item._id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                    <span>{item.upvotes?.length || 0}</span>
                  </button>
                </div>

                {/* Interview Process */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Recruitment & Interview Process
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {item.interviewProcess}
                  </p>
                </div>

                {/* Sample Questions Asked */}
                {item.sampleQuestionsAsked && item.sampleQuestionsAsked.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Actual Interview Questions Asked
                    </h4>
                    <ul className="text-xs space-y-1 list-disc list-inside text-slate-700">
                      {item.sampleQuestionsAsked.map((q, i) => (
                        <li key={i} className="font-medium">{q}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preparation Tips */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Preparation Strategy
                  </h4>
                  <p className="text-xs text-slate-600 italic">
                    "{item.preparationTips}"
                  </p>
                </div>
              </div>

              {/* Skills */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                {item.skillsRecommended?.map((s, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-100"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Contribute Placement Experience
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Kavita Nair"
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Graduation Batch</label>
                  <input
                    type="number"
                    required
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Company Placed At</label>
                  <input
                    type="text"
                    required
                    value={currentCompany}
                    onChange={(e) => setCurrentCompany(e.target.value)}
                    placeholder="e.g. Google, Microsoft"
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full rounded-xl border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Interview Rounds & Selection Process</label>
                <textarea
                  rows="3"
                  required
                  value={interviewProcess}
                  onChange={(e) => setInterviewProcess(e.target.value)}
                  placeholder="Detail the online assessment, number of technical rounds, topics asked..."
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Sample Questions Asked (one per line)</label>
                <textarea
                  rows="3"
                  value={sampleQuestions}
                  onChange={(e) => setSampleQuestions(e.target.value)}
                  placeholder="Design LRU Cache&#10;Explain React Virtual DOM reconciliation&#10;Implement Rate Limiter"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Preparation Tips</label>
                <textarea
                  rows="2"
                  required
                  value={preparationTips}
                  onChange={(e) => setPreparationTips(e.target.value)}
                  placeholder="What resources, books, or mock strategies helped you most?"
                  className="w-full rounded-xl border border-slate-300 p-2.5"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                >
                  Publish Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
