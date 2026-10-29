import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProblemCategory, CitizenProblemReport } from '../../types';
import { TRANSLATIONS } from '../../utils/translations';
import { IMAGES } from '../../data/initialData';
import {
  AlertTriangle,
  X,
  CheckCircle2,
  Camera,
  MapPin,
  Building2,
  Upload,
  Link2,
  ShieldAlert,
  Send,
  Eye,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

const PROBLEM_CATEGORIES: Array<{ type: ProblemCategory; icon: string; description: string; checklistQuestionId: string }> = [
  {
    type: 'Inaccessible entrance',
    icon: '🚪',
    description: 'Entrance has steps, steep rise, locked door, or no level threshold.',
    checklistQuestionId: 'q_entrance_stepfree',
  },
  {
    type: 'Blocked ramp',
    icon: '♿',
    description: 'Ramp is blocked by parked vehicles, delivery crates, or trash bins.',
    checklistQuestionId: 'q_entrance_ramp',
  },
  {
    type: 'Broken lift',
    icon: '🛗',
    description: 'Elevator is out of service, buttons broken, or no elevator in multi-story facility.',
    checklistQuestionId: 'q_internal_lift',
  },
  {
    type: 'Obstructed pathway',
    icon: '🚶',
    description: 'Internal hallway is narrower than 1200mm, cluttered with furniture or boxes.',
    checklistQuestionId: 'q_internal_pathways',
  },
  {
    type: 'Inaccessible toilet',
    icon: '🚻',
    description: 'Restroom locked, no grab bars, too narrow for wheelchair turning, or out of order.',
    checklistQuestionId: 'q_facility_toilet_available',
  },
  {
    type: 'Missing signage',
    icon: '🪧',
    description: 'No Braille, low contrast directions, or no signs directing to accessible entrance.',
    checklistQuestionId: 'q_signage_easy',
  },
  {
    type: 'Other accessibility problems',
    icon: '⚠️',
    description: 'Low hanging overhead hazard, dangerous slick surface, or lack of staff assistance.',
    checklistQuestionId: 'q_safety_hazards',
  },
];

export const ProblemReportModal: React.FC = () => {
  const {
    showReportProblemModal,
    setShowReportProblemModal,
    buildings,
    selectedBuildingId,
    submitProblemReport,
    getLatestAudit,
    language,
  } = useApp();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Step state (1: Select building & problem, 2: Details & photo, 3: Review & duplicate check, 4: Success confirmation)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state
  const [targetBuildingId, setTargetBuildingId] = useState<string>(
    selectedBuildingId || buildings[0]?.id || ''
  );
  const [problemType, setProblemType] = useState<ProblemCategory>('Blocked ramp');
  const [description, setDescription] = useState('');
  const [locationInBuilding, setLocationInBuilding] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [linkToExisting, setLinkToExisting] = useState<boolean>(true);
  const [submittedReport, setSubmittedReport] = useState<CitizenProblemReport | null>(null);

  const selectedBuilding = buildings.find((b) => b.id === targetBuildingId) || buildings[0];
  const latestAudit = selectedBuilding ? getLatestAudit(selectedBuilding.id) : undefined;

  // Check for similar existing issues at this building
  const similarExistingIssue = useMemo(() => {
    if (!latestAudit) return null;
    const catConfig = PROBLEM_CATEGORIES.find((c) => c.type === problemType);
    if (!catConfig) return null;

    const existingResponse = latestAudit.checklistResponses[catConfig.checklistQuestionId];
    if (existingResponse && (existingResponse.status === 'no' || existingResponse.status === 'partially')) {
      return {
        questionId: catConfig.checklistQuestionId,
        notes: existingResponse.notes || 'Documented physical barrier at this location.',
        actionStatus: existingResponse.actionStatus || 'reported',
        recommendedFix: existingResponse.recommendedFix,
      };
    }
    return null;
  }, [latestAudit, problemType]);

  if (!showReportProblemModal) return null;

  const handleNextToDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBuildingId) {
      alert('Please select a building.');
      return;
    }
    setStep(2);
  };

  const handleNextToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Please enter a description of the problem.');
      return;
    }
    setStep(3);
  };

  const handleSubmit = () => {
    const catConfig = PROBLEM_CATEGORIES.find((c) => c.type === problemType);
    const linkedQId = linkToExisting && similarExistingIssue ? similarExistingIssue.questionId : catConfig?.checklistQuestionId;

    const report = submitProblemReport({
      buildingId: targetBuildingId,
      problemType,
      description: description.trim(),
      location: locationInBuilding.trim() || undefined,
      photoUrl,
      linkedQuestionId: linkedQId,
    });

    setSubmittedReport(report);
    setStep(4);
  };

  const handleClose = () => {
    setShowReportProblemModal(false);
    // Reset wizard
    setStep(1);
    setDescription('');
    setLocationInBuilding('');
    setPhotoUrl(undefined);
    setSubmittedReport(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-6 sm:p-7 space-y-5 border border-slate-200 text-slate-800 my-8 text-xs sm:text-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="report-modal-title" className="text-base sm:text-lg font-bold text-slate-900">
                Report an Accessibility Problem
              </h2>
              <p className="text-[11px] text-slate-500">
                Help citizens stay informed and alert facility teams to physical barriers.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close report window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar (4 stages) */}
        {step < 4 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>Step {step} of 3</span>
              <span>
                {step === 1 && 'Building & Category'}
                {step === 2 && 'Description & Photo'}
                {step === 3 && 'Review & Link'}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-600 h-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* STAGE 1: Select Building & Problem Type */}
        {step === 1 && (
          <form onSubmit={handleNextToDetails} className="space-y-4">
            <div>
              <label className="block font-bold text-slate-900 mb-1.5">
                1. Select Public Building or Service Centre <span className="text-rose-600">*</span>
              </label>
              <select
                value={targetBuildingId}
                onChange={(e) => setTargetBuildingId(e.target.value)}
                className="w-full p-2.5 border-2 border-slate-300 rounded-xl bg-white text-slate-900 font-medium min-h-[48px] focus:border-teal-700"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.address})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1.5">
                2. What type of problem are you reporting? <span className="text-rose-600">*</span>
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {PROBLEM_CATEGORIES.map((cat) => {
                  const isSelected = problemType === cat.type;
                  return (
                    <div
                      key={cat.type}
                      onClick={() => setProblemType(cat.type)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-50/80 text-amber-950 font-medium shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <span className="text-xl shrink-0">{cat.icon}</span>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900">{cat.type}</div>
                        <div className="text-[11px] text-slate-500 leading-snug">{cat.description}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Continue to Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STAGE 2: Problem Description, Location & Photo */}
        {step === 2 && (
          <form onSubmit={handleNextToReview} className="space-y-4">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900">{selectedBuilding?.name}</div>
              <div className="text-xs text-slate-500">{problemType}</div>
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Where exactly in the building is this problem?
              </label>
              <input
                type="text"
                placeholder="e.g. North main entrance door, 2nd floor women's toilet, West parking ramp..."
                value={locationInBuilding}
                onChange={(e) => setLocationInBuilding(e.target.value)}
                className="w-full p-2.5 border-2 border-slate-300 rounded-xl bg-white text-slate-900 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Describe the problem clearly <span className="text-rose-600">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Explain what is blocking access or broken. (e.g. The automatic door button is not responding, or trash bins are parked across the entire ramp width...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 border-2 border-slate-300 rounded-xl bg-white text-slate-900"
              />
            </div>

            {/* Photo Attachment (Sample or URL) */}
            <div>
              <label className="block font-bold text-slate-900 mb-1">
                Attach Photo Evidence (Optional)
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhotoUrl(IMAGES.rampSteep)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    photoUrl === IMAGES.rampSteep
                      ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Attach Obstacle Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPhotoUrl(IMAGES.courthouse)}
                  className={`min-h-[40px] px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    photoUrl === IMAGES.courthouse
                      ? 'bg-amber-100 text-amber-900 border-amber-400 font-bold'
                      : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Attach Entrance Photo</span>
                </button>

                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="text-xs text-rose-600 underline font-semibold ml-2 min-h-[40px]"
                  >
                    Remove Photo
                  </button>
                )}
              </div>

              {photoUrl && (
                <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border-2 border-amber-400 shadow-2xs">
                  <img src={photoUrl} alt="Attached evidence" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-1 py-0.2 rounded font-bold">
                    Attached
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[44px] px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <span>Review & Submit</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STAGE 3: Review, Duplicate Detection & Link */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Report Summary</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  Status: User-reported
                </span>
              </div>
              <div className="font-bold text-slate-900 text-sm">{selectedBuilding?.name}</div>
              <div className="text-xs text-slate-700">
                <strong>Type:</strong> {problemType}
              </div>
              {locationInBuilding && (
                <div className="text-xs text-slate-700">
                  <strong>Location:</strong> {locationInBuilding}
                </div>
              )}
              <div className="text-xs text-slate-700 leading-relaxed">
                <strong>Description:</strong> {description}
              </div>
            </div>

            {/* Smart Duplicate Check: Offer to Link to Existing Issue */}
            {similarExistingIssue ? (
              <div className="p-3.5 rounded-xl border-2 border-sky-300 bg-sky-50 text-xs text-sky-950 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-sky-900">
                  <Link2 className="w-4 h-4 text-sky-700" />
                  <span>Similar Problem Already on Record</span>
                </div>
                <p className="text-sky-900">
                  A barrier of this type is already recorded in the building's inspection records:
                  <em className="block font-medium mt-1">"{similarExistingIssue.notes}"</em>
                </p>
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={linkToExisting}
                      onChange={(e) => setLinkToExisting(e.target.checked)}
                      className="w-4 h-4 text-teal-700 rounded border-slate-300 focus:ring-teal-700"
                    />
                    <span className="font-bold text-slate-900">
                      Link my report to this existing issue (Prevents duplicate records)
                    </span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-100 text-slate-700 text-xs">
                No existing barrier of this category was previously logged for this building. This will be recorded as a new user-reported problem.
              </div>
            )}

            {/* Civic Honesty Notice */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Civic Prototype Notice:</strong> Your report will appear immediately as <em>"User-reported"</em> on the public map to alert other citizens. It does not automatically dispatch municipal workers unless verified on-site.
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[44px] px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="min-h-[44px] px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Submit Problem Report</span>
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: Success Confirmation */}
        {step === 4 && submittedReport && (
          <div className="space-y-5 text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Problem Report Recorded!</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you for helping keep public spaces accessible. Your report is now visible to other citizens.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-1">
              <div>
                <strong>Report ID:</strong> <span className="font-mono text-teal-800">{submittedReport.id}</span>
              </div>
              <div>
                <strong>Building:</strong> {submittedReport.buildingName}
              </div>
              <div>
                <strong>Problem:</strong> {submittedReport.problemType}
              </div>
              <div>
                <strong>Current Status:</strong>{' '}
                <span className="font-bold text-amber-800">{submittedReport.status}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="w-full min-h-[44px] px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              Done & Return to Map
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
