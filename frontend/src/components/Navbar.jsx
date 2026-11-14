import React from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  GraduationCap,
  Briefcase,
  User,
  LogOut,
  FileCheck2,
  FileEdit,
  Video,
  Users2,
  BarChart3,
  PlusCircle,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab }) {
  const { user, role, logout } = useAuth();

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 border border-purple-200">Placement Admin</span>;
      case 'recruiter':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">Recruiter</span>;
      case 'student':
        return <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">Student</span>;
      default:
        return null;
    }
  };

  const navItems = () => {
    if (role === 'student') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: GraduationCap },
        { id: 'jobs', label: 'Placement Drives', icon: Briefcase },
        { id: 'applications', label: 'My Applications', icon: FileCheck2 },
        { id: 'ats', label: 'AI ATS Scanner', icon: FileCheck2, highlight: true },
        { id: 'improver', label: 'Resume Improver', icon: FileEdit },
        { id: 'mock', label: 'AI Mock Interview', icon: Video },
        { id: 'alumni', label: 'Alumni Network', icon: Users2 },
        { id: 'profile', label: 'My Profile', icon: User },
      ];
    } else if (role === 'recruiter') {
      return [
        { id: 'recruiter-dashboard', label: 'Dashboard', icon: BarChart3 },
        { id: 'post-job', label: 'Post Opening', icon: PlusCircle, highlight: true },
        { id: 'manage-jobs', label: 'Manage Jobs', icon: Briefcase },
        { id: 'company-profile', label: 'Company Profile', icon: User },
      ];
    } else if (role === 'admin') {
      return [
        { id: 'admin-dashboard', label: 'Command Center', icon: BarChart3 },
        { id: 'admin-students', label: 'Student Directory', icon: GraduationCap },
        { id: 'admin-jobs', label: 'Placement Drives', icon: Briefcase },
        { id: 'admin-analytics', label: 'Analytics & Reports', icon: BarChart3, highlight: true },
        { id: 'admin-announcements', label: 'Announcements', icon: Megaphone },
      ];
    }
    return [];
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-2">
                CPCM Portal
                {getRoleBadge()}
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Campus Placement & AI Career Hub
              </p>
            </div>
          </div>

          {/* User profile & real-time notification bell */}
          <div className="flex items-center gap-3">
            <NotificationDropdown />

            <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs uppercase">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                  {user?.email}
                </p>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems().map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : item.highlight
                    ? 'text-blue-700 bg-blue-50/70 hover:bg-blue-100/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-blue-600' : 'text-slate-500'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
