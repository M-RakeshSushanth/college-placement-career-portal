import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getSocket } from '../../services/socket';
import {
  FileCheck2,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Video,
  Award,
  Sparkles,
  ChevronRight
} from 'lucide-react';

const STAGES = ['Applied', 'Under Review', 'Shortlisted', 'Assessment', 'Interview', 'Selected'];

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my-applications');
      if (res.data?.applications) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();

    // Listen to real-time status update from recruiter
    const socket = getSocket();
    if (socket) {
      const handleStatusUpdate = () => {
        fetchApplications();
      };
      socket.on('application:status_updated', handleStatusUpdate);
      return () => {
        socket.off('application:status_updated', handleStatusUpdate);
      };
    }
  }, []);

  const getStageIndex = (status) => {
    if (status === 'Rejected') return -1;
    return STAGES.indexOf(status);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Recruitment Application Tracking
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your recruitment journey across each stage in real time. Status changes by recruiters reflect immediately without refreshing.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading application lifecycle records...</div>
      ) : applications.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-xs rounded-3xl bg-white border border-slate-200">
          You haven't applied for any recruitment opportunities yet.
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isRejected = app.status === 'Rejected';
            const isSelected = app.status === 'Selected';

            return (
              <div
                key={app._id}
                className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6"
              >
                {/* Application Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                      {app.job?.companyName || 'Company'}
                    </span>
                    <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                      {app.job?.title || 'Job Opening'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Applied on {new Date(app.appliedAt).toLocaleDateString()} &bull; Package: {app.job?.salaryPackage?.ctc} LPA
                    </p>
                  </div>

                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isSelected
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {isSelected ? '🎉 Selected & Offered' : isRejected ? 'Rejected' : app.status}
                    </span>
                  </div>
                </div>

                {/* Visual Pipeline Bar */}
                {!isRejected && (
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2 overflow-x-auto">
                      {STAGES.map((stage, idx) => {
                        const isDone = idx <= currentStageIdx;
                        const isCurrent = idx === currentStageIdx;
                        return (
                          <div
                            key={stage}
                            className={`flex flex-col items-center flex-1 text-center min-w-[70px] ${
                              isCurrent
                                ? 'text-blue-600 font-extrabold'
                                : isDone
                                ? 'text-emerald-700'
                                : 'text-slate-400'
                            }`}
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center mb-1 text-xs font-bold transition-all ${
                                isCurrent
                                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                                  : isDone
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {isDone ? '✓' : idx + 1}
                            </div>
                            <span className="text-[10px] leading-tight">{stage}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${((currentStageIdx + 1) / STAGES.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Interview Information Banner if scheduled */}
                {app.interviewDetails && app.interviewDetails.scheduledAt && (
                  <div className="rounded-2xl bg-purple-50/70 border border-purple-200 p-4 text-xs text-purple-900 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-purple-800">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      Interview Scheduled: {app.interviewDetails.roundName || 'Technical Round'}
                    </div>
                    <p className="text-slate-700">
                      Date & Time: <strong>{new Date(app.interviewDetails.scheduledAt).toLocaleString()}</strong>
                    </p>
                    {app.interviewDetails.meetingLink && (
                      <p>
                        Meeting Link:{' '}
                        <a
                          href={app.interviewDetails.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-700 font-bold underline inline-flex items-center gap-1"
                        >
                          Join Video Call <ExternalLink className="w-3 h-3" />
                        </a>
                      </p>
                    )}
                    {app.interviewDetails.interviewerNotes && (
                      <p className="text-slate-600 italic">
                        Notes: "{app.interviewDetails.interviewerNotes}"
                      </p>
                    )}
                  </div>
                )}

                {/* Stage History Timeline */}
                {app.stageHistory && app.stageHistory.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Recruitment Activity Log
                    </h4>
                    <div className="space-y-2">
                      {app.stageHistory.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                        >
                          <span className="font-semibold text-slate-800">
                            {step.stage} &bull; <span className="text-slate-500 font-normal">{step.notes}</span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(step.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
