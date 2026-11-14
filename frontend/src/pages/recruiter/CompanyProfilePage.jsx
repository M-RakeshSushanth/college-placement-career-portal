import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Building2, Save, CheckCircle2, Globe, Phone, MapPin } from 'lucide-react';

export default function CompanyProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/recruiters/profile')
      .then((res) => {
        if (res.data?.profile) setProfile(res.data.profile);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/recruiters/profile', profile);
      if (res.data?.success) {
        setMessage('Company profile updated successfully!');
        setProfile(res.data.profile);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 text-xs">Loading company profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Recruiter & Corporate Profile
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage company branding, website, industry, and talent acquisition contact credentials.
        </p>
      </div>

      {message && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Name</label>
            <input
              type="text"
              required
              value={profile?.companyName || ''}
              onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Company Website</label>
            <input
              type="text"
              value={profile?.companyWebsite || ''}
              onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })}
              placeholder="https://company.com"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Industry</label>
            <input
              type="text"
              value={profile?.industry || 'Technology'}
              onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Corporate Headquarters</label>
            <input
              type="text"
              value={profile?.headquarters || ''}
              onChange={(e) => setProfile({ ...profile, headquarters: e.target.value })}
              placeholder="e.g. Bangalore, India"
              className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">About Company / Culture</label>
          <textarea
            rows="3"
            value={profile?.companyDescription || ''}
            onChange={(e) => setProfile({ ...profile, companyDescription: e.target.value })}
            placeholder="Tell students about company vision, growth opportunities, and engineering culture..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
