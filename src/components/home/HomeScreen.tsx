import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRANSLATIONS } from '../../utils/translations';
import {
  Search,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileCheck,
  Building2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Clock,
  RotateCcw,
  Eye,
  Plus,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    buildings,
    setActiveView,
    setSelectedBuildingId,
    startAudit,
    resumeDraft,
    hasSavedDraft,
    language,
    userMode,
    setShowHelpModal,
    setShowReportProblemModal,
    setBuildingProfileModalId,
  } = useApp();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [searchQuery, setSearchQuery] = useState('');

  // Quick search matching
  const matchingBuildings = searchQuery.trim()
    ? buildings.filter((b) => {
        const q = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.address.toLowerCase().includes(q) ||
          b.district.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    setBuildingProfileModalId(buildingId);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-2">
      {/* 1. Saved Draft Banner if unfinished check exists */}
      {hasSavedDraft && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <div className="font-bold text-amber-950 text-sm sm:text-base">
                You have an unfinished building check saved
              </div>
              <p className="text-xs text-amber-800">
                Continue your checklist where you left off without losing your answers.
              </p>
            </div>
          </div>
          <button
            onClick={resumeDraft}
            className="min-h-[44px] px-5 py-2 rounded-lg bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-2 shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t.resumeDraft}</span>
          </button>
        </div>
      )}

      {/* 2. Hero Introduction & Plain Language Header */}
      <div className="text-center space-y-3 pt-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Making Public Spaces Accessible
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Find public buildings with step-free entrances, request volunteer accompaniment, or check a public service centre for accessibility barriers.
        </p>
      </div>

      {/* 3. Simple Search Option */}
      <div className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 absolute left-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            role="searchbox"
            aria-label="Search for a public building, hospital, station, or government office"
            placeholder="Search for a public building, hospital, station, or government office..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 text-sm sm:text-base border-2 border-slate-300 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20 shadow-xs min-h-[52px]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 p-2 text-slate-400 hover:text-slate-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Live Search Instant Dropdown Results */}
        {searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-xl shadow-xl z-30 max-h-80 overflow-y-auto divide-y divide-slate-100">
            {matchingBuildings.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs sm:text-sm">
                No matching public buildings found for "{searchQuery}".
              </div>
            ) : (
              matchingBuildings.map((bldg) => (
                <div
                  key={bldg.id}
                  onClick={() => handleSelectBuilding(bldg.id)}
                  className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between gap-3 text-left transition-colors"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 text-sm truncate">{bldg.name}</div>
                    <div className="text-xs text-slate-500 truncate">{bldg.address}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        bldg.verificationStatus === 'verified' || bldg.verificationStatus === 'verified_audit'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : bldg.verificationStatus === 'user_reported' || bldg.verificationStatus === 'citizen_reported'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-rose-50 text-rose-900 border-rose-300'
                      }`}
                    >
                      {t.verificationLabels[bldg.verificationStatus] || 'Verified'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 4. Three Prominent, Clearly Labelled Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
        {/* ACTION 1: FIND A PLACE */}
        <div className="bg-white border-2 border-slate-200 hover:border-teal-700 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center shadow-2xs group-hover:bg-teal-800 group-hover:text-white transition-colors">
              <MapPin className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {t.findAPlace}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {t.findAPlaceDesc}
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Ramps, lifts, and step-free access</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                <span>Search by address, city, or service</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveView('map')}
            className="w-full min-h-[48px] px-4 py-3 bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <span>Explore Places</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ACTION 2: I NEED HELP */}
        <div className="bg-white border-2 border-slate-200 hover:border-amber-600 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center shadow-2xs group-hover:bg-amber-700 group-hover:text-white transition-colors">
              <HeartHandshake className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {t.iNeedHelp}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {t.iNeedHelpDesc}
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>Wheelchair and sighted guides</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>Form filling and counter accompaniment</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => setActiveView('assist')}
            className="w-full min-h-[48px] px-4 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-amber-600"
          >
            <span>Request Help</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* ACTION 3: CHECK A BUILDING */}
        <div className="bg-white border-2 border-slate-200 hover:border-indigo-600 rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5 group">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 flex items-center justify-center shadow-2xs group-hover:bg-indigo-800 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-7 h-7 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {t.checkABuilding}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {t.checkABuildingDesc}
              </p>
            </div>
            <ul className="text-xs text-slate-500 space-y-1.5 pt-1">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Guided step-by-step checklist</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <span>Record photos and track fixes</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => {
              if (hasSavedDraft) {
                resumeDraft();
              } else if (buildings.length > 0) {
                startAudit(buildings[0].id, false);
              } else {
                setActiveView('audit');
              }
            }}
            className="w-full min-h-[48px] px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-slate-700"
          >
            <span>{hasSavedDraft ? t.resumeDraft : t.startNewAudit}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. Helpful Civic Tools & Reporting Row */}
      <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm sm:text-base">
              Found a barrier at a public building?
            </div>
            <p className="text-xs text-slate-600">
              Report an inaccessible entrance, blocked ramp, broken elevator, or missing sign in 1 minute.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
          <button
            onClick={() => setShowReportProblemModal(true)}
            className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Report a Problem</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="flex-1 sm:flex-initial min-h-[44px] px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-teal-800" />
            <span>How It Works & Help</span>
          </button>
        </div>
      </div>

      {/* 6. Honest Demonstration Prototype Notice */}
      <div className="text-center text-xs text-slate-500 pt-2 flex items-center justify-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-400" />
        <span>
          AccessGap is an open civic innovation tool. Accessibility records are based on verified volunteer checklists and user reports.
        </span>
      </div>
    </div>
  );
};
