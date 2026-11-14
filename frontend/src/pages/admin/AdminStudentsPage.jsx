import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  GraduationCap,
  Search,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Filter,
  FileText
} from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/admin/all');
      if (res.data?.students) {
        setStudents(res.data.students);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToggle = async (profileId, currentStatus) => {
    try {
      const res = await api.put(`/students/admin/verify/${profileId}`, {
        isProfileVerified: !currentStatus,
      });
      if (res.data?.success) {
        setStudents((prev) =>
          prev.map((s) => (s._id === profileId ? { ...s, isProfileVerified: !currentStatus } : s))
        );
      }
    } catch (err) {
      alert('Verification update failed');
    }
  };

  const filtered = students.filter((s) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = s.user?.name?.toLowerCase().includes(q) || s.registrationNumber?.toLowerCase().includes(q);
    const deptMatch = departmentFilter === 'All' || s.department === departmentFilter;
    return nameMatch && deptMatch;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Student Directory & Academic Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Verify academic records, semester grades, and backlogs to confirm eligibility for placement drives.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search student or roll no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs bg-slate-50 focus:bg-white"
          />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-xs bg-slate-50"
          >
            <option value="All">All Departments</option>
            <option value="Computer Science & Engineering">CSE</option>
            <option value="Information Technology">IT</option>
            <option value="Electronics & Communication">ECE</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading student records...</div>
      ) : (
        <div className="rounded-3xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll Number</th>
                  <th className="p-4">Department & Batch</th>
                  <th className="p-4">CGPA</th>
                  <th className="p-4">Active Backlogs</th>
                  <th className="p-4">Placement Status</th>
                  <th className="p-4 text-right">Academic Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filtered.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-slate-900 block">{s.user?.name}</span>
                        <span className="text-[11px] text-slate-400">{s.user?.email}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono font-bold text-slate-800">{s.registrationNumber}</td>
                    <td className="p-4">
                      <div>
                        <span>{s.department}</span>
                        <span className="text-[10px] text-slate-400 block">Class of {s.graduationYear}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-blue-600">{s.cgpa}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${s.activeBacklogs > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {s.activeBacklogs}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          s.placementStatus === 'placed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {s.placementStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleVerifyToggle(s._id, s.isProfileVerified)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                          s.isProfileVerified
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {s.isProfileVerified ? 'Verified ✓' : 'Mark Verified'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
