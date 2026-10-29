import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  PriorityLevel,
  CorrectiveActionStatus,
  AuditRecord,
} from '../../types';
import { AUDIT_QUESTIONS, AUDIT_SECTIONS } from '../../utils/auditQuestions';
import { getTierColorClass } from '../../utils/scoring';
import { TRANSLATIONS } from '../../utils/translations';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  HeartHandshake,
  Plus,
  HelpCircle,
  Calendar,
  History,
  FileCheck,
  Check,
  Clock,
  Printer,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
  Save,
  Search,
  Filter,
  Ruler,
  Tag,
  RefreshCw,
} from 'lucide-react';
import { ScoringExplainerModal } from './ScoringExplainerModal';
import { RegisterBuildingModal } from './RegisterBuildingModal';

export const AuditDashboard: React.FC = () => {
  const {
    buildings,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedBuilding,
    startAudit,
    resumeDraft,
    hasSavedDraft,
    getBuildingAudits,
    getLatestAudit,
    setActiveView,
    updateIssueActionStatus,
    citizenReportBarrier,
    userMode,
    setUserMode,
    language,
    setBuildingProfileModalId,
    setShowReportProblemModal,
  } = useApp();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | PriorityLevel>('all');
  const [actionStatusFilter, setActionStatusFilter] = useState<'all' | CorrectiveActionStatus>('all');
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [activePhotoModal, setActivePhotoModal] = useState<string | null>(null);
  const [showPrintReport, setShowPrintReport] = useState(false);
  const [selectedAuditForComparison, setSelectedAuditForComparison] = useState<AuditRecord | null>(null);

  // Verification & Accountability modal state
  const [verificationTarget, setVerificationTarget] = useState<{
    questionId: string;
    questionText: string;
    assignedTo?: string;
    recommendedFix?: string;
  } | null>(null);
  const [verifyDecision, setVerifyDecision] = useState<'passed' | 'failed'>('passed');
  const [verifyNotes, setVerifyNotes] = useState('');
  const [verifierName, setVerifierName] = useState('Municipal Accessibility Inspector');
  const [expandedHistoryFor, setExpandedHistoryFor] = useState<string | null>(null);

  // Citizen Report Barrier state
  const [showCitizenReportModal, setShowCitizenReportModal] = useState(false);
  const [citizenReportQuestionId, setCitizenReportQuestionId] = useState(AUDIT_QUESTIONS[0].id);
  const [citizenReportNotes, setCitizenReportNotes] = useState('');
  const [citizenReportLocation, setCitizenReportLocation] = useState('');

  const currentBuilding = selectedBuilding || buildings[0];
  const buildingAudits = currentBuilding ? getBuildingAudits(currentBuilding.id) : [];
  const latestAudit = currentBuilding ? getLatestAudit(currentBuilding.id) : undefined;
  const priorAudit = buildingAudits.length > 1 ? buildingAudits[1] : undefined;

  // Aggregate Dashboard Statistics (Computed dynamically from actual records)
  const auditedBuildings = buildings.filter((b) => b.auditCount > 0);
  const totalAuditedCount = auditedBuildings.length;

  const validScores = auditedBuildings
    .map((b) => b.currentScore)
    .filter((s): s is number => s !== null);
  const avgScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, s) => sum + s, 0) / validScores.length)
      : null;

  const urgentCount = buildings.filter(
    (b) => b.urgentImprovementsNeeded || (b.currentScore !== null && b.currentScore < 60)
  ).length;

  const totalResolvedCount = buildings.reduce((sum, b) => sum + b.resolvedIssuesCount, 0);

  // Issues extracted from latest audit of selected building
  const issuesList = useMemo(() => {
    if (!latestAudit) return [];
    const list: Array<{
      questionId: string;
      question: (typeof AUDIT_QUESTIONS)[0];
      status: string;
      priority: PriorityLevel;
      location?: string;
      measurement?: string;
      notes?: string;
      photoUrl?: string;
      recommendedFix?: string;
      actionStatus: CorrectiveActionStatus;
      assignedTo?: string;
      actionDate?: string;
      actionNotes?: string;
      verificationResult?: 'passed' | 'failed' | 'pending';
      verificationNotes?: string;
      verifiedBy?: string;
      flaggedForReinspection?: boolean;
      actionHistory: Array<{
        id: string;
        date: string;
        fromStatus: CorrectiveActionStatus;
        toStatus: CorrectiveActionStatus;
        note: string;
        actor: string;
      }>;
    }> = [];

    for (const q of AUDIT_QUESTIONS) {
      const resp = latestAudit.checklistResponses[q.id];
      if (resp && (resp.status === 'no' || resp.status === 'partially')) {
        list.push({
          questionId: q.id,
          question: q,
          status: resp.status,
          priority: resp.priority || q.defaultPriority,
          location: resp.location,
          measurement: resp.measurement,
          notes: resp.notes,
          photoUrl: resp.photoUrl,
          recommendedFix: resp.recommendedFix,
          actionStatus: resp.actionStatus || 'reported',
          assignedTo: resp.assignedTo,
          actionDate: resp.actionDate,
          actionNotes: resp.actionNotes,
          verificationResult: resp.verificationResult,
          verificationNotes: resp.verificationNotes,
          verifiedBy: resp.verifiedBy,
          flaggedForReinspection: resp.flaggedForReinspection,
          actionHistory: resp.actionHistory || [],
        });
      }
    }
    return list;
  }, [latestAudit]);

  const filteredIssues = issuesList.filter((issue) => {
    if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
    if (actionStatusFilter !== 'all' && issue.actionStatus !== actionStatusFilter) return false;
    return true;
  });

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.district.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      return true;
    });
  }, [buildings, searchQuery, categoryFilter]);

  const handleStartAudit = (isReaudit: boolean) => {
    if (currentBuilding) {
      startAudit(currentBuilding.id, isReaudit);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              AccessGap Municipal Audit Workflow
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">
              AUDIT → SCORE → PRIORITISE → FIX → RE-AUDIT
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Public Buildings Accessibility Dashboard
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Standardized physical accessibility inspections to evaluate government service facilities, document structural barriers, and track verified civic remediations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {hasSavedDraft && (
            <button
              onClick={resumeDraft}
              className="min-h-[44px] px-4 py-2 text-xs font-bold text-teal-900 bg-teal-50 border border-teal-300 hover:bg-teal-100 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-teal-700"
            >
              <Save className="w-4 h-4 text-teal-700" />
              <span>{t.resumeDraft}</span>
            </button>
          )}

          <button
            onClick={() => setShowRegisterModal(true)}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg flex items-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>{t.registerNewBuilding}</span>
          </button>

          <button
            onClick={() => handleStartAudit(false)}
            className="min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <FileCheck className="w-4 h-4" />
            <span>{t.startNewAudit}</span>
          </button>
        </div>
      </div>

      {/* Civic Key Metrics Strip (Section 3.A) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">{t.totalAudited}</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tabular-nums">
            {totalAuditedCount} <span className="text-xs font-normal text-slate-400">/ {buildings.length} total</span>
          </div>
          <div className="text-[11px] text-slate-500">Active public facility records</div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">{t.avgScore}</div>
          <div className="text-2xl sm:text-3xl font-black text-teal-800 font-mono tabular-nums">
            {avgScore !== null ? (
              <>
                {avgScore}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </>
            ) : (
              <span className="text-lg font-bold text-slate-400">N/A</span>
            )}
          </div>
          <div className="text-[11px] text-slate-500">Across audited public spaces</div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">{t.urgentNeeds}</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 font-mono tabular-nums">
            {urgentCount}
          </div>
          <div className="text-[11px] text-slate-500">Critical barriers or score &lt; 60</div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1 shadow-xs">
          <div className="text-xs text-slate-500 font-semibold">{t.resolvedIssues}</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tabular-nums">
            {totalResolvedCount}
          </div>
          <div className="text-[11px] text-slate-500">Remediations marked completed</div>
        </div>
      </div>

      {/* Main 2-Column Split: Buildings Registry vs Selected Building Detail Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 cols): Buildings Registry */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Public Buildings Registry ({filteredBuildings.length})
            </h3>
            <button
              onClick={() => setShowRegisterModal(true)}
              className="text-xs text-teal-800 hover:text-teal-950 font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Building</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search building name or locality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 bg-white"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCategoryFilter('Government offices')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'Government offices'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Government
              </button>
              <button
                onClick={() => setCategoryFilter('Hospitals and healthcare centres')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'Hospitals and healthcare centres'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Healthcare
              </button>
              <button
                onClick={() => setCategoryFilter('Banks and public service centres')}
                className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors ${
                  categoryFilter === 'Banks and public service centres'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Services
              </button>
            </div>
          </div>

          {/* Building Cards List */}
          <div className="space-y-3">
            {filteredBuildings.map((bldg) => {
              const isSelected = bldg.id === currentBuilding?.id;
              const tierStyle = getTierColorClass(bldg.statusTier);

              return (
                <div
                  key={bldg.id}
                  onClick={() => setSelectedBuildingId(bldg.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all text-left ${
                    isSelected
                      ? 'bg-white border-teal-800 shadow-sm ring-2 ring-teal-800'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="text-[11px] font-semibold text-slate-500 truncate">
                        {bldg.category} · {bldg.district}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {bldg.name}
                      </h4>
                      <p className="text-xs text-slate-600 truncate">{bldg.address}</p>
                    </div>

                    {/* Score badge */}
                    <div className="text-right shrink-0">
                      {bldg.currentScore !== null ? (
                        <div className="font-mono font-bold text-base text-slate-900 tabular-nums">
                          {bldg.currentScore}
                          <span className="text-[10px] text-slate-400 font-normal">/100</span>
                        </div>
                      ) : (
                        <div className="text-xs font-semibold text-slate-500">Unscored</div>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] ${tierStyle.badge}`}>
                        {bldg.statusTier}
                      </span>
                    </div>
                  </div>

                  {/* Metadata line */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bldg.lastAuditedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {bldg.urgentImprovementsNeeded && (
                        <span className="text-rose-700 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>Urgent Gaps</span>
                        </span>
                      )}
                      <span>·</span>
                      <span>{bldg.auditCount} {bldg.auditCount === 1 ? 'audit' : 'audits'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 cols): Selected Building Inspection & Action Console */}
        <div className="lg:col-span-7 space-y-6">
          {currentBuilding ? (
            <div className="space-y-6">
              {/* Building Overview Card */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
                {/* Exterior Photo Banner */}
                <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                  <img
                    src={currentBuilding.imageUrl}
                    alt={currentBuilding.name}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="flex items-center gap-2 text-xs text-slate-300 mb-1">
                      <span>{currentBuilding.category}</span>
                      <span>·</span>
                      <span>{currentBuilding.district}, {currentBuilding.city}</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold leading-tight drop-shadow-xs">
                      {currentBuilding.name}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">{currentBuilding.address}</p>
                  </div>
                </div>

                {/* Score, Actions & Completion */}
                <div className="p-5 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    {/* Score Block */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-mono shrink-0">
                        {currentBuilding.currentScore !== null ? (
                          <>
                            <span className="text-2xl font-bold tabular-nums">
                              {currentBuilding.currentScore}
                            </span>
                            <span className="text-[10px] text-slate-400">out of 100</span>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 text-center px-1">
                            Pending
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 font-semibold">Provisional Accessibility Tier</div>
                        <div className="text-base font-bold text-slate-900">
                          {currentBuilding.statusTier}
                        </div>
                        <div className="text-xs text-slate-500">
                          {latestAudit
                            ? `Version ${latestAudit.version} · Audited by ${latestAudit.auditorName} on ${latestAudit.auditDate}`
                            : 'No completed inspection recorded yet'}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleStartAudit(currentBuilding.auditCount > 0)}
                        className="min-h-[44px] flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-teal-700"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>{currentBuilding.auditCount > 0 ? t.checkAgain : t.startNewAudit}</span>
                      </button>

                      <button
                        onClick={() => setBuildingProfileModalId(currentBuilding.id)}
                        className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
                        title="View Full Building Profile & History"
                      >
                        <Building2 className="w-3.5 h-3.5 text-teal-800" />
                        <span>Profile & History</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedBuildingId(currentBuilding.id);
                          setActiveView('map');
                        }}
                        className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5 text-teal-800" />
                        <span>View Map</span>
                      </button>

                      <button
                        onClick={() => setShowPrintReport(true)}
                        className="min-h-[44px] min-w-[44px] p-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center"
                        title="Print / Export Accessibility Audit Report"
                        aria-label="Export audit report"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Re-Audit Improvement Demonstration Banner (Section 3.H) */}
                  {priorAudit && latestAudit && (
                    <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-emerald-950 text-sm">
                          <TrendingUp className="w-4 h-4 text-emerald-700" />
                          <span>Demonstrated Accessibility Improvement</span>
                        </div>
                        {latestAudit.overallScore !== null && priorAudit.overallScore !== null && (
                          <span className="font-mono font-bold text-emerald-900 bg-emerald-200/80 px-2.5 py-0.5 rounded text-xs">
                            +{latestAudit.overallScore - priorAudit.overallScore} Points Gain
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-emerald-950 pt-1">
                        <div>
                          <span className="text-slate-600">Initial Audit ({priorAudit.auditDate}):</span>{' '}
                          <strong className="font-mono">{priorAudit.overallScore ?? 'N/A'}/100</strong>
                        </div>
                        <div>
                          <span className="text-slate-600">Re-Audit Verified ({latestAudit.auditDate}):</span>{' '}
                          <strong className="font-mono">{latestAudit.overallScore ?? 'N/A'}/100</strong>
                        </div>
                      </div>
                      <p className="text-emerald-900 leading-relaxed pt-1 border-t border-emerald-200">
                        {latestAudit.summary}
                      </p>
                    </div>
                  )}

                  {/* Scores by 5 Standard Sections */}
                  {latestAudit && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Scores by Physical Section
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {AUDIT_SECTIONS.map((sec) => {
                          const sScore = latestAudit.sectionScores[sec.id] || {
                            earned: 0,
                            possible: 0,
                            percent: 100,
                          };
                          return (
                            <div key={sec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                              <div className="flex items-center justify-between font-semibold">
                                <span className="text-slate-800">{sec.shortTitle}</span>
                                <span className="font-mono text-slate-900 tabular-nums">
                                  {sScore.possible > 0 ? `${sScore.percent}%` : '—'}
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    sScore.percent >= 80
                                      ? 'bg-emerald-600'
                                      : sScore.percent >= 60
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${sScore.possible > 0 ? sScore.percent : 0}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Identified Accessibility Barriers & Corrective Actions Tracker (Sections 3.F & 3.G) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {userMode === 'citizen'
                          ? 'Recorded Physical Barriers & How They Can Be Fixed'
                          : 'Civic Barriers & Repair Accountability Log'}{' '}
                        ({issuesList.length})
                      </h4>
                      {currentBuilding.unverifiedFixesCount > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                          {currentBuilding.unverifiedFixesCount} Fix Reported (Waiting for Another Check)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {userMode === 'citizen'
                        ? 'Understand barriers documented during checks, view reported repairs, and submit barrier reports.'
                        : 'Track physical barriers: Reported → Assigned → Work Started → Waiting for Another Check → Verified Resolved.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {/* Citizen Mode: Report Barrier Button */}
                    {userMode === 'citizen' && (
                      <button
                        onClick={() => setShowCitizenReportModal(true)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Report Barrier Here</span>
                      </button>
                    )}

                    {/* Priority Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                      {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => setPriorityFilter(p)}
                          className={`px-2 py-1 rounded-md font-semibold capitalize transition-colors min-h-[32px] ${
                            priorityFilter === p
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accountability 5-State Filter Bar */}
                <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-lg text-xs overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-500 uppercase px-2 shrink-0">
                    Status:
                  </span>
                  {(
                    [
                      'all',
                      'reported',
                      'assigned',
                      'in_progress',
                      'awaiting_verification',
                      'verified_resolved',
                    ] as const
                  ).map((s) => {
                    const label =
                      s === 'all'
                        ? 'All Issues'
                        : s === 'reported'
                        ? 'Reported'
                        : s === 'assigned'
                        ? 'Assigned'
                        : s === 'in_progress'
                        ? 'Work Started'
                        : s === 'awaiting_verification'
                        ? 'Waiting for Another Check'
                        : 'Verified Resolved';

                    return (
                      <button
                        key={s}
                        onClick={() => setActionStatusFilter(s)}
                        className={`px-2.5 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors min-h-[34px] ${
                          actionStatusFilter === s
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {filteredIssues.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500 space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                    <p className="font-bold text-slate-700">No issues matching this filter</p>
                    <p>All inspected criteria satisfy recorded accessibility standards.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredIssues.map((issue) => {
                      const isResolved = issue.actionStatus === 'verified_resolved';
                      const isAwaiting = issue.actionStatus === 'awaiting_verification';
                      const isInProgress = issue.actionStatus === 'in_progress';
                      const isAssigned = issue.actionStatus === 'assigned';
                      const isHistoryExpanded = expandedHistoryFor === issue.questionId;

                      return (
                        <div
                          key={issue.questionId}
                          className={`p-4 rounded-xl border text-xs space-y-3 transition-all ${
                            isResolved
                              ? 'bg-emerald-50/40 border-emerald-300'
                              : isAwaiting
                              ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-200'
                              : issue.priority === 'high'
                              ? 'bg-rose-50/40 border-rose-300'
                              : 'bg-slate-50/60 border-slate-200'
                          }`}
                        >
                          {/* Issue Header */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                                    issue.priority === 'high'
                                      ? 'bg-rose-100 text-rose-900 border border-rose-200'
                                      : issue.priority === 'medium'
                                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                      : 'bg-blue-100 text-blue-900 border border-blue-200'
                                  }`}
                                >
                                  {issue.priority} Priority
                                </span>
                                {issue.question.isCritical && (
                                  <span className="text-rose-700 font-bold text-[10px]">
                                    ★ Critical Barrier
                                  </span>
                                )}
                                <span className="text-slate-400">·</span>
                                <span className="text-slate-500 font-mono">
                                  {issue.status === 'no'
                                    ? 'Non-Compliant (0 pts)'
                                    : 'Partially Accessible (50 pts)'}
                                </span>
                              </div>

                              <h5 className="font-bold text-slate-900 text-sm leading-snug">
                                {issue.question.question}
                              </h5>
                            </div>

                            {/* Accountability State Badge & Controls */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                              {/* Status Badge */}
                              <span
                                className={`px-2.5 py-1 rounded-md text-[11px] font-bold border ${
                                  isResolved
                                    ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                                    : isAwaiting
                                    ? 'bg-amber-100 text-amber-950 border-amber-400 animate-pulse'
                                    : isInProgress
                                    ? 'bg-blue-100 text-blue-950 border-blue-300'
                                    : isAssigned
                                    ? 'bg-indigo-100 text-indigo-950 border-indigo-300'
                                    : 'bg-slate-100 text-slate-800 border-slate-300'
                                }`}
                              >
                                {t.actionStatuses[issue.actionStatus] || issue.actionStatus}
                              </span>

                              {/* Auditor Workflow Selector */}
                              {userMode === 'auditor' && (
                                <select
                                  value={issue.actionStatus}
                                  onChange={(e) =>
                                    updateIssueActionStatus(
                                      currentBuilding.id,
                                      issue.questionId,
                                      e.target.value as CorrectiveActionStatus
                                    )
                                  }
                                  className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs font-semibold bg-white text-slate-900 min-h-[36px]"
                                >
                                  <option value="reported">1. Reported</option>
                                  <option value="assigned">2. Assigned</option>
                                  <option value="in_progress">3. Work Started</option>
                                  <option value="awaiting_verification">4. Waiting for Another Check</option>
                                  <option value="verified_resolved">5. Verified Resolved</option>
                                </select>
                              )}
                            </div>
                          </div>

                          {/* Location & Measurements */}
                          {(issue.location || issue.measurement) && (
                            <div className="flex flex-wrap items-center gap-4 text-slate-700 bg-white/80 p-2.5 rounded-lg border border-slate-200">
                              {issue.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                                  <span>
                                    <strong>Location:</strong> {issue.location}
                                  </span>
                                </div>
                              )}
                              {issue.measurement && (
                                <div className="flex items-center gap-1">
                                  <Ruler className="w-3.5 h-3.5 text-slate-500" />
                                  <span>
                                    <strong>Measurements:</strong> {issue.measurement}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Observed notes */}
                          {issue.notes && (
                            <p className="text-slate-700 leading-relaxed">
                              <strong>Observation:</strong> {issue.notes}
                            </p>
                          )}

                          {/* Recommended Fix & Accountability Assignment */}
                          <div className="bg-white/90 p-3 rounded-lg border border-slate-200 space-y-2">
                            {issue.recommendedFix && (
                              <div>
                                <span className="font-bold text-slate-900">
                                  Recommended Corrective Action:
                                </span>
                                <p className="text-slate-700 leading-relaxed mt-0.5">
                                  {issue.recommendedFix}
                                </p>
                              </div>
                            )}

                            {/* Department / Contractor Assignment */}
                            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-[11px]">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-700">
                                  Responsible Department / Contractor:
                                </span>
                                {userMode === 'auditor' ? (
                                  <input
                                    type="text"
                                    placeholder="e.g. Public Works Directorate / Building Maintenance"
                                    defaultValue={issue.assignedTo || ''}
                                    onBlur={(e) =>
                                      updateIssueActionStatus(
                                        currentBuilding.id,
                                        issue.questionId,
                                        issue.actionStatus,
                                        e.target.value
                                      )
                                    }
                                    className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900 w-64"
                                  />
                                ) : (
                                  <span className="font-bold text-slate-900">
                                    {issue.assignedTo || 'Pending Municipal Assignment'}
                                  </span>
                                )}
                              </div>

                              {issue.actionDate && (
                                <div className="text-slate-500">
                                  Status updated: <strong>{issue.actionDate}</strong>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Physical Verification Findings Alert if applicable */}
                          {issue.verificationResult && (
                            <div
                              className={`p-2.5 rounded-lg border text-xs flex items-start gap-2 ${
                                issue.verificationResult === 'passed'
                                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                                  : 'bg-rose-50 text-rose-950 border-rose-300'
                              }`}
                            >
                              <ShieldCheck
                                className={`w-4 h-4 mt-0.5 shrink-0 ${
                                  issue.verificationResult === 'passed'
                                    ? 'text-emerald-700'
                                    : 'text-rose-700'
                                }`}
                              />
                              <div className="space-y-0.5">
                                <div className="font-bold">
                                  {issue.verificationResult === 'passed'
                                    ? 'Physical On-Site Verification: PASSED'
                                    : 'Physical On-Site Verification: REJECTED (Substandard / Barrier Persists)'}
                                </div>
                                {issue.verificationNotes && (
                                  <p className="leading-relaxed">
                                    Notes: {issue.verificationNotes}
                                  </p>
                                )}
                                {issue.verifiedBy && (
                                  <div className="text-[11px] opacity-80">
                                    Verified by: {issue.verifiedBy}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Why It Matters */}
                          <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200">
                            <strong>Disability Impact:</strong> {issue.question.whyItMatters}
                          </div>

                          {/* Action Toolbar: Photo evidence, Conduct Physical Verification, View Timeline */}
                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2">
                              {issue.photoUrl ? (
                                <button
                                  onClick={() => setActivePhotoModal(issue.photoUrl || null)}
                                  className="group flex items-center gap-2 border border-slate-300 rounded-lg p-1 bg-white hover:border-teal-700 min-h-[36px]"
                                >
                                  <img
                                    src={issue.photoUrl}
                                    alt="Barrier Evidence"
                                    className="w-10 h-8 object-cover rounded"
                                  />
                                  <span className="text-[11px] text-teal-800 font-semibold group-hover:underline">
                                    View Photo Evidence
                                  </span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400">No photo recorded</span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {/* Trigger Physical Verification modal (Auditor mode) */}
                              {userMode === 'auditor' &&
                                (issue.actionStatus === 'awaiting_verification' ||
                                  issue.actionStatus === 'in_progress' ||
                                  issue.actionStatus === 'assigned') && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setVerificationTarget({
                                        questionId: issue.questionId,
                                        questionText: issue.question.question,
                                        assignedTo: issue.assignedTo,
                                        recommendedFix: issue.recommendedFix,
                                      })
                                    }
                                    className="min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 transition-colors flex items-center gap-1.5 shadow-xs"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
                                    <span>Conduct Physical Verification</span>
                                  </button>
                                )}

                              {/* Toggle Action History Timeline */}
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedHistoryFor(
                                    isHistoryExpanded ? null : issue.questionId
                                  )
                                }
                                className="min-h-[38px] px-3 py-1.5 rounded-lg font-semibold text-xs border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                              >
                                <History className="w-3.5 h-3.5 text-slate-500" />
                                <span>
                                  {isHistoryExpanded ? 'Hide Audit Trail' : `View Audit Trail (${issue.actionHistory.length})`}
                                </span>
                              </button>

                              {/* Flag for Re-inspection */}
                              <button
                                type="button"
                                onClick={() =>
                                  updateIssueActionStatus(
                                    currentBuilding.id,
                                    issue.questionId,
                                    issue.actionStatus,
                                    issue.assignedTo,
                                    undefined,
                                    undefined,
                                    undefined,
                                    undefined,
                                    !issue.flaggedForReinspection
                                  )
                                }
                                className={`min-h-[38px] px-3 py-1.5 rounded-lg font-semibold text-xs border transition-colors flex items-center gap-1.5 ${
                                  issue.flaggedForReinspection
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                                }`}
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>
                                  {issue.flaggedForReinspection
                                    ? 'Flagged for Re-Audit'
                                    : 'Flag for Re-Audit'}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Expandable Action History Timeline */}
                          {isHistoryExpanded && (
                            <div className="mt-3 pt-3 border-t border-slate-200 bg-white p-3 rounded-lg space-y-2">
                              <div className="font-bold text-slate-900 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                <History className="w-3.5 h-3.5 text-teal-800" />
                                <span>Corrective Action History & Verification Log</span>
                              </div>

                              {issue.actionHistory.length === 0 ? (
                                <p className="text-slate-400 text-[11px] italic">
                                  No status transitions recorded yet for this barrier.
                                </p>
                              ) : (
                                <div className="divide-y divide-slate-100 space-y-2 text-[11px]">
                                  {issue.actionHistory.map((entry, idx) => (
                                    <div key={entry.id || idx} className="pt-2 first:pt-0 space-y-0.5">
                                      <div className="flex items-center justify-between text-slate-600">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-900">{entry.actor}</span>
                                          <span>·</span>
                                          <span>{entry.date}</span>
                                        </div>
                                        <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                          {entry.fromStatus} → {entry.toStatus}
                                        </span>
                                      </div>
                                      <p className="text-slate-800 leading-relaxed font-medium">
                                        {entry.note}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Audit History & Version Log (Section 3.I) */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-teal-800" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Audit History Log ({buildingAudits.length})
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowPrintReport(true)}
                    className="text-xs text-teal-800 hover:text-teal-950 font-semibold flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Summary</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {buildingAudits.map((rec) => (
                    <div key={rec.id} className="py-3.5 space-y-1.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">Version {rec.version}.0</span>
                          <span>·</span>
                          <span className="text-slate-500">{rec.auditDate}</span>
                          <span>·</span>
                          <span className="text-slate-600">{rec.auditorName} ({rec.auditorRole})</span>
                        </div>
                        <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                          {rec.overallScore !== null ? `${rec.overallScore}/100` : 'Unavailable'}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{rec.summary}</p>
                      <div className="text-[11px] text-slate-500">
                        {rec.totalAnswered} questions answered · {rec.completionPercentage}% completion · {rec.totalBarriers} barriers documented
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
              <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="mt-2 text-sm font-bold text-slate-900">No Building Selected</h4>
              <p className="text-xs text-slate-500 mt-1">
                Choose a building from the list to view its audit record or conduct an inspection.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Register Building Modal */}
      <RegisterBuildingModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={(newId) => {
          setSelectedBuildingId(newId);
          startAudit(newId, false);
        }}
      />

      {/* Photo Lightbox Modal */}
      {activePhotoModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActivePhotoModal(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-semibold">Photographic Evidence</span>
              <button
                onClick={() => setActivePhotoModal(null)}
                className="text-slate-400 hover:text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <img
              src={activePhotoModal}
              alt="Enlarged photo evidence"
              className="w-full max-h-[75vh] object-contain bg-slate-950"
            />
          </div>
        </div>
      )}

      {/* Formatted Printable Audit Summary Report Modal (Section 3.I) */}
      {showPrintReport && currentBuilding && latestAudit && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-8 space-y-6 border border-slate-300 print:shadow-none print:p-0 print:border-none print:max-h-none">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                  AccessGap Civic Infrastructure Audit Report
                </div>
                <h3 className="text-2xl font-bold text-slate-900">{currentBuilding.name}</h3>
                <div className="text-xs text-slate-600 mt-1">
                  {currentBuilding.address}, {currentBuilding.district}, {currentBuilding.city}
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black font-mono text-slate-900">
                  {currentBuilding.currentScore !== null ? `${currentBuilding.currentScore}/100` : 'Score Unavailable'}
                </div>
                <div className="text-xs font-bold text-teal-800">{currentBuilding.statusTier}</div>
              </div>
            </div>

            {/* Assessment Scope */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div><strong>Auditor:</strong> {latestAudit.auditorName}</div>
              <div><strong>Inspection Date:</strong> {latestAudit.auditDate}</div>
              <div><strong>Version:</strong> {latestAudit.version}.0</div>
              <div><strong>Completion:</strong> {latestAudit.completionPercentage}%</div>
            </div>

            {/* Re-Audit comparison if available */}
            {priorAudit && (
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-300 text-xs text-emerald-950 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Improvement Recorded Over Baseline Assessment</span>
                </div>
                <p>
                  Initial audit on {priorAudit.auditDate} recorded score of <strong>{priorAudit.overallScore}/100</strong>.
                  Re-audit on {latestAudit.auditDate} recorded <strong>{latestAudit.overallScore}/100</strong> ({latestAudit.overallScore! - priorAudit.overallScore!} point improvement).
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900">Executive Assessment Summary</h4>
              <p className="text-slate-700 leading-relaxed">{latestAudit.summary}</p>
            </div>

            {/* Section Scores */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">Scores by Section</h4>
              <div className="grid grid-cols-2 gap-2">
                {AUDIT_SECTIONS.map((sec) => {
                  const s = latestAudit.sectionScores[sec.id];
                  return (
                    <div key={sec.id} className="flex justify-between border-b py-1.5 text-slate-700">
                      <span>{sec.title}</span>
                      <span className="font-mono font-bold">{s?.possible ? `${s.percent}%` : 'N/A'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Identified Barriers List */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900">
                Documented Accessibility Barriers & Remediation Status ({issuesList.length})
              </h4>
              <div className="space-y-2">
                {issuesList.map((issue) => (
                  <div key={issue.questionId} className="border-b pb-2 text-slate-700 space-y-0.5">
                    <div className="flex justify-between font-semibold">
                      <span>
                        [{issue.priority.toUpperCase()}] {issue.question.question}
                      </span>
                      <span className="font-mono capitalize text-slate-900">{issue.actionStatus}</span>
                    </div>
                    {issue.location && <div className="text-[11px] text-slate-500">Location: {issue.location}</div>}
                    {issue.recommendedFix && (
                      <div className="text-[11px] text-slate-800">
                        <strong>Action:</strong> {issue.recommendedFix}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Print Disclaimer */}
            <div className="text-[10px] text-slate-500 border-t pt-3">
              Notice: This report was generated by AccessGap for demonstration and civic accessibility prioritization. It does not replace certified structural engineering assessments.
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t print:hidden">
              <button
                onClick={() => setShowPrintReport(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Close Preview
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 rounded-lg flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Summary</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Physical On-Site Verification Modal (Auditor & Manager Experience) */}
      {verificationTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-300 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b">
              <ShieldCheck className="w-5 h-5 text-teal-800" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Conduct Physical On-Site Verification
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verify whether the reported fix complies with accessibility standards before updating public records.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="text-[11px] text-slate-500 font-semibold uppercase">
                Inspected Criterion:
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {verificationTarget.questionText}
              </div>
              {verificationTarget.recommendedFix && (
                <div className="text-slate-700 text-[11px]">
                  <strong>Target Fix:</strong> {verificationTarget.recommendedFix}
                </div>
              )}
              {verificationTarget.assignedTo && (
                <div className="text-slate-600 text-[11px]">
                  <strong>Contractor / Dept:</strong> {verificationTarget.assignedTo}
                </div>
              )}
            </div>

            {/* Decision Radio */}
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-900">
                Verification Decision <span className="text-rose-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVerifyDecision('passed')}
                  className={`p-3 rounded-lg border text-left flex items-start gap-2 transition-all ${
                    verifyDecision === 'passed'
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-500 ring-2 ring-emerald-400'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">PASS: Verified Remediated</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Fix satisfies standard. Resolves barrier and updates public score.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVerifyDecision('failed')}
                  className={`p-3 rounded-lg border text-left flex items-start gap-2 transition-all ${
                    verifyDecision === 'failed'
                      ? 'bg-rose-50 text-rose-950 border-rose-500 ring-2 ring-rose-400'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">FAIL: Substandard / Persists</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Rejects fix back to "In Progress". Logs deficiency note to contractor.
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Field Verification Notes */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Field Inspection Notes & Measurements <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                placeholder={
                  verifyDecision === 'passed'
                    ? 'e.g. Measured slope at 1:14 with bilateral handrails at 900mm height; verified fully compliant.'
                    : 'e.g. Ramp slope remains 1:8 steep paver surface without tactile paving; contractor must rework slope.'
                }
                value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
              />
            </div>

            {/* Verifier Signature / Name */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Inspecting Auditor / Verifier Name
              </label>
              <input
                type="text"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setVerificationTarget(null)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!verifyNotes.trim()) {
                    alert('Please provide physical verification field notes.');
                    return;
                  }
                  updateIssueActionStatus(
                    currentBuilding.id,
                    verificationTarget.questionId,
                    verifyDecision === 'passed' ? 'verified_resolved' : 'in_progress',
                    verificationTarget.assignedTo,
                    undefined,
                    verifyDecision,
                    verifyNotes,
                    verifierName
                  );
                  setVerificationTarget(null);
                  setVerifyNotes('');
                }}
                className={`px-4 py-2 rounded-lg font-bold text-white shadow-xs ${
                  verifyDecision === 'passed'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-rose-700 hover:bg-rose-800'
                }`}
              >
                {verifyDecision === 'passed' ? 'Confirm & Resolve Barrier' : 'Reject & Revert to In Progress'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citizen Barrier Reporting Modal */}
      {showCitizenReportModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-300 text-xs">
            <div className="flex items-center gap-2 pb-2 border-b">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Citizen Accessibility Barrier Report
                </h3>
                <p className="text-[11px] text-slate-500">
                  Report a physical barrier you experienced at {currentBuilding.name}.
                </p>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Barrier Category / Question Standard
              </label>
              <select
                value={citizenReportQuestionId}
                onChange={(e) => setCitizenReportQuestionId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
              >
                {AUDIT_QUESTIONS.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.question} ({q.guidelineReference})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Exact Location in Building
              </label>
              <input
                type="text"
                placeholder="e.g. Ground floor entry ramp, West public restroom, 3rd floor elevator bank"
                value={citizenReportLocation}
                onChange={(e) => setCitizenReportLocation(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Observation / What Barrier Did You Encounter? <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe the barrier, steepness, lack of grab bars, broken elevator, locked door..."
                value={citizenReportNotes}
                onChange={(e) => setCitizenReportNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-950 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                Your report will be registered with status <strong>"Reported Barrier"</strong> and marked as citizen-reported evidence until physically verified by a municipal auditor.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setShowCitizenReportModal(false)}
                className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!citizenReportNotes.trim()) {
                    alert('Please enter your observations.');
                    return;
                  }
                  citizenReportBarrier(
                    currentBuilding.id,
                    citizenReportQuestionId,
                    citizenReportNotes,
                    undefined,
                    citizenReportLocation
                  );
                  setShowCitizenReportModal(false);
                  setCitizenReportNotes('');
                  setCitizenReportLocation('');
                  alert('Thank you! Your accessibility barrier report has been recorded.');
                }}
                className="px-4 py-2 rounded-lg font-bold text-white bg-teal-800 hover:bg-teal-900 shadow-xs"
              >
                Submit Citizen Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Explainer Modal */}
      <ScoringExplainerModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
      />
    </div>
  );
};
