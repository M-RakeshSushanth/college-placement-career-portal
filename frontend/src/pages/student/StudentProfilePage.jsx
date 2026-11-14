import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Briefcase,
  Award,
  FileText,
  Upload,
  Trash2,
  CheckCircle2,
  Star,
  Plus,
  Save,
  AlertCircle
} from 'lucide-react';

export default function StudentProfilePage() {
  const { user, updateUserProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('academics');
  const [message, setMessage] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);

  // Resume upload form
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeTitle, setResumeTitle] = useState('');

  // New project / internship / skill inputs
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/students/profile');
      if (res.data?.profile) {
        setProfile(res.data.profile);
        updateUserProfile(res.data.profile);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await api.put('/students/profile', profile);
      if (res.data?.success) {
        setMessage('Profile updated successfully!');
        setProfile(res.data.profile);
        updateUserProfile(res.data.profile);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    setUploadingResume(true);
    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('title', resumeTitle || resumeFile.name);

    try {
      const res = await api.post('/students/resumes', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setProfile((prev) => ({ ...prev, resumes: res.data.resumes }));
        setResumeFile(null);
        setResumeTitle('');
        alert('Resume uploaded successfully!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await api.delete(`/students/resumes/${resumeId}`);
      if (res.data?.success) {
        setProfile((prev) => ({ ...prev, resumes: res.data.resumes }));
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleSetPrimary = async (resumeId) => {
    try {
      const res = await api.put(`/students/resumes/${resumeId}/primary`);
      if (res.data?.success) {
        setProfile((prev) => ({ ...prev, resumes: res.data.resumes }));
      }
    } catch (err) {
      alert('Failed to set primary resume');
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    if (!profile.technicalSkills.includes(newSkill.trim())) {
      setProfile((prev) => ({
        ...prev,
        technicalSkills: [...(prev.technicalSkills || []), newSkill.trim()],
      }));
    }
    setNewSkill('');
  };

  const removeSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter((s) => s !== skillToRemove),
    }));
  };

  const addProject = () => {
    setProfile((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { title: 'New Project', description: '', technologies: [], githubUrl: '' },
      ],
    }));
  };

  const removeProject = (index) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading student profile...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Profile Summary */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
              {profile?.isProfileVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified by Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Roll No: <span className="font-semibold text-slate-700">{profile?.registrationNumber}</span> &bull; {profile?.department}
            </p>
            <p className="text-xs text-slate-500">
              Graduation: {profile?.graduationYear} &bull; CGPA: <span className="font-bold text-blue-600">{profile?.cgpa}</span> &bull; Active Backlogs: {profile?.activeBacklogs}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile Changes'}
        </button>
      </div>

      {message && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'academics', label: 'Academic Qualifications', icon: GraduationCap },
          { id: 'skills', label: 'Technical Skills', icon: Code2 },
          { id: 'projects', label: 'Projects & Internships', icon: FolderGit2 },
          { id: 'resumes', label: 'Resume Documents', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Academics */}
      {activeTab === 'academics' && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Academic Performance & Eligibility Factors
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Registration / Roll No</label>
              <input
                type="text"
                value={profile?.registrationNumber || ''}
                onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Department / Branch</label>
              <select
                value={profile?.department || 'Computer Science & Engineering'}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium bg-white"
              >
                <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Communication</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Graduation Year</label>
              <input
                type="number"
                value={profile?.graduationYear || 2026}
                onChange={(e) => setProfile({ ...profile, graduationYear: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Cumulative CGPA (out of 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={profile?.cgpa || 8.0}
                onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-bold text-blue-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Active Backlogs</label>
              <input
                type="number"
                min="0"
                value={profile?.activeBacklogs || 0}
                onChange={(e) => setProfile({ ...profile, activeBacklogs: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-semibold text-rose-600"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">History of Backlogs</label>
              <input
                type="number"
                min="0"
                value={profile?.historyOfBacklogs || 0}
                onChange={(e) => setProfile({ ...profile, historyOfBacklogs: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">10th Standard Percentage (%)</label>
              <input
                type="number"
                step="0.1"
                value={profile?.tenthPercentage || 85}
                onChange={(e) => setProfile({ ...profile, tenthPercentage: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">12th Standard / Diploma (%)</label>
              <input
                type="number"
                step="0.1"
                value={profile?.twelfthPercentage || 85}
                onChange={(e) => setProfile({ ...profile, twelfthPercentage: Number(e.target.value) })}
                className="w-full rounded-xl border border-slate-300 p-2.5 font-medium"
              />
            </div>
          </div>

          {/* Semester-wise breakdown */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-3">
              Semester-wise Academic Record (SGPA)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const semData = profile?.semesterGrades?.find((s) => s.semester === sem);
                return (
                  <div key={sem} className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Sem {sem}</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="SGPA"
                      value={semData?.sgpa || ''}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const grades = [...(profile?.semesterGrades || [])];
                        const idx = grades.findIndex((s) => s.semester === sem);
                        if (idx > -1) {
                          grades[idx].sgpa = val;
                        } else {
                          grades.push({ semester: sem, sgpa: val, backlogs: 0 });
                        }
                        setProfile({ ...profile, semesterGrades: grades });
                      }}
                      className="w-full mt-1 text-center font-bold text-slate-800 bg-white rounded border border-slate-300 py-1 text-xs"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skills */}
      {activeTab === 'skills' && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Technical Skills & Certifications
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Technical Skills Tags</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. React, Node.js, Docker, Python..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="rounded-xl border border-slate-300 px-3 py-2 text-xs flex-1 max-w-md"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {profile?.technicalSkills?.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-slate-400 hover:text-rose-600 ml-1 text-xs"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">GitHub Profile Link</label>
              <input
                type="text"
                value={profile?.github || ''}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">LinkedIn Profile Link</label>
              <input
                type="text"
                value={profile?.linkedin || ''}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Projects & Internships */}
      {activeTab === 'projects' && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Projects & Engineering Demonstrations
            </h3>
            <button
              type="button"
              onClick={addProject}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Project
            </button>
          </div>

          <div className="space-y-4">
            {profile?.projects?.map((project, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={project.title}
                    onChange={(e) => {
                      const updated = [...profile.projects];
                      updated[idx].title = e.target.value;
                      setProfile({ ...profile, projects: updated });
                    }}
                    placeholder="Project Title"
                    className="font-bold text-sm bg-white rounded-lg border border-slate-300 px-3 py-1 flex-1 max-w-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="text-rose-500 hover:text-rose-700 p-1 rounded"
                    title="Remove project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  rows="2"
                  value={project.description}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[idx].description = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  placeholder="Describe architecture, key features, and performance outcomes..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
                />
                <input
                  type="text"
                  value={project.githubUrl || ''}
                  onChange={(e) => {
                    const updated = [...profile.projects];
                    updated[idx].githubUrl = e.target.value;
                    setProfile({ ...profile, projects: updated });
                  }}
                  placeholder="GitHub / Live Demo URL"
                  className="w-full rounded-xl border border-slate-300 p-2 text-xs bg-white"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Resumes Manager */}
      {activeTab === 'resumes' && (
        <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Resume Version Management
          </h3>
          <p className="text-xs text-slate-500">
            Upload multiple resumes targeted for different roles (e.g. Full-Stack, AI Engineer, SDE). The AI ATS Analyzer and job applications can evaluate each version.
          </p>

          {/* Upload Box */}
          <form onSubmit={handleUploadResume} className="p-5 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/30 space-y-3">
            <h4 className="text-xs font-bold text-blue-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              Upload New Resume Document (PDF / DOCX)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Label / Title (e.g. SDE Resume 2026)"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                className="rounded-xl border border-slate-300 p-2.5 text-xs bg-white"
              />
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                required
                onChange={(e) => setResumeFile(e.target.files[0])}
                className="rounded-xl border border-slate-300 p-2 text-xs bg-white file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={uploadingResume || !resumeFile}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {uploadingResume ? 'Uploading & Parsing...' : 'Upload Resume'}
            </button>
          </form>

          {/* Uploaded resumes list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase">
              Current Resumes ({profile?.resumes?.length || 0})
            </h4>

            {profile?.resumes?.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No resumes uploaded yet. Upload one above to get started!
              </div>
            ) : (
              profile?.resumes?.map((resume) => (
                <div
                  key={resume._id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    resume.isPrimary ? 'border-blue-400 bg-blue-50/20' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">{resume.title}</span>
                        {resume.isPrimary && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-blue-600" /> Primary Resume
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {resume.originalName} &bull; Uploaded {new Date(resume.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!resume.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(resume._id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Set as Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteResume(resume._id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Delete resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
