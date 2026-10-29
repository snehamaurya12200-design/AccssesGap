import React from 'react';
import { useApp } from '../../context/AppContext';
import { AppView } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import {
  Accessibility,
  Home,
  CheckCircle2,
  MapPin,
  HeartHandshake,
  SunMoon,
  RotateCcw,
  Plus,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    userMode,
    setUserMode,
    highContrast,
    toggleHighContrast,
    textSize,
    setTextSize,
    resetToDemoData,
    buildings,
    startAudit,
    language,
    setLanguage,
    setShowHelpModal,
    setShowReportProblemModal,
  } = useApp();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const handleStartQuickAudit = () => {
    if (userMode === 'citizen') {
      setActiveView('map');
      return;
    }
    // If a building is available, start audit on the first one or open audit view
    if (buildings.length > 0) {
      startAudit(buildings[0].id, false);
    } else {
      setActiveView('audit');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Zone 1: Wordmark Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveView('home')}
              className="flex items-center gap-2.5 text-left focus-visible:ring-2 focus-visible:ring-teal-600 rounded-md p-1 -m-1"
              aria-label="AccessGap - Return to Home"
            >
              <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center text-white shadow-xs">
                <Accessibility className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  AccessGap
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Primary Plain-Language Navigation */}
          <nav
            aria-label="Primary Navigation"
            className="hidden md:flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium"
          >
            <button
              onClick={() => setActiveView('home')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors min-h-[44px] ${
                activeView === 'home'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-teal-700" />
              <span>{t.homeTab}</span>
            </button>

            <button
              onClick={() => setActiveView('map')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors min-h-[44px] ${
                activeView === 'map'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-teal-700" />
              <span>{t.mapTab}</span>
            </button>

            <button
              onClick={() => setActiveView('assist')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors min-h-[44px] ${
                activeView === 'assist'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <HeartHandshake className="w-4 h-4 text-teal-700" />
              <span>{t.assistTab}</span>
            </button>

            <button
              onClick={() => setActiveView('audit')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-colors min-h-[44px] ${
                activeView === 'audit'
                  ? 'bg-slate-100 text-slate-900 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              <span>{t.auditTab}</span>
            </button>
          </nav>

          {/* Zone 3: Experience Switcher (Citizen vs Auditor) */}
          <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-100 text-xs">
            <button
              onClick={() => setUserMode('citizen')}
              title="Citizen Mode: Discover public accessibility and request assistance"
              className={`min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                userMode === 'citizen'
                  ? 'bg-white text-teal-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${userMode === 'citizen' ? 'bg-teal-700' : 'bg-slate-400'}`} />
              <span>{language === 'mr' ? 'नागरिक' : language === 'hi' ? 'नागरिक' : 'Citizen'}</span>
            </button>
            <button
              onClick={() => setUserMode('auditor')}
              title="Auditor & Manager Mode: Audit facilities, track remediations, and verify fixes"
              className={`min-h-[40px] px-2.5 sm:px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                userMode === 'auditor'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${userMode === 'auditor' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span>{language === 'mr' ? 'व्यवस्थापक' : language === 'hi' ? 'ऑडिटर' : 'Auditor'}</span>
            </button>
          </div>

          {/* Zone 4: Accessibility tools, Help & Language Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Help Control Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              title="Help & How It Works"
              aria-label="Open help guide"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 hover:bg-teal-100 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Language Selector: EN / हिंदी / मराठी */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 text-xs bg-slate-50">
              <button
                onClick={() => setLanguage('en')}
                title="English interface"
                className={`min-h-[40px] px-2 py-1 rounded font-semibold transition-colors ${
                  language === 'en' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('hi')}
                title="हिंदी इंटरफेस (Hindi)"
                className={`min-h-[40px] px-2 py-1 rounded font-semibold transition-colors ${
                  language === 'hi' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLanguage('mr')}
                title="मराठी इंटरफेस (Marathi)"
                className={`min-h-[40px] px-2 py-1 rounded font-semibold transition-colors ${
                  language === 'mr' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Text size selector */}
            <div className="hidden lg:flex items-center border border-slate-200 rounded-lg p-0.5 text-xs text-slate-600">
              <button
                onClick={() => setTextSize('normal')}
                title="Standard font size"
                className={`min-h-[40px] px-2 py-1 rounded font-medium ${
                  textSize === 'normal' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'
                }`}
              >
                A
              </button>
              <button
                onClick={() => setTextSize('large')}
                title="Large font size"
                className={`min-h-[40px] px-2 py-1 rounded font-medium text-sm ${
                  textSize === 'large' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'
                }`}
              >
                A+
              </button>
              <button
                onClick={() => setTextSize('extralarge')}
                title="Extra large font size"
                className={`min-h-[40px] px-2 py-1 rounded font-medium text-base ${
                  textSize === 'extralarge' ? 'bg-slate-900 text-white' : 'hover:text-slate-900'
                }`}
              >
                A++
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              title={highContrast ? 'Disable high contrast' : 'Enable high contrast'}
              aria-label="Toggle high contrast display mode"
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg border transition-colors ${
                highContrast
                  ? 'bg-amber-100 border-amber-400 text-amber-950 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SunMoon className="w-4 h-4" />
            </button>

            {/* Reset Demo Data */}
            <button
              onClick={() => {
                if (window.confirm('Reset all demonstration buildings, audits, and requests to default state?')) {
                  resetToDemoData();
                }
              }}
              title="Reset sample demonstration data"
              aria-label="Reset demonstration data"
              className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-100 py-2">
          <button
            onClick={() => setActiveView('home')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold ${
              activeView === 'home' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-teal-700" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveView('map')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold ${
              activeView === 'map' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span>Map</span>
          </button>
          <button
            onClick={() => setActiveView('assist')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold ${
              activeView === 'assist' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-teal-700" />
            <span>Assist</span>
          </button>
          <button
            onClick={() => setActiveView('audit')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold ${
              activeView === 'audit' ? 'bg-slate-100 text-slate-900' : 'text-slate-600'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
            <span>Check</span>
          </button>
        </div>
      </div>
    </header>
  );
};
