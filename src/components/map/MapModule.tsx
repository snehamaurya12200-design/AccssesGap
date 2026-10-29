import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Building, AccessibilityTier, VerificationStatus } from '../../types';
import { getTierColorClass } from '../../utils/scoring';
import { TRANSLATIONS } from '../../utils/translations';
import {
  Search,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Accessibility,
  Phone,
  Clock,
  ShieldAlert,
  HeartHandshake,
  FileCheck,
  Compass,
  X,
  History,
  AlertCircle,
  Camera,
  Send,
  Eye,
  Check,
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

export const MapModule: React.FC = () => {
  const {
    buildings,
    selectedBuildingId,
    setSelectedBuildingId,
    selectedBuilding,
    startAudit,
    setActiveView,
    getLatestAudit,
    userMode,
    language,
    citizenReportBarrier,
    setBuildingProfileModalId,
    setShowReportProblemModal,
  } = useApp();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | AccessibilityTier>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [mobileViewMode, setMobileViewMode] = useState<'map' | 'list'>('map');

  // Citizen barrier report modal
  const [showCitizenReportModal, setShowCitizenReportModal] = useState(false);
  const [reportCategory, setReportCategory] = useState('entrance');
  const [reportSeverity, setReportSeverity] = useState<'high' | 'medium' | 'low'>('high');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  const inspectedBuilding = selectedBuilding || buildings[0];
  const inspectedAudit = inspectedBuilding ? getLatestAudit(inspectedBuilding.id) : undefined;

  const toggleFacility = (facility: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility) ? prev.filter((f) => f !== facility) : [...prev, facility]
    );
  };

  const filteredBuildings = useMemo(() => {
    return buildings.filter((bldg) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText =
          bldg.name.toLowerCase().includes(query) ||
          bldg.address.toLowerCase().includes(query) ||
          bldg.district.toLowerCase().includes(query) ||
          bldg.city.toLowerCase().includes(query) ||
          bldg.category.toLowerCase().includes(query);
        if (!matchesText) return false;
      }

      if (selectedTier !== 'all' && bldg.statusTier !== selectedTier) {
        return false;
      }

      if (selectedCategory !== 'all' && bldg.category !== selectedCategory) {
        return false;
      }

      if (selectedFacilities.length > 0) {
        const hasAllFacilities = selectedFacilities.every((fac) =>
          bldg.facilities.includes(fac)
        );
        if (!hasAllFacilities) return false;
      }

      return true;
    });
  }, [buildings, searchQuery, selectedTier, selectedCategory, selectedFacilities]);

  const handlePinClick = (bldgId: string) => {
    setSelectedBuildingId(bldgId);
  };

  const getVerificationBadgeConfig = (status?: VerificationStatus) => {
    switch (status) {
      case 'verified':
      case 'verified_audit':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          label: t.verificationLabels.verified,
          icon: CheckCircle2,
        };
      case 'user_reported':
      case 'citizen_reported':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          label: t.verificationLabels.user_reported,
          icon: AlertTriangle,
        };
      case 'needs_reinspection':
      case 'outdated':
        return {
          bg: 'bg-rose-50 text-rose-900 border-rose-300',
          label: t.verificationLabels.needs_reinspection,
          icon: Clock,
        };
      case 'demonstration_record':
        return {
          bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
          label: t.verificationLabels.demonstration_record,
          icon: ShieldAlert,
        };
      case 'unknown':
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          label: t.verificationLabels.unknown,
          icon: ShieldAlert,
        };
    }
  };

  const handleCitizenReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectedBuilding || !reportDescription.trim()) return;

    // Map selected category to a standard inspection checklist question ID
    const questionIdMap: Record<string, string> = {
      entrance: 'q_entrance_stepfree',
      internal: 'q_internal_pathways',
      facility: 'q_facility_toilet_available',
      signage: 'q_signage_easy',
      safety: 'q_safety_hazards',
    };
    const targetQuestionId = questionIdMap[reportCategory] || 'q_entrance_stepfree';

    citizenReportBarrier(
      inspectedBuilding.id,
      targetQuestionId,
      `[Severity: ${reportSeverity.toUpperCase()}] ${reportDescription.trim()}`
    );

    setReportSuccess('Your accessibility barrier report has been submitted for auditor review.');
    setReportDescription('');
    setTimeout(() => {
      setShowCitizenReportModal(false);
      setReportSuccess(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Experience Mode Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-xl shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {userMode === 'citizen' ? t.citizenMode : t.auditorMode} Active
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-xs text-slate-300">
            {userMode === 'citizen'
              ? 'Find accessible government facilities, verify physical access before visiting, or request accompaniment.'
              : 'Inspect precinct buildings, register new facilities, audit accessibility criteria, and review reported barriers.'}
          </span>
        </div>
        <div className="text-[11px] font-mono text-teal-400">
          {filteredBuildings.length} of {buildings.length} Centres Mapped
        </div>
      </div>

      {/* Search & Accessibility Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by centre name, address, ward, or service category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[44px]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Tier Filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs overflow-x-auto shrink-0">
            <button
              onClick={() => setSelectedTier('all')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                selectedTier === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Facilities ({buildings.length})
            </button>
            <button
              onClick={() => setSelectedTier('Higher recorded accessibility score')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                selectedTier === 'Higher recorded accessibility score'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-emerald-900 hover:bg-white/60'
              }`}
            >
              Higher Score (80+)
            </button>
            <button
              onClick={() => setSelectedTier('Improvements recommended')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                selectedTier === 'Improvements recommended'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-amber-900 hover:bg-white/60'
              }`}
            >
              Needs Work (60–79)
            </button>
            <button
              onClick={() => setSelectedTier('Significant barriers identified')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md font-semibold whitespace-nowrap transition-colors ${
                selectedTier === 'Significant barriers identified'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-rose-900 hover:bg-white/60'
              }`}
            >
              Major Barriers (0–59)
            </button>
          </div>

          {/* Mobile View Toggle */}
          <div className="md:hidden flex items-center justify-center gap-1 border border-slate-200 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setMobileViewMode('map')}
              className={`min-h-[44px] flex-1 py-1.5 px-3 rounded-md font-semibold ${
                mobileViewMode === 'map' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              Map View
            </button>
            <button
              onClick={() => setMobileViewMode('list')}
              className={`min-h-[44px] flex-1 py-1.5 px-3 rounded-md font-semibold ${
                mobileViewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-600'
              }`}
            >
              List View ({filteredBuildings.length})
            </button>
          </div>
        </div>

        {/* Needs & Facilities Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
            Accessibility Needs:
          </span>
          {ALL_FACILITIES.map((facility) => {
            const isSelected = selectedFacilities.includes(facility);
            return (
              <button
                key={facility}
                onClick={() => toggleFacility(facility)}
                className={`min-h-[36px] px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1 ${
                  isSelected
                    ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                {facility}
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
          {selectedFacilities.length > 0 && (
            <button
              onClick={() => setSelectedFacilities([])}
              className="text-xs text-rose-700 hover:text-rose-900 underline ml-2 font-semibold"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Main Map & Directory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas (7 cols on lg) */}
        <div
          className={`lg:col-span-7 space-y-3 ${
            mobileViewMode === 'list' ? 'hidden lg:block' : 'block'
          }`}
        >
          {/* Interactive SVG Civic Map Container */}
          <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-300 shadow-md h-[480px] sm:h-[540px] select-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1e293b" strokeWidth="0.3" />
                </pattern>
                <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0369a1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.3" />
                </linearGradient>
              </defs>

              <rect width="100" height="100" fill="#0f172a" />
              <rect width="100" height="100" fill="url(#grid)" />

              {/* Metro River feature */}
              <path
                d="M 0,65 Q 25,60 45,70 T 80,60 T 100,55 L 100,68 T 80,72 T 45,82 T 0,78 Z"
                fill="url(#riverGrad)"
              />

              {/* Arterial Roads & Boulevards */}
              <path
                d="M 50,0 L 50,100 M 0,50 L 100,50 M 20,0 L 20,100 M 80,0 L 80,100 M 0,25 L 100,25 M 0,75 L 100,75"
                stroke="#334155"
                strokeWidth="0.8"
                strokeDasharray="1,1"
              />
              <path
                d="M 10,90 Q 50,50 90,10"
                fill="none"
                stroke="#475569"
                strokeWidth="1.2"
              />

              {/* District Labels */}
              <text x="18" y="16" fill="#64748b" fontSize="2.8" fontWeight="bold" fontFamily="monospace">
                WEST HILLS
              </text>
              <text x="48" y="28" fill="#64748b" fontSize="2.8" fontWeight="bold" fontFamily="monospace">
                CENTRAL METRO
              </text>
              <text x="74" y="38" fill="#64748b" fontSize="2.8" fontWeight="bold" fontFamily="monospace">
                EASTSIDE WARD
              </text>
              <text x="22" y="70" fill="#64748b" fontSize="2.8" fontWeight="bold" fontFamily="monospace">
                WATERFRONT TRANSIT
              </text>
              <text x="62" y="86" fill="#64748b" fontSize="2.8" fontWeight="bold" fontFamily="monospace">
                SOUTH QUARTER
              </text>
            </svg>

            {/* Building Pins */}
            {filteredBuildings.map((bldg) => {
              const isSelected = bldg.id === inspectedBuilding?.id;
              const isHigher = bldg.statusTier === 'Higher recorded accessibility score';
              const isNeedsWork = bldg.statusTier === 'Improvements recommended';
              const pinColor = isHigher
                ? 'bg-emerald-500 ring-emerald-300'
                : isNeedsWork
                ? 'bg-amber-500 ring-amber-300'
                : 'bg-rose-500 ring-rose-300';

              const badge = getVerificationBadgeConfig(bldg.verificationStatus);

              return (
                <div
                  key={bldg.id}
                  style={{ left: `${bldg.coordinates.x}%`, top: `${bldg.coordinates.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                  onClick={() => handlePinClick(bldg.id)}
                >
                  {isSelected && (
                    <span className="absolute -inset-2 rounded-full bg-teal-400/40 animate-ping" />
                  )}

                  <div
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg transition-transform ${pinColor} ${
                      isSelected
                        ? 'scale-125 ring-4 ring-white z-30'
                        : 'group-hover:scale-115 ring-2 ring-slate-900'
                    }`}
                  >
                    <Accessibility className="w-4 h-4 stroke-[2.5]" />
                  </div>

                  <div
                    className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-slate-900/95 text-white p-2.5 rounded-lg text-xs pointer-events-none transition-all shadow-xl border border-slate-700 ${
                      isSelected ? 'opacity-100 visible' : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible'
                    }`}
                  >
                    <div className="font-bold text-white truncate">{bldg.name}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-300 mt-1">
                      <span>{bldg.statusTier}</span>
                      <span className="font-mono font-bold text-teal-300">
                        {bldg.currentScore !== null ? `${bldg.currentScore}/100` : 'N/A'}
                      </span>
                    </div>
                    <div className="mt-1 pt-1 border-t border-slate-700/80 flex items-center gap-1 text-[10px] text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      <span className="truncate">{badge.label}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Map Legend Overlay */}
            <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-xs border border-slate-700/80 rounded-lg p-2.5 text-white text-[11px] space-y-1.5 shadow-lg">
              <div className="font-bold text-slate-300 text-[10px] uppercase tracking-wider">
                Precinct Status Key
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Higher Score (80–100)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Improvements Recommended (60–79)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Significant Barriers (0–59)</span>
              </div>
            </div>

            {/* Clear Demonstration Banner */}
            <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-xs border border-slate-700 rounded-lg px-2.5 py-1 text-[11px] text-slate-300 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>Civic Infrastructure Prototype</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Click any pin on the map to inspect its verified accessibility facilities, unverified barrier reports, and audit history.
            </span>
          </div>
        </div>

        {/* Directory & Details Panel (5 cols on lg) */}
        <div
          className={`lg:col-span-5 space-y-4 ${
            mobileViewMode === 'map' ? 'hidden lg:block' : 'block'
          }`}
        >
          {inspectedBuilding ? (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4 p-5">
              {/* Photo & Identity Header */}
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <img
                  src={inspectedBuilding.imageUrl}
                  alt={inspectedBuilding.name}
                  className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                />
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 font-semibold">
                      {inspectedBuilding.category} · {inspectedBuilding.district}
                    </span>
                    {/* Honest Verification Badge */}
                    {(() => {
                      const badge = getVerificationBadgeConfig(inspectedBuilding.verificationStatus);
                      const BadgeIcon = badge.icon;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}
                        >
                          <BadgeIcon className="w-3 h-3 shrink-0" />
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {inspectedBuilding.name}
                  </h4>
                  <div className="text-xs text-slate-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{inspectedBuilding.address}</span>
                  </div>
                </div>
              </div>

              {/* Outdated Inspection Warning Notice */}
              {inspectedBuilding.verificationStatus === 'outdated' && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Inspection Outdated (&gt; 6 Months Ago)</div>
                    <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                      This public building was last audited on {inspectedBuilding.lastAuditedDate || 'over 180 days ago'}. Physical conditions, renovations, or ramp maintenance may have changed. A re-audit is strongly recommended.
                    </p>
                  </div>
                </div>
              )}

              {/* Score Highlight Box */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs text-slate-500 font-semibold">Recorded Universal Score</div>
                  <div className="font-bold text-slate-900 text-sm">
                    {inspectedBuilding.statusTier}
                  </div>
                  {inspectedBuilding.auditCount > 0 && (
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Verified across {inspectedBuilding.auditCount} inspection(s)
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {inspectedBuilding.currentScore !== null ? (
                    <>
                      <span className="font-mono text-2xl font-black text-slate-900 tabular-nums">
                        {inspectedBuilding.currentScore}
                      </span>
                      <span className="text-xs text-slate-400">/100</span>
                    </>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">Unscored</span>
                  )}
                </div>
              </div>

              {/* Public Hours & Phone */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 py-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{inspectedBuilding.hours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{inspectedBuilding.phone}</span>
                </div>
              </div>

              {/* The 4 Standard Physical Accessibility Sections */}
              <div className="space-y-3.5 pt-1">
                {/* 1. GETTING INSIDE (Entrance, steps, ramps) */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-[10px]">
                        1
                      </span>
                      <span>Getting Inside</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Entrance, Steps & Ramps</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { name: 'Step-Free Entrance', has: inspectedBuilding.facilities.includes('Step-Free Entrance') },
                      { name: 'Wheelchair Ramp', has: inspectedBuilding.facilities.includes('Wheelchair Ramp') },
                      { name: 'Designated Parking', has: inspectedBuilding.facilities.includes('Designated Parking') },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className={`p-2 rounded-lg border flex items-center gap-1.5 text-[11px] ${
                          item.has
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        {item.has ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. MOVING AROUND (Internal pathways, lifts) */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-[10px]">
                        2
                      </span>
                      <span>Moving Around</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Lifts & Corridors</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { name: 'Accessible Elevator', has: inspectedBuilding.facilities.includes('Accessible Elevator') },
                      { name: 'Tactile Paving', has: inspectedBuilding.facilities.includes('Tactile Paving') },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className={`p-2 rounded-lg border flex items-center gap-1.5 text-[11px] ${
                          item.has
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        {item.has ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. USING FACILITIES (Accessible toilets, service counters) */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-[10px]">
                        3
                      </span>
                      <span>Using Facilities</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Restrooms & Counters</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {[
                      { name: 'Accessible Restroom', has: inspectedBuilding.facilities.includes('Accessible Restroom') },
                      { name: 'Braille Signage', has: inspectedBuilding.facilities.includes('Braille Signage') },
                      { name: 'Audio Hearing Loop', has: inspectedBuilding.facilities.includes('Audio Hearing Loop') },
                    ].map((item) => (
                      <div
                        key={item.name}
                        className={`p-2 rounded-lg border flex items-center gap-1.5 text-[11px] ${
                          item.has
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-white border-slate-200 text-slate-400 line-through'
                        }`}
                      >
                        {item.has ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. LATEST INFORMATION (Last inspection date, known barriers, verification status) */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-teal-800 text-white flex items-center justify-center text-[10px]">
                        4
                      </span>
                      <span>Latest Information</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">Verification & Audit Log</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                      <span className="text-slate-600">Last Inspection Date:</span>
                      <span className="font-semibold text-slate-900">{inspectedBuilding.lastAuditedDate}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                      <span className="text-slate-600">Verification Status:</span>
                      <span className="font-bold text-teal-900">
                        {t.verificationLabels[inspectedBuilding.verificationStatus] || 'Verified'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                      <span className="text-slate-600">Known Physical Barriers:</span>
                      <span className={`font-bold ${inspectedBuilding.openIssuesCount > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                        {inspectedBuilding.openIssuesCount} documented barrier(s)
                      </span>
                    </div>

                    {inspectedBuilding.unverifiedFixesCount > 0 && (
                      <div className="p-2 rounded-lg bg-sky-50 border border-sky-200 text-[11px] text-sky-950 flex items-center justify-between">
                        <span className="font-medium">Repairs Waiting for Verification:</span>
                        <span className="font-bold text-sky-900">{inspectedBuilding.unverifiedFixesCount} fix(es)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons to Connect Modules (Citizen vs Auditor Mode) */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => setBuildingProfileModalId(inspectedBuilding.id)}
                  className="w-full min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
                >
                  <Eye className="w-4 h-4 text-teal-800" />
                  <span>View Building Profile & Previous Checks</span>
                </button>

                {userMode === 'citizen' ? (
                  /* Citizen Experience Actions */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedBuildingId(inspectedBuilding.id);
                        setActiveView('assist');
                      }}
                      className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-xs"
                    >
                      <HeartHandshake className="w-4 h-4 text-teal-200" />
                      <span>I Need Help Visiting Here</span>
                    </button>

                    <button
                      onClick={() => setShowReportProblemModal(true, inspectedBuilding.id)}
                      className="min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-300"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      <span>Report a Problem</span>
                    </button>
                  </div>
                ) : (
                  /* Auditor & Manager Experience Actions */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedBuildingId(inspectedBuilding.id);
                        startAudit(inspectedBuilding.id, inspectedBuilding.auditCount > 0);
                      }}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-xs"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>{inspectedBuilding.auditCount > 0 ? t.checkAgain : t.startNewAudit}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedBuildingId(inspectedBuilding.id);
                        setActiveView('audit');
                      }}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
                    >
                      <Eye className="w-4 h-4 text-slate-700" />
                      <span>{t.remediationLabel}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Search Result Mini-Cards */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Matching Public Service Centres ({filteredBuildings.length})
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredBuildings.map((b) => {
                const isSelected = b.id === inspectedBuilding?.id;
                const tierStyle = getTierColorClass(b.statusTier);
                const badge = getVerificationBadgeConfig(b.verificationStatus);

                return (
                  <div
                    key={b.id}
                    onClick={() => handlePinClick(b.id)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-700'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 truncate">{b.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-slate-500 truncate text-[11px] mt-0.5">{b.address}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-slate-900">
                        {b.currentScore !== null ? `${b.currentScore}/100` : '—'}
                      </div>
                      <span className={`text-[10px] font-semibold ${tierStyle.text}`}>
                        {b.statusTier}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Citizen Barrier Reporting Modal */}
      {showCitizenReportModal && inspectedBuilding && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Report Accessibility Barrier</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCitizenReportModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{reportSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleCitizenReportSubmit} className="space-y-4">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="font-bold text-slate-800">{inspectedBuilding.name}</div>
                  <div className="text-slate-500 text-[11px]">{inspectedBuilding.address}</div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Barrier Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  >
                    <option value="entrance">Entrances & Access Ramps</option>
                    <option value="internal">Internal Pathways & Elevators</option>
                    <option value="facility">Accessible Restrooms & Counters</option>
                    <option value="signage">Signage, Braille & Wayfinding</option>
                    <option value="safety">Hazards & Emergency Exits</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Barrier Severity <span className="text-rose-600">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setReportSeverity('high')}
                      className={`min-h-[44px] py-1.5 px-3 rounded-lg border font-semibold text-xs ${
                        reportSeverity === 'high'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      High (Blocking)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportSeverity('medium')}
                      className={`min-h-[44px] py-1.5 px-3 rounded-lg border font-semibold text-xs ${
                        reportSeverity === 'medium'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Medium (Difficult)
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportSeverity('low')}
                      className={`min-h-[44px] py-1.5 px-3 rounded-lg border font-semibold text-xs ${
                        reportSeverity === 'low'
                          ? 'bg-slate-200 text-slate-900 border-slate-300'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Low (Inconvenience)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Describe the Barrier in Detail <span className="text-rose-600">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Broken ramp handrail on the north entrance, wheelchair ramp blocked by parked scooters, or lift out of service..."
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900"
                    required
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Civic Review Notice</span>
                  </div>
                  <p className="mt-0.5">
                    Your report will be flagged as <em>"Citizen Reported"</em>. It will alert other citizens on the map and notify auditors to conduct on-site physical verification.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowCitizenReportModal(false)}
                    className="min-h-[44px] px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="min-h-[44px] px-5 py-2 rounded-lg font-bold text-white bg-teal-800 hover:bg-teal-900 shadow-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
