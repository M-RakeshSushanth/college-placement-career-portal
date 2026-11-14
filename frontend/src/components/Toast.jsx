import React from 'react';
import { Bell, X, ExternalLink } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export default function Toast() {
  const { toastNotification } = useNotifications();

  if (!toastNotification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-2xl bg-slate-900 text-white p-4 shadow-2xl border border-slate-700/50 flex items-start gap-3 animate-slide-in">
      <div className="p-2 bg-blue-600 rounded-xl shrink-0 mt-0.5">
        <Bell className="w-5 h-5 text-white animate-bounce" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
          New Live Update
        </h4>
        <p className="text-sm font-semibold mt-0.5 text-slate-100">
          {toastNotification.title}
        </p>
        <p className="text-xs text-slate-300 mt-1 leading-snug">
          {toastNotification.message}
        </p>
        {toastNotification.link && (
          <a
            href={toastNotification.link}
            className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold mt-2 underline"
          >
            Check Now <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}
