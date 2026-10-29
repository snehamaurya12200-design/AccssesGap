import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { HomeScreen } from './components/home/HomeScreen';
import { AuditDashboard } from './components/audit/AuditDashboard';
import { AuditConductWizard } from './components/audit/AuditConductWizard';
import { MapModule } from './components/map/MapModule';
import { AssistModule } from './components/assist/AssistModule';
import { HelpModal } from './components/common/HelpModal';
import { ProblemReportModal } from './components/report/ProblemReportModal';
import { BuildingProfileModal } from './components/building/BuildingProfileModal';
import { TRANSLATIONS } from './utils/translations';
import {
  CheckCircle2,
  MapPin,
  HeartHandshake,
  ShieldCheck,
  Building,
  Home,
  Info,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeView, setActiveView, isAuditing, textSize, language } = useApp();
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const textSizeClass =
    textSize === 'extralarge'
      ? 'text-lg [&_input]:text-base [&_select]:text-base [&_button]:text-base'
      : textSize === 'large'
      ? 'text-base [&_input]:text-sm [&_select]:text-sm [&_button]:text-sm'
      : 'text-sm';

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 text-slate-900 ${textSizeClass}`}>
      <Header />

      {/* Main Civic Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Module Sub-Banner (Hidden on Home screen and during active audit wizard) */}
        {!isAuditing && activeView !== 'home' && (
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-800 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-teal-700" />
                <span>Civic Accessibility & Public Services</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {activeView === 'audit' && t.auditTab}
                {activeView === 'map' && t.mapTab}
                {activeView === 'assist' && t.assistTab}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {activeView === 'audit' &&
                  'Inspect public buildings, calculate transparent scores, and verify barrier fixes.'}
                {activeView === 'map' &&
                  'Explore government service centres with verified accessibility status, accessible facility filters, and step-free entrance verification.'}
                {activeView === 'assist' &&
                  'Request dedicated civic volunteer accompaniment for upcoming visits to government offices and community services.'}
              </p>
            </div>

            {/* Segmented Module Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0 self-start md:self-auto text-xs">
              <button
                onClick={() => setActiveView('home')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/60 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setActiveView('map')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all ${
                  activeView === 'map'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapPin className="w-4 h-4 text-teal-700" />
                <span>1. {t.mapTab}</span>
              </button>

              <button
                onClick={() => setActiveView('assist')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all ${
                  activeView === 'assist'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-teal-700" />
                <span>2. {t.assistTab}</span>
              </button>

              <button
                onClick={() => setActiveView('audit')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all ${
                  activeView === 'audit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-teal-700" />
                <span>3. {t.auditTab}</span>
              </button>
            </div>
          </div>
        )}

        {/* View Router */}
        {isAuditing ? (
          <AuditConductWizard />
        ) : activeView === 'home' ? (
          <HomeScreen />
        ) : activeView === 'audit' ? (
          <AuditDashboard />
        ) : activeView === 'map' ? (
          <MapModule />
        ) : (
          <AssistModule />
        )}
      </main>

      {/* Global Modals */}
      <HelpModal />
      <ProblemReportModal />
      <BuildingProfileModal />

      {/* Quiet Civic Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">AccessGap</span>
            <span aria-hidden="true">·</span>
            <span>Making Public Spaces Accessible</span>
            <span aria-hidden="true">·</span>
            <span>Universal Accessibility Standards</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>WCAG 2.1 AA Compliant</span>
            <span aria-hidden="true">·</span>
            <span>Civic Demonstration Platform</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
