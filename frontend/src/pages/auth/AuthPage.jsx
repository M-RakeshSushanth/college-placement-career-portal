import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Briefcase, ShieldCheck, Mail, Lock, User, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [cgpa, setCgpa] = useState('8.5');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          role,
          department,
          graduationYear: Number(graduationYear),
          cgpa: Number(cgpa),
          companyName: role === 'recruiter' ? companyName : undefined,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setError('');
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-white relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25 mb-3">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white font-serif sm:text-4xl">
          Campus Placement Portal
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          AI-Powered Recruitment, ATS Analysis & Career Preparation System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-white/10 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl border border-white/10 sm:px-10">
          
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-800/80 rounded-2xl mb-6 border border-slate-700/60">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                role === 'student'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                role === 'recruiter'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              Recruiter
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-xl transition-all ${
                role === 'admin'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
          </div>

          {/* Toggle Login / Register */}
          <div className="flex border-b border-slate-700/60 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`pb-3 text-sm font-bold flex-1 text-center transition-colors border-b-2 ${
                isLogin ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`pb-3 text-sm font-bold flex-1 text-center transition-colors border-b-2 ${
                !isLogin ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl bg-rose-500/20 border border-rose-500/40 p-3 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aditya Verma"
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-700 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'admin' ? 'admin@campus.edu' : role === 'recruiter' ? 'recruiter@company.com' : 'student@campus.edu'}
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-700 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-700 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {!isLogin && role === 'student' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-700 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engg</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={cgpa}
                    onChange={(e) => setCgpa(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-700 py-2 px-3 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {!isLogin && role === 'recruiter' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Google, Microsoft, Adobe"
                  className="w-full rounded-xl bg-slate-900/60 border border-slate-700 py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all transform active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In to Portal' : 'Complete Registration')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              ⚡ Quick Demo 1-Click Login:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student@campus.edu', 'password123')}
                className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                Demo Student
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('recruiter@google.com', 'password123')}
                className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-blue-400 font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Demo Recruiter
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@campus.edu', 'password123')}
                className="py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-purple-400 font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Demo Admin
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
