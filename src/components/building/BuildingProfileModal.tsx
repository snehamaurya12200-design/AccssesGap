import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building, AuditRecord, ItemAuditResponse } from '../../types';
import { AUDIT_QUESTIONS } from '../../utils/auditQuestions';
import { TRANSLATIONS } from '../../utils/translations';
import { getTierColorClass } from '../../utils/scoring';
import {
  X,
  MapPin,
  Building2,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  HeartHandshake,
  TrendingUp,
  TrendingDown,
  History,
  ShieldAlert,
  UserCheck,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';

const ALL_FACILITIES = [
  'Wheelchair Ramp',
  'Step-Free Entrance',
  'Accessible Elevator',
  'Tactile Paving',
  'Braille Signage',
  'Accessible Restroom',
  'Audio Hearing Loop',
  'Designated Parking',
];

export const BuildingProfileModal: React.FC = () => {
  const {
    buildingProfileModalId,
    setBuildingProfileModalId,
    buildings,
    getBuildingAudits,
    getLatestAudit,
    startAudit,
    setActiveView,
    setSelectedBuildingId,
    setShowReportProblemModal,
    language,
    userMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'barriers' | 'actions' | 'history'>('overview');

  const building = buildings.find((b) => b.id === buildingProfileModalId);
  const audits = building ? getBuildingAudits(building.id) : [];
  const latestAudit = building ? getLatestAudit(building.id) : undefined;
  const previousAudit = audits.length > 1 ? audits[1] : undefined;

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  if (!buildingProfileModalId || !building) return null;

  // Extract known barriers
  const knownBarriers: Array<{
    questionId: string;
    questionText: string;
    response: ItemAuditResponse;
  }> = [];

  // Extract corrective actions
  const correctiveActions: Array<{
    questionId: string;
    questionText: string;
    response: ItemAuditResponse;
  }> = [];

  if (latestAudit) {
    Object.entries(latestAudit.checklistResponses).forEach(([qId, resp]) => {
      const q = AUDIT_QUESTIONS.find((item) => item.id === qId);
      const text = q ? q.question : qId;

      if (resp.status === 'no' || resp.status === 'partially') {
        knownBarriers.push({ questionId: qId, questionText: text, response: resp });
        if (resp.recommendedFix || resp.actionStatus) {
          correctiveActions.push({ questionId: qId, questionText: text, response: resp });
        }
      }
    });
  }

  // Before & After comparison calculations (Section 9)
  const hasComparison = !!latestAudit && !!previousAudit;
  const prevScore = previousAudit?.overallScore ?? null;
  const currScore = latestAudit?.overallScore ?? null;
  const scoreDiff =
    currScore !== null && prevScore !== null ? currScore - prevScore : null;

  const prevBarriersCount = previousAudit?.totalBarriers ?? 0;
  const currBarriersCount = latestAudit?.totalBarriers ?? 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 text-slate-800 my-8 text-xs sm:text-sm">
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="flex items-start gap-4">
            <img
              src={building.imageUrl}
              alt={building.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  {building.category}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    building.verificationStatus === 'verified' || building.verificationStatus === 'verified_audit'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : building.verificationStatus === 'user_reported' || building.verificationStatus === 'citizen_reported'
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-rose-50 text-rose-900 border-rose-300'
                  }`}
                >
                  {t.verificationLabels[building.verificationStatus] || 'Verified'}
                </span>
              </div>
              <h2 id="profile-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                {building.name}
              </h2>
              <div className="text-xs text-slate-600 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{building.address}, {building.city}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setBuildingProfileModalId(null)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            aria-label="Close building profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Outdated Warning Notice if > 6 months */}
        {(building.verificationStatus === 'outdated' || building.verificationStatus === 'needs_reinspection') && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Inspection Outdated (&gt; 6 Months Ago)</div>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                This building was last checked on {building.lastAuditedDate || 'over 180 days ago'}. Physical conditions may have changed. A follow-up check is recommended.
              </p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`min-h-[40px] px-3.5 py-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Overview & Facilities
          </button>
          <button
            onClick={() => setActiveTab('barriers')}
            className={`min-h-[40px] px-3.5 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'barriers'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Known Barriers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
              {knownBarriers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`min-h-[40px] px-3.5 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'actions'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t.remediationLabel}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-700 font-bold">
              {correctiveActions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`min-h-[40px] px-3.5 py-2 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'history'
                ? 'border-teal-700 text-teal-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{t.previousChecks}</span>
            {audits.length > 1 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-teal-100 text-teal-800 font-bold">
                Before & After
              </span>
            )}
          </button>
        </div>

        {/* Tab 1: Overview & Facilities */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Score & Tier Banner */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500 font-semibold">Recorded Accessibility Score</div>
                <div className="text-base font-bold text-slate-900">{building.statusTier}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Last checked on {building.lastAuditedDate || 'Recently registered'} across {building.auditCount} check(s).
                </div>
              </div>
              <div className="text-right shrink-0">
                {building.currentScore !== null ? (
                  <>
                    <span className="font-mono text-3xl font-extrabold text-slate-900 tabular-nums">
                      {building.currentScore}
                    </span>
                    <span className="text-xs text-slate-400">/100</span>
                  </>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">Score Unavailable</span>
                )}
              </div>
            </div>

            {/* Description & Contact Details */}
            <div className="space-y-2">
              <p className="text-xs text-slate-700 leading-relaxed">{building.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{building.hours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{building.phone}</span>
                </div>
              </div>
            </div>

            {/* Verified Facilities Matrix */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Available Accessibility Facilities
                </h4>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  On-Site Verified
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {ALL_FACILITIES.map((fac) => {
                  const has = building.facilities.includes(fac);
                  return (
                    <div
                      key={fac}
                      className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                        has
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                      }`}
                    >
                      {has ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className="text-[11px] truncate">{fac}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Known Barriers */}
        {activeTab === 'barriers' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Documented Barriers & Obstacles</span>
              <span className="text-slate-500">{knownBarriers.length} barrier(s) recorded</span>
            </div>

            {knownBarriers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <div className="font-bold text-slate-800 text-xs">No Major Physical Barriers Recorded</div>
                <p className="text-slate-500 text-[11px]">
                  This building meets recorded universal accessibility guidelines for checked criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {knownBarriers.map((item) => (
                  <div
                    key={item.questionId}
                    className="p-3.5 rounded-xl border border-rose-200 bg-rose-50/60 space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900">{item.questionText}</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-200 text-rose-950 uppercase shrink-0">
                        {item.response.priority || 'High'} Priority
                      </span>
                    </div>
                    {item.response.notes && (
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        <strong>Observation:</strong> {item.response.notes}
                      </p>
                    )}
                    {item.response.location && (
                      <div className="text-[11px] text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>Location: {item.response.location}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Corrective Actions (How Can This Be Fixed?) */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">{t.remediationLabel}</span>
              <span className="text-slate-500">{correctiveActions.length} planned remediation(s)</span>
            </div>

            {correctiveActions.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <FileCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-slate-800 text-xs">No Corrective Actions Assigned</div>
                <p className="text-slate-500 text-[11px]">
                  Facility managers or auditors have not yet scheduled specific repairs for this building.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {correctiveActions.map((item) => (
                  <div
                    key={item.questionId}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-slate-900">{item.questionText}</div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-900 border border-sky-200">
                        {t.actionStatuses[item.response.actionStatus || 'reported']}
                      </span>
                    </div>
                    {item.response.recommendedFix && (
                      <p className="text-slate-700 text-[11px] leading-relaxed bg-slate-50 p-2 rounded-lg">
                        <strong>Suggested Fix:</strong> {item.response.recommendedFix}
                      </p>
                    )}
                    {item.response.assignedTo && (
                      <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                        <span>Responsible: <strong>{item.response.assignedTo}</strong></span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Previous Checks & Before-and-After Comparisons (Section 9) */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Section 9 Comparison Card if 2+ audits exist */}
            {hasComparison && (
              <div className="p-4 rounded-xl bg-teal-50 border-2 border-teal-200 space-y-3 text-xs">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-teal-700" />
                  <span>Before-and-After Check Comparison</span>
                </div>
                <p className="text-slate-600 text-[11px]">
                  Comparison computed from actual saved audit records ({previousAudit?.auditDate} vs {latestAudit?.auditDate}).
                </p>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-lg bg-white border border-teal-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Previous Score</div>
                    <div className="text-lg font-mono font-bold text-slate-700">
                      {prevScore !== null ? `${prevScore}/100` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-400">{previousAudit?.auditDate}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-teal-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Latest Score</div>
                    <div className="text-lg font-mono font-bold text-teal-900">
                      {currScore !== null ? `${currScore}/100` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-400">{latestAudit?.auditDate}</div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-teal-200">
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Difference</div>
                    <div
                      className={`text-lg font-mono font-bold ${
                        (scoreDiff || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {scoreDiff !== null ? `${scoreDiff > 0 ? '+' : ''}${scoreDiff}` : '—'} pts
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {(scoreDiff || 0) > 0 ? 'Improvement Verified' : 'No Change'}
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-white rounded-lg border border-teal-100 flex items-center justify-between text-[11px] text-slate-700">
                  <span>Barriers Remediated:</span>
                  <span className="font-bold text-emerald-800">
                    {Math.max(0, prevBarriersCount - currBarriersCount)} verified resolved
                  </span>
                </div>
              </div>
            )}

            {/* List of Previous Checks */}
            <div className="space-y-2">
              <div className="font-bold text-slate-700 text-xs">All Recorded Inspections ({audits.length})</div>
              {audits.map((a, idx) => (
                <div
                  key={a.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">
                      Check #{audits.length - idx}: {a.version === 1 ? 'Initial Baseline Check' : 'Follow-Up Re-Check'}
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      {a.auditDate} by {a.auditorName} ({a.auditorRole})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {a.overallScore !== null ? `${a.overallScore}/100` : 'Incomplete'}
                    </div>
                    <div className="text-[10px] text-slate-500">{a.totalBarriers} barriers found</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setBuildingProfileModalId(null);
                setSelectedBuildingId(building.id);
                setActiveView('assist');
              }}
              className="min-h-[44px] px-4 py-2 bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <HeartHandshake className="w-4 h-4 text-amber-800" />
              <span>I Need Help Visiting Here</span>
            </button>

            <button
              onClick={() => {
                setBuildingProfileModalId(null);
                setShowReportProblemModal(true, building.id);
              }}
              className="min-h-[44px] px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Report a Problem</span>
            </button>
          </div>

          <button
            onClick={() => {
              setBuildingProfileModalId(null);
              setSelectedBuildingId(building.id);
              startAudit(building.id, building.auditCount > 0);
            }}
            className="min-h-[44px] px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center gap-1.5 ml-auto"
          >
            <FileCheck className="w-4 h-4" />
            <span>{building.auditCount > 0 ? t.checkAgain : t.startNewAudit}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
