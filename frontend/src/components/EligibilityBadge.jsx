import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, HelpCircle, X } from 'lucide-react';

export default function EligibilityBadge({ isEligible, ineligibilityReasons = [], criteriaStatus = null, size = 'md' }) {
  const [showModal, setShowModal] = useState(false);

  if (isEligible === undefined || isEligible === null) {
    return null;
  }

  const badgeClasses = isEligible
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
    : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100';

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors ${badgeClasses} ${
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs'
        }`}
        title="Click to view eligibility breakdown"
      >
        {isEligible ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Eligible</span>
          </>
        ) : (
          <>
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Not Eligible</span>
            <AlertCircle className="w-3 h-3 text-rose-500 opacity-80" />
          </>
        )}
      </button>

      {/* Criteria Breakdown Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600" />
                )}
                <h3 className="text-base font-bold text-slate-900">
                  {isEligible ? 'Eligibility Verified' : 'Ineligibility Explanation'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {isEligible ? (
                <div className="rounded-xl bg-emerald-50 p-4 border border-emerald-100 text-sm text-emerald-800">
                  🎉 <strong>Congratulations!</strong> You satisfy all academic criteria (Branch, CGPA, Backlogs, Batch) specified by the recruiter for this opportunity.
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Unsatisfied Criteria:
                  </p>
                  <ul className="space-y-2">
                    {ineligibilityReasons.map((reason, idx) => (
                      <li
                        key={idx}
                        className="rounded-xl bg-rose-50 p-3 border border-rose-100 text-xs text-rose-800 flex items-start gap-2"
                      >
                        <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Criteria details table if available */}
              {criteriaStatus && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Detailed Verification Breakdown:
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block">CGPA Check</span>
                      <span className={`font-semibold ${criteriaStatus.cgpa?.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {criteriaStatus.cgpa?.studentValue} (Req: &ge; {criteriaStatus.cgpa?.required})
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block">Backlogs</span>
                      <span className={`font-semibold ${criteriaStatus.activeBacklogs?.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {criteriaStatus.activeBacklogs?.studentValue} active (Max: {criteriaStatus.activeBacklogs?.required})
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 col-span-2">
                      <span className="text-slate-500 block">Department</span>
                      <span className={`font-semibold ${criteriaStatus.branch?.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {criteriaStatus.branch?.studentValue}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
