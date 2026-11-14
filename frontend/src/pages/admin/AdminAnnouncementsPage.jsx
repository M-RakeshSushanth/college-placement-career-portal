import React, { useState } from 'react';
import api from '../../services/api';
import { Megaphone, Send, CheckCircle2 } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('student');
  const [broadcasting, setBroadcasting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setBroadcasting(true);
    setSentSuccess(false);

    try {
      const res = await api.post('/notifications/broadcast', {
        title,
        message,
        targetRole,
      });

      if (res.data?.success) {
        setSentSuccess(true);
        setTitle('');
        setMessage('');
        setTimeout(() => setSentSuccess(false), 4000);
      }
    } catch (err) {
      alert('Broadcast failed');
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Broadcast Real-Time Placement Announcements
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Instant Socket.IO push notifications delivered immediately to connected students and recruiters without page refresh.
        </p>
      </div>

      {sentSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Announcement delivered in real time to connected users!
        </div>
      )}

      <form onSubmit={handleBroadcast} className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Target Audience</label>
          <select
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            className="w-full sm:max-w-xs rounded-xl border border-slate-300 p-2.5 text-xs bg-slate-50 font-medium"
          >
            <option value="student">All Students</option>
            <option value="recruiter">All Recruiters</option>
            <option value="all">Everyone (Students & Recruiters)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Announcement Headline</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Mandatory Pre-Placement Talk: Google Campus Drive Tomorrow at 10 AM"
            className="w-full rounded-xl border border-slate-300 p-3 text-xs font-medium"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Detailed Message</label>
          <textarea
            rows="4"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write announcement details, venue or online video links, and instructions..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={broadcasting}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {broadcasting ? 'Broadcasting...' : 'Broadcast Real-Time Notice'}
          </button>
        </div>
      </form>
    </div>
  );
}
