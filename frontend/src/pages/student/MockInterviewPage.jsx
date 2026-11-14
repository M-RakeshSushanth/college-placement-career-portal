import React, { useState } from 'react';
import api from '../../services/api';
import {
  Video,
  Sparkles,
  CheckCircle2,
  Send,
  HelpCircle,
  Award,
  ChevronRight,
  RotateCcw,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function MockInterviewPage() {
  const [role, setRole] = useState('Software Developer');
  const [technology, setTechnology] = useState('Data Structures & Algorithms');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level / Campus Placement');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState({}); // question id -> eval result

  const handleStartInterview = async () => {
    setLoadingQuestions(true);
    setQuestions([]);
    setCurrentIdx(0);
    setUserAnswer('');
    setEvaluations({});

    try {
      const res = await api.post('/ai/mock-interview/questions', {
        role,
        technology,
        experienceLevel,
        count: 4,
      });
      if (res.data?.data) {
        setQuestions(res.data.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to generate interview questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setEvaluating(true);

    const q = questions[currentIdx];
    try {
      const res = await api.post('/ai/mock-interview/evaluate', {
        question: q.question,
        studentAnswer: userAnswer,
        expectedTopics: q.expected_topics,
        role,
      });

      if (res.data?.data) {
        setEvaluations((prev) => ({
          ...prev,
          [q.id || currentIdx]: res.data.data,
        }));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Answer evaluation failed');
    } finally {
      setEvaluating(false);
    }
  };

  const currentQ = questions[currentIdx];
  const currentEval = currentQ ? evaluations[currentQ.id || currentIdx] : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white border border-purple-800/40 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-md mb-3 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Interactive Career Preparation
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI-Powered Mock Interview Simulator
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Practice realistic technical, system design, and behavioral interview questions tailored to your target job profile with instant AI scoring and model answers.
          </p>
        </div>
      </div>

      {/* Configuration Card */}
      {questions.length === 0 && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Configure Your Mock Interview Session
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Job Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-3 text-xs bg-slate-50 font-medium text-slate-800"
              >
                <option value="Software Developer">Software Development Engineer (SDE)</option>
                <option value="Full Stack Developer">Full Stack Web Developer</option>
                <option value="Data Science & AI Engineer">Data Science & AI Engineer</option>
                <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Domain / Technology Focus</label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="e.g. React, Docker, SQL, Raft"
                className="w-full rounded-2xl border border-slate-300 p-3 text-xs font-medium text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Seniority Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 p-3 text-xs bg-slate-50 font-medium text-slate-800"
              >
                <option value="Entry Level / Campus Placement">Fresher / Campus Placement</option>
                <option value="Graduate Engineer Trainee">Graduate Engineer Trainee (GET)</option>
              </select>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartInterview}
              disabled={loadingQuestions}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              <Video className="w-4 h-4" />
              {loadingQuestions ? 'Generating Questions with AI...' : 'Begin Mock Interview'}
            </button>
          </div>
        </div>
      )}

      {/* Active Interview Panel */}
      {questions.length > 0 && currentQ && (
        <div className="space-y-6">
          {/* Question navigator pills */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 overflow-x-auto">
              {questions.map((q, idx) => {
                const isAnswered = !!evaluations[q.id || idx];
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIdx(idx);
                      setUserAnswer('');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      currentIdx === idx
                        ? 'bg-purple-600 text-white shadow-sm'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Q{idx + 1} {isAnswered && '✓'}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setQuestions([]);
                setEvaluations({});
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Session
            </button>
          </div>

          {/* Question Card */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                {currentQ.category || 'Technical Question'}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Difficulty: {currentQ.difficulty || 'Medium'}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>

            {currentQ.expected_topics && (
              <div className="flex items-center gap-2 pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Key concepts to touch:</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentQ.expected_topics.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Answer Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Your Answer / Explanation:
              </label>
              <textarea
                rows="5"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Explain the concepts, architectural trade-offs, and examples clearly..."
                className="w-full rounded-2xl border border-slate-300 p-4 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleEvaluateAnswer}
                disabled={evaluating || !userAnswer.trim()}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {evaluating ? 'Evaluating Answer...' : 'Submit Answer for AI Evaluation'}
              </button>

              {currentIdx < questions.length - 1 && (
                <button
                  onClick={() => {
                    setCurrentIdx((i) => i + 1);
                    setUserAnswer('');
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800"
                >
                  Next Question <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Evaluation Result */}
          {currentEval && (
            <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5 animate-scale-up">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl">
                    {currentEval.score}/10
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">AI Evaluation Feedback</h4>
                    <p className="text-xs text-slate-500">Correctness & completeness breakdown</p>
                  </div>
                </div>

                <div className="flex gap-4 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Technical</span>
                    <span className="font-bold text-slate-800">{currentEval.technicalCorrectness}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Clarity</span>
                    <span className="font-bold text-slate-800">{currentEval.clarityAndStructure}/10</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Depth</span>
                    <span className="font-bold text-slate-800">{currentEval.completeness}/10</span>
                  </div>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-2">
                  <span className="font-bold text-emerald-900 uppercase text-[10px] block">Key Strengths</span>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800">
                    {currentEval.strengths?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs space-y-2">
                  <span className="font-bold text-amber-900 uppercase text-[10px] block">Areas for Improvement</span>
                  <ul className="list-disc list-inside space-y-1 text-amber-800">
                    {currentEval.improvements?.map((imp, i) => (
                      <li key={i}>{imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Model Answer */}
              {currentEval.modelAnswer && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                  <span className="font-bold text-slate-700 uppercase text-[10px] block flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Exemplary Model Answer:
                  </span>
                  <p className="text-slate-800 leading-relaxed font-serif italic">
                    "{currentEval.modelAnswer}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
