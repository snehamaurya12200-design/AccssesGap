import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  HelpCircle,
  X,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Volume2,
  SunMoon,
} from 'lucide-react';

export const HelpModal: React.FC = () => {
  const { showHelpModal, setShowHelpModal, language } = useApp();

  if (!showHelpModal) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 text-slate-800 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-lg sm:text-xl font-bold text-slate-900">
                How AccessGap Works & Help Guide
              </h2>
              <p className="text-xs text-slate-500">
                Simple instructions for citizens, volunteers, and facility managers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHelpModal(false)}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close help guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
          {/* Section 1: The Three Main Actions */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>The Three Main Tasks</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl space-y-1">
                <div className="font-bold text-teal-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-700" />
                  <span>Find a Place</span>
                </div>
                <p className="text-xs text-teal-800">
                  Search government offices, hospitals, and transit hubs to see if they have ramps, lifts, and accessible toilets.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                <div className="font-bold text-amber-900 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-amber-700" />
                  <span>I Need Help</span>
                </div>
                <p className="text-xs text-amber-800">
                  Request a volunteer escort for wheelchair navigation, sighted guide accompaniment, or form-filling help.
                </p>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-700" />
                  <span>Check a Building</span>
                </div>
                <p className="text-xs text-indigo-800">
                  Conduct an on-site checklist inspection, calculate a transparent score, and track repairs to completion.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Understanding Scores */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>What Do the Scores Mean?</span>
            </h3>
            <p className="text-xs text-slate-600">
              The score out of 100 is calculated purely from observed answers. Questions marked "Not applicable" are completely excluded from the score so buildings are never unfairly penalized.
            </p>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50 text-xs flex items-center justify-between">
                <span className="font-bold text-emerald-900">80 – 100 Points</span>
                <span className="text-emerald-800">Higher accessibility; step-free entrance and key amenities confirmed.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-amber-300 bg-amber-50 text-xs flex items-center justify-between">
                <span className="font-bold text-amber-900">60 – 79 Points</span>
                <span className="text-amber-800">Usable but has minor physical obstacles requiring improvement.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-rose-300 bg-rose-50 text-xs flex items-center justify-between">
                <span className="font-bold text-rose-900">0 – 59 Points</span>
                <span className="text-rose-800">Significant physical barriers (e.g. broken lift, stairs with no ramp).</span>
              </div>
            </div>
          </div>

          {/* Section 3: Understanding Verification Statuses */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>Information Status Badges</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50">
                <strong className="text-emerald-900">Verified:</strong>
                <p className="text-emerald-800 mt-0.5">
                  Inspected on-site by an auditor or trained volunteer using the structured checklist.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50">
                <strong className="text-amber-900">User-reported:</strong>
                <p className="text-amber-800 mt-0.5">
                  Submitted by a citizen or visitor. Noted immediately for public safety, awaiting on-site confirmation.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50">
                <strong className="text-rose-900">Needs re-inspection:</strong>
                <p className="text-rose-800 mt-0.5">
                  Audited more than 6 months ago. Physical renovations or maintenance changes may have occurred.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <strong className="text-slate-900">Unknown:</strong>
                <p className="text-slate-700 mt-0.5">
                  No inspection has been recorded yet for this facility. Never assume access without checking.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: Accessibility Tools */}
          <div className="space-y-2 pt-3 border-t border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>Accessibility & Language Options</span>
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
              <li>
                <strong>Languages:</strong> Choose between English, हिंदी (Hindi), and मराठी (Marathi) from the top bar at any time.
              </li>
              <li>
                <strong>Text Size:</strong> Use the <strong>A / A+ / A++</strong> controls in the top bar to make text larger and easier to read.
              </li>
              <li>
                <strong>High Contrast:</strong> Toggle the contrast button to enhance dark/light boundary borders.
              </li>
              <li>
                <strong>Voice:</strong> During an inspection, click "Read Question Aloud" to hear questions spoken clearly. Voice input is strictly optional and never required.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => setShowHelpModal(false)}
            className="min-h-[44px] px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors shadow-xs"
          >
            Got It, Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
