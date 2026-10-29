import React from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, MinusCircle, HelpCircle, ShieldAlert, AlertCircle } from 'lucide-react';
import { AUDIT_SECTIONS, AUDIT_QUESTIONS } from '../../utils/auditQuestions';

interface ScoringExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScoringExplainerModal: React.FC<ScoringExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scoring-method-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-teal-800" />
            <h2 id="scoring-method-title" className="text-base font-bold text-slate-900">
              AccessGap Transparent Scoring Methodology
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs text-slate-700">
          {/* Provisional Disclaimer */}
          <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Civic Innovation Prototype Assessment</span>
            </div>
            <p className="leading-relaxed">
              These scores and provisional tiers are calculated directly from verified inspection answers for the innovation prototype. They do not constitute an official engineering certification, legal building sign-off, or a guarantee that a building is fully barrier-free for every individual.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Transparent Scoring Rules</h3>
            <p className="leading-relaxed">
              Every question evaluates an essential accessibility barrier. Scores are calculated deterministically without opaque AI estimates or random weights:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-950 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Yes</strong> = 100 points</span>
              </div>
              <div className="p-2.5 rounded border border-amber-200 bg-amber-50 text-amber-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Partially</strong> = 50 points</span>
              </div>
              <div className="p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-950 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span><strong>No</strong> = 0 points</span>
              </div>
              <div className="p-2.5 rounded border border-slate-200 bg-slate-50 text-slate-800 flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-slate-500 shrink-0" />
                <span><strong>Not Applicable</strong> = Excluded</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1">
              <em>Not inspected</em> questions are excluded from the score calculation, but counted as incomplete in the assessment completion percentage.
            </p>
          </section>

          {/* Mathematical Formula */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-2 font-mono text-xs">
            <div className="text-teal-300 font-sans font-bold text-xs uppercase tracking-wider">
              Mathematical Score Formula
            </div>
            <div className="p-2.5 bg-slate-800 rounded border border-slate-700 text-teal-200 font-bold">
              Accessibility Score = (Total Points Earned ÷ Total Possible Points for Applicable, Inspected Questions) × 100
            </div>
            <div className="text-[11px] text-slate-300 font-sans">
              If all applicable questions are uninspected (or all not applicable), the system displays <strong>&quot;Score unavailable&quot;</strong> rather than fabricating a misleading rating.
            </div>
          </div>

          {/* Provisional Rating Tiers */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Provisional Rating Tiers</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50/70 flex items-start gap-3">
                <span className="font-mono font-bold text-emerald-900 text-sm shrink-0">80 – 100</span>
                <div>
                  <div className="font-bold text-emerald-900">Higher recorded accessibility score</div>
                  <p className="text-emerald-800 text-[11px] mt-0.5">
                    Essential entrances, internal paths, and facilities satisfy recorded standards with minimal or zero physical barriers.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-amber-300 bg-amber-50/70 flex items-start gap-3">
                <span className="font-mono font-bold text-amber-900 text-sm shrink-0">60 – 79</span>
                <div>
                  <div className="font-bold text-amber-900">Improvements recommended</div>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    Core public services can be reached, but moderate barriers (e.g. heavy doors, missing tactile signs, or high counters) require remediation.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-rose-300 bg-rose-50/70 flex items-start gap-3">
                <span className="font-mono font-bold text-rose-900 text-sm shrink-0">0 – 59</span>
                <div>
                  <div className="font-bold text-rose-900">Significant barriers identified</div>
                  <p className="text-rose-800 text-[11px] mt-0.5">
                    Major physical obstructions exist (such as entrance stairs without ramps or inaccessible toilets), preventing independent access. Urgent remediation required.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Critical Barrier Safeguard */}
          <section className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>Independent Critical Barrier Safeguard</span>
            </div>
            <p className="text-[11px] text-rose-800 leading-relaxed">
              A high overall score never conceals severe individual barriers. Questions designated as critical (such as zero step-free entry or lack of accessible toilets) are flagged and tracked independently of the percentage score.
            </p>
          </section>

          {/* Section Summary */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">Inspection Sections & Scope ({AUDIT_QUESTIONS.length} Questions)</h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Section</th>
                    <th className="py-2 px-3">Questions</th>
                    <th className="py-2 px-3">Universal Standard Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {AUDIT_SECTIONS.map((sec) => {
                    const count = AUDIT_QUESTIONS.filter((q) => q.sectionId === sec.id).length;
                    return (
                      <tr key={sec.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-medium text-slate-900">{sec.title}</td>
                        <td className="py-2 px-3 font-mono">{count} items</td>
                        <td className="py-2 px-3 text-slate-500">ISO 21542 / ADA Standards</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close Methodology
          </button>
        </div>
      </div>
    </div>
  );
};
