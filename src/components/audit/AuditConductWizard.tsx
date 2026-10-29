import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AUDIT_QUESTIONS,
  AUDIT_SECTIONS,
} from '../../utils/auditQuestions';
import {
  calculateAccessibilityScore,
  getTierColorClass,
} from '../../utils/scoring';
import {
  TRANSLATIONS,
  QUESTION_TRANSLATIONS_HI,
} from '../../utils/translations';
import {
  AuditSectionId,
  QuestionResponseValue,
  PriorityLevel,
} from '../../types';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  HelpCircle,
  Camera,
  Upload,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Save,
  ShieldAlert,
  Info,
  Building2,
  TrendingUp,
  TrendingDown,
  Layers,
  MapPin,
  Ruler,
  AlertCircle,
  Check,
} from 'lucide-react';
import { ScoringExplainerModal } from './ScoringExplainerModal';
import { IMAGES } from '../../data/initialData';

export const AuditConductWizard: React.FC = () => {
  const {
    auditDraft,
    cancelAudit,
    saveDraft,
    updateDraftResponse,
    updateDraftMeta,
    updateDraftSectionIndex,
    submitAudit,
    selectedBuilding,
    getLatestAudit,
    language,
  } = useApp();

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [photoPickerOpenFor, setPhotoPickerOpenFor] = useState<string | null>(null);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [expandedExplainerFor, setExpandedExplainerFor] = useState<string | null>(null);

  // Stepper View Mode: 'single' (focused one question at a time for older adults/minimal clutter) vs 'all'
  const [questionViewMode, setQuestionViewMode] = useState<'single' | 'all'>('single');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Voice Assistant State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedbackMessage, setVoiceFeedbackMessage] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  const currentSectionIndex = auditDraft?.currentSectionIndex ?? 0;
  const currentSection = AUDIT_SECTIONS[currentSectionIndex] || AUDIT_SECTIONS[0];
  const sectionQuestions = AUDIT_QUESTIONS.filter((q) => q.sectionId === currentSection.id);

  // Reset active question index when section changes
  useEffect(() => {
    setActiveQuestionIndex(0);
  }, [currentSectionIndex]);

  // Live Score calculation
  const liveCalculation = auditDraft
    ? calculateAccessibilityScore(auditDraft.responses)
    : null;
  const tierColor = liveCalculation ? getTierColorClass(liveCalculation.statusTier) : null;

  // Re-audit previous score comparison
  const latestPriorAudit = selectedBuilding ? getLatestAudit(selectedBuilding.id) : null;
  const previousScore = latestPriorAudit ? latestPriorAudit.overallScore : null;
  const scoreDiff =
    liveCalculation && liveCalculation.overallScore !== null && previousScore !== null
      ? liveCalculation.overallScore - previousScore
      : null;

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  if (!auditDraft || !selectedBuilding) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-xl">
        <p className="text-slate-600">No active audit session found.</p>
        <button
          onClick={cancelAudit}
          className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Voice: Read question or section instructions aloud
  const handleReadAloud = (textToRead: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoiceFeedbackMessage('Text-to-speech is not supported by your current browser.');
      return;
    }

    window.speechSynthesis.cancel();
    if (isSpeaking) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setVoiceFeedbackMessage(language === 'hi' ? 'आवाज़ में पढ़ रहा है...' : 'Reading aloud...');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setVoiceFeedbackMessage('');
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceFeedbackMessage('');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Voice: Start listening for spoken answer ("Yes", "Partially", "No", "Skip", "Next")
  const handleStartVoiceAnswer = (questionId: string) => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceFeedbackMessage(
        language === 'hi'
          ? 'इस ब्राउज़र में स्पीच रिकग्निशन समर्थित नहीं है। कृपया बटनों का उपयोग करें।'
          : 'Speech recognition is not supported in this browser. Please use the visual buttons.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.abort();
      setIsListening(false);
      setVoiceFeedbackMessage('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedbackMessage(
          language === 'hi'
            ? 'सुन रहा है... बोलें: "हाँ", "आंशिक", "नहीं", या "लागू नहीं"'
            : 'Listening... say: "Yes", "Partially", "No", or "Not Applicable"'
        );
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.toLowerCase().trim();
        setIsListening(false);

        if (spoken.includes('yes') || spoken.includes('हाँ') || spoken.includes('ha')) {
          updateDraftResponse(questionId, { status: 'yes' });
          setVoiceFeedbackMessage(language === 'hi' ? 'उत्तर दर्ज: हाँ' : 'Recorded: Yes');
        } else if (spoken.includes('part') || spoken.includes('आंशिक') || spoken.includes('aanshik')) {
          updateDraftResponse(questionId, { status: 'partially', priority: 'medium' });
          setVoiceFeedbackMessage(language === 'hi' ? 'उत्तर दर्ज: आंशिक' : 'Recorded: Partially');
        } else if (spoken.includes('no') || spoken.includes('नहीं') || spoken.includes('nahi')) {
          updateDraftResponse(questionId, { status: 'no', priority: 'high' });
          setVoiceFeedbackMessage(language === 'hi' ? 'उत्तर दर्ज: नहीं' : 'Recorded: No');
        } else if (spoken.includes('applicable') || spoken.includes('लागू')) {
          updateDraftResponse(questionId, { status: 'not_applicable' });
          setVoiceFeedbackMessage(language === 'hi' ? 'उत्तर दर्ज: लागू नहीं' : 'Recorded: Not Applicable');
        } else if (spoken.includes('next') || spoken.includes('अगला')) {
          handleNextSection();
        } else {
          setVoiceFeedbackMessage(
            language === 'hi'
              ? `पहचाना गया: "${spoken}". कृपया हाँ, आंशिक या नहीं बोलें।`
              : `Heard: "${spoken}". Try saying "Yes", "Partially", or "No".`
          );
        }
      };

      recognition.onerror = (err: any) => {
        setIsListening(false);
        setVoiceFeedbackMessage(
          err.error === 'not-allowed'
            ? 'Microphone access denied. You can continue using visual buttons.'
            : 'Voice input timed out or failed. Please tap a button.'
        );
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsListening(false);
      console.warn('Speech recognition start failed', e);
    }
  };

  const handleFileUpload = (questionId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateDraftResponse(questionId, { photoUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAndNotify = () => {
    saveDraft();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 3000);
  };

  const handleNextSection = () => {
    if (currentSectionIndex < AUDIT_SECTIONS.length - 1) {
      updateDraftSectionIndex(currentSectionIndex + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevSection = () => {
    if (currentSectionIndex > 0) {
      updateDraftSectionIndex(currentSectionIndex - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditDraft.auditorName.trim()) {
      alert('Please enter the auditor name or inspecting organization.');
      return;
    }
    submitAudit();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={cancelAudit}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-lg border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-teal-700"
            title="Cancel audit and return"
            aria-label="Return to audit dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>{auditDraft.isReaudit ? 'Verification Re-Audit' : 'Accessibility Inspection'}</span>
              <span>·</span>
              <span>{selectedBuilding.category}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
              {selectedBuilding.name}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Save & Resume Later */}
          <button
            type="button"
            onClick={handleSaveAndNotify}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <Save className="w-4 h-4 text-slate-500" />
            <span>{savedFeedback ? 'Draft Saved!' : t.saveDraft}</span>
          </button>

          {/* Scoring Method */}
          <button
            type="button"
            onClick={() => setShowScoringModal(true)}
            className="min-h-[44px] px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <HelpCircle className="w-4 h-4 text-teal-800" />
            <span>{t.scoringMethod}</span>
          </button>

          {/* Publish / Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            className="min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            {auditDraft.isReaudit ? t.publishReaudit : t.publishAudit}
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Section Checklist (8 cols on lg), Right is Scorecard & Stats (4 cols on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & Questions (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Re-audit notice if applicable */}
          {auditDraft.isReaudit && latestPriorAudit && (
            <div className="p-4 rounded-xl border border-sky-300 bg-sky-50 text-sky-950 text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold text-sky-900 text-sm">
                <CheckCircle2 className="w-4 h-4 text-sky-700" />
                <span>Re-Audit Mode: Comparing Against Version {latestPriorAudit.version}</span>
              </div>
              <p className="leading-relaxed">
                Prior recorded score was <strong>{latestPriorAudit.overallScore}/100</strong> ({latestPriorAudit.auditDate}). Review the previous findings, inspect physical remediations, and record updated statuses to verify actual improvements.
              </p>
            </div>
          )}

          {/* Auditor Credentials Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-teal-800" />
              <span>Auditor Scope & Inspection Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-800 mb-1">
                  Auditor Name / Team <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Maria Gonzalez, PE or Civic Access Collective"
                  value={auditDraft.auditorName}
                  onChange={(e) => updateDraftMeta('auditorName', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 min-h-[40px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Inspection Date</label>
                <input
                  type="date"
                  value={auditDraft.auditDate}
                  onChange={(e) => updateDraftMeta('auditDate', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 min-h-[40px]"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-800 mb-1">
                  Overall Building Inspection Summary & Environmental Conditions
                </label>
                <textarea
                  rows={2}
                  placeholder="State weather, ongoing renovations, public service counters visited, and entry paths evaluated..."
                  value={auditDraft.summary}
                  onChange={(e) => updateDraftMeta('summary', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 focus:border-teal-700 focus:ring-1 focus:ring-teal-700"
                />
              </div>
            </div>
          </div>

          {/* Section Step Tabs (5 Steps) */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>INSPECTION SECTIONS</span>
              <span>Step {currentSectionIndex + 1} of {AUDIT_SECTIONS.length}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {AUDIT_SECTIONS.map((sec, idx) => {
                const isActive = idx === currentSectionIndex;
                const secQCount = AUDIT_QUESTIONS.filter((q) => q.sectionId === sec.id).length;
                const answeredSecQ = AUDIT_QUESTIONS.filter(
                  (q) => q.sectionId === sec.id && auditDraft.responses[q.id]?.status !== 'not_inspected' && auditDraft.responses[q.id]?.status !== undefined
                ).length;
                const isComplete = answeredSecQ === secQCount;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => updateDraftSectionIndex(idx)}
                    className={`min-h-[44px] p-2 rounded-lg text-left transition-all border ${
                      isActive
                        ? 'bg-teal-900 text-white border-teal-900 shadow-sm'
                        : isComplete
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-[10px] font-bold opacity-80">Section {idx + 1}</div>
                    <div className="text-xs font-bold truncate">{sec.shortTitle}</div>
                    <div className="text-[10px] mt-0.5 opacity-75">
                      {answeredSecQ}/{secQCount} answered
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Section Banner & Voice Assistant Bar */}
          <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold tracking-wider text-teal-300 uppercase">
                  Section {currentSectionIndex + 1} of {AUDIT_SECTIONS.length}
                </span>
                <h2 className="text-lg font-bold text-white">{currentSection.title}</h2>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {currentSection.description}
                </p>
              </div>

              {/* Voice Read Aloud Section Button */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    handleReadAloud(
                      `${currentSection.title}. ${currentSection.description}. There are ${sectionQuestions.length} questions in this section.`
                    )
                  }
                  className="min-h-[44px] px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
                  aria-label="Read section instructions aloud"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4 text-teal-300" />}
                  <span>{isSpeaking ? t.stopVoice : t.readAloud}</span>
                </button>
              </div>
            </div>

            {/* Live voice feedback status */}
            {voiceFeedbackMessage && (
              <div
                aria-live="polite"
                className="p-2.5 rounded-lg bg-teal-950/80 border border-teal-700/60 text-teal-200 text-xs flex items-center gap-2"
              >
                <Mic className="w-4 h-4 text-teal-400 animate-pulse" />
                <span>{voiceFeedbackMessage}</span>
              </div>
            )}
          </div>

          {/* Question View Mode Toggle (Focused 1-question vs All) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                {questionViewMode === 'single'
                  ? `Question ${activeQuestionIndex + 1} of ${sectionQuestions.length} in this section`
                  : `Showing all ${sectionQuestions.length} questions in this section`}
              </span>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setQuestionViewMode('single')}
                className={`min-h-[38px] px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  questionViewMode === 'single'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                One Question at a Time (Focused)
              </button>
              <button
                type="button"
                onClick={() => setQuestionViewMode('all')}
                className={`min-h-[38px] px-3 py-1.5 rounded-md font-semibold transition-colors ${
                  questionViewMode === 'all'
                    ? 'bg-white text-teal-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Questions in Section
              </button>
            </div>
          </div>

          {/* Section Questions List */}
          <div className="space-y-6">
            {(questionViewMode === 'single'
              ? [sectionQuestions[activeQuestionIndex]].filter(Boolean)
              : sectionQuestions
            ).map((q, rawIndex) => {
              const qIndex = questionViewMode === 'single' ? activeQuestionIndex : rawIndex;
              const resp = auditDraft.responses[q.id] || { status: 'not_inspected' };
              const isBarrier = resp.status === 'no' || resp.status === 'partially';

              // Localized text for question
              const qText =
                language === 'hi' && QUESTION_TRANSLATIONS_HI[q.id]
                  ? QUESTION_TRANSLATIONS_HI[q.id].question
                  : q.question;
              const qDesc =
                language === 'hi' && QUESTION_TRANSLATIONS_HI[q.id]
                  ? QUESTION_TRANSLATIONS_HI[q.id].description
                  : q.description;
              const qWhy =
                language === 'hi' && QUESTION_TRANSLATIONS_HI[q.id]
                  ? QUESTION_TRANSLATIONS_HI[q.id].whyItMatters
                  : q.whyItMatters;

              return (
                <div
                  key={q.id}
                  className={`bg-white border rounded-xl p-5 space-y-4 transition-all shadow-xs ${
                    resp.status === 'no'
                      ? 'border-rose-300 ring-1 ring-rose-200'
                      : resp.status === 'partially'
                      ? 'border-amber-300 ring-1 ring-amber-200'
                      : resp.status === 'yes'
                      ? 'border-emerald-300'
                      : resp.status === 'not_applicable'
                      ? 'border-slate-300 bg-slate-50/50'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Question Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-slate-500">
                          Q{qIndex + 1}
                        </span>
                        {q.isCritical && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-200 uppercase tracking-wider">
                            Critical Accessibility Barrier
                          </span>
                        )}
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-mono text-[11px]">
                          Standard: {q.guidelineReference}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {qText}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{qDesc}</p>

                      <div className="pt-0.5">
                        <button
                          type="button"
                          onClick={() => setExpandedExplainerFor(expandedExplainerFor === q.id ? null : q.id)}
                          className="text-xs text-teal-800 hover:text-teal-950 font-semibold flex items-center gap-1 focus-visible:ring-1 focus-visible:ring-teal-700 rounded py-0.5"
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-teal-700" />
                          <span>{t.whatDoesThisMean}</span>
                        </button>

                        {expandedExplainerFor === q.id && (
                          <div className="mt-2 p-3 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-950 space-y-1">
                            <div className="font-bold">Everyday Meaning:</div>
                            <p className="leading-relaxed text-teal-900">
                              {q.description} Look around the area: does anything prevent a person using a wheelchair, walking cane, guide dog, or stroller from completing this step independently and safely?
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question-level Voice Buttons */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleReadAloud(
                            `${qText}. ${qDesc}. Why it matters: ${qWhy}. Answer options are: Yes, Partially, No, or Not Applicable.`
                          )
                        }
                        title="Listen to question"
                        aria-label={`Read question ${qIndex + 1} aloud`}
                        className="min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartVoiceAnswer(q.id)}
                        title="Speak your answer"
                        aria-label={`Answer question ${qIndex + 1} by voice`}
                        className={`min-h-[40px] min-w-[40px] flex items-center justify-center p-2 rounded-lg border transition-colors ${
                          isListening
                            ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Large Accessible Response Buttons (>= 44x44px target) */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">
                      Select Inspection Finding:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {/* YES */}
                      <button
                        type="button"
                        onClick={() =>
                          updateDraftResponse(q.id, {
                            status: 'yes',
                            priority: undefined,
                            recommendedFix: undefined,
                            actionStatus: undefined,
                          })
                        }
                        className={`min-h-[50px] p-2.5 rounded-lg border text-left flex flex-col justify-center transition-all ${
                          resp.status === 'yes'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm ring-2 ring-emerald-500'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-emerald-50 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{t.options.yes.label}</span>
                        </div>
                        <div className={`text-[10px] mt-0.5 leading-tight ${resp.status === 'yes' ? 'text-emerald-100' : 'text-slate-500'}`}>
                          100 pts
                        </div>
                      </button>

                      {/* PARTIALLY */}
                      <button
                        type="button"
                        onClick={() =>
                          updateDraftResponse(q.id, {
                            status: 'partially',
                            priority: resp.priority || q.defaultPriority,
                            actionStatus: resp.actionStatus || 'reported',
                          })
                        }
                        className={`min-h-[50px] p-2.5 rounded-lg border text-left flex flex-col justify-center transition-all ${
                          resp.status === 'partially'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-400'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-amber-50 hover:border-amber-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>{t.options.partially.label}</span>
                        </div>
                        <div className={`text-[10px] mt-0.5 leading-tight ${resp.status === 'partially' ? 'text-amber-100' : 'text-slate-500'}`}>
                          50 pts
                        </div>
                      </button>

                      {/* NO */}
                      <button
                        type="button"
                        onClick={() =>
                          updateDraftResponse(q.id, {
                            status: 'no',
                            priority: resp.priority || q.defaultPriority,
                            actionStatus: resp.actionStatus || 'reported',
                          })
                        }
                        className={`min-h-[50px] p-2.5 rounded-lg border text-left flex flex-col justify-center transition-all ${
                          resp.status === 'no'
                            ? 'bg-rose-700 text-white border-rose-700 shadow-sm ring-2 ring-rose-500'
                            : 'bg-white text-slate-800 border-slate-300 hover:bg-rose-50 hover:border-rose-400'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <XCircle className="w-4 h-4 shrink-0" />
                          <span>{t.options.no.label}</span>
                        </div>
                        <div className={`text-[10px] mt-0.5 leading-tight ${resp.status === 'no' ? 'text-rose-100' : 'text-slate-500'}`}>
                          0 pts (Barrier)
                        </div>
                      </button>

                      {/* NOT APPLICABLE */}
                      <button
                        type="button"
                        onClick={() =>
                          updateDraftResponse(q.id, {
                            status: 'not_applicable',
                            priority: undefined,
                            recommendedFix: undefined,
                            actionStatus: undefined,
                          })
                        }
                        className={`min-h-[50px] p-2.5 rounded-lg border text-left flex flex-col justify-center transition-all ${
                          resp.status === 'not_applicable'
                            ? 'bg-slate-700 text-white border-slate-700 shadow-sm ring-2 ring-slate-500'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold text-xs">
                          <MinusCircle className="w-4 h-4 shrink-0" />
                          <span>{t.options.not_applicable.label}</span>
                        </div>
                        <div className={`text-[10px] mt-0.5 leading-tight ${resp.status === 'not_applicable' ? 'text-slate-200' : 'text-slate-500'}`}>
                          Excluded
                        </div>
                      </button>

                      {/* NOT INSPECTED (SKIP) */}
                      <button
                        type="button"
                        onClick={() =>
                          updateDraftResponse(q.id, {
                            status: 'not_inspected',
                          })
                        }
                        className={`min-h-[50px] p-2.5 rounded-lg border text-left flex flex-col justify-center transition-all ${
                          resp.status === 'not_inspected'
                            ? 'bg-slate-200 text-slate-900 border-slate-400 font-bold'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <span>{t.options.not_inspected.label}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                          Skip / Unanswered
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Why It Matters Callout */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-teal-800" />
                      <span>Why This Matters to Persons with Disabilities:</span>
                    </div>
                    <p className="leading-relaxed text-slate-600">{qWhy}</p>
                  </div>

                  {/* Problem Documentation (Location, Measurements, Photo, Corrective Action) */}
                  <div className="pt-3 border-t border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-500" />
                          <span>Specific Location in Building</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Main East Entrance, 2nd Floor North Restroom"
                          value={resp.location || ''}
                          onChange={(e) => updateDraftResponse(q.id, { location: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 min-h-[38px]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                          <Ruler className="w-3.5 h-3.5 text-slate-500" />
                          <span>Field Measurements (if known)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Door width 740mm, ramp slope 1:8, threshold rise 35mm"
                          value={resp.measurement || ''}
                          onChange={(e) => updateDraftResponse(q.id, { measurement: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 min-h-[38px]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-800 mb-1">
                        Auditor Notes & Observed Obstacles
                      </label>
                      <input
                        type="text"
                        placeholder="Detailed observations on physical materials, lighting, surface grip, obstructions..."
                        value={resp.notes || ''}
                        onChange={(e) => updateDraftResponse(q.id, { notes: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 min-h-[38px]"
                      />
                    </div>

                    {/* If Barrier: Suggested Corrective Action & Priority */}
                    {isBarrier && (
                      <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="sm:col-span-2">
                            <label className="block font-semibold text-slate-800 mb-1">
                              Recommended Corrective Action
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Install dual continuous handrails at 900mm height with 300mm extensions."
                              value={resp.recommendedFix || ''}
                              onChange={(e) =>
                                updateDraftResponse(q.id, { recommendedFix: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 min-h-[38px]"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-800 mb-1">
                              Assigned Priority Level
                            </label>
                            <div className="flex items-center gap-1">
                              {(['high', 'medium', 'low'] as PriorityLevel[]).map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => updateDraftResponse(q.id, { priority: p })}
                                  className={`flex-1 min-h-[38px] py-1 text-xs font-bold rounded-lg border capitalize transition-colors ${
                                    (resp.priority || q.defaultPriority) === p
                                      ? p === 'high'
                                        ? 'bg-rose-700 text-white border-rose-700'
                                        : p === 'medium'
                                        ? 'bg-amber-600 text-white border-amber-600'
                                        : 'bg-blue-700 text-white border-blue-700'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Photograph Evidence */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-3">
                        {resp.photoUrl ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={resp.photoUrl}
                              alt="Barrier evidence"
                              className="w-14 h-12 object-cover rounded-lg border border-slate-300"
                            />
                            <div>
                              <div className="font-semibold text-slate-800">Photo Attached</div>
                              <button
                                type="button"
                                onClick={() => updateDraftResponse(q.id, { photoUrl: undefined })}
                                className="text-rose-700 hover:text-rose-900 underline text-[11px]"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">No photograph attached</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setPhotoPickerOpenFor(photoPickerOpenFor === q.id ? null : q.id)
                          }
                          className="min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors font-medium"
                        >
                          <Camera className="w-4 h-4 text-slate-600" />
                          <span>Choose Sample Photo</span>
                        </button>

                        <label className="min-h-[40px] flex items-center gap-1.5 px-3 py-1.5 text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg cursor-pointer transition-colors font-medium">
                          <Upload className="w-4 h-4 text-slate-600" />
                          <span>Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(q.id, e)}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Sample Photo Picker Library */}
                    {photoPickerOpenFor === q.id && (
                      <div className="p-3 bg-slate-100 rounded-xl border border-slate-300 space-y-2">
                        <div className="font-bold text-slate-800 text-xs">
                          Select from photo evidence archive:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              updateDraftResponse(q.id, { photoUrl: IMAGES.rampSteep });
                              setPhotoPickerOpenFor(null);
                            }}
                            className="text-left group border border-slate-300 rounded-lg overflow-hidden bg-white hover:border-teal-700"
                          >
                            <img src={IMAGES.rampSteep} alt="Steep Ramp" className="w-full h-16 object-cover" />
                            <div className="p-1.5 text-[11px] font-semibold text-slate-800 group-hover:text-teal-900 truncate">
                              Steep Pavers / Steps
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateDraftResponse(q.id, { photoUrl: IMAGES.accessibleDoor });
                              setPhotoPickerOpenFor(null);
                            }}
                            className="text-left group border border-slate-300 rounded-lg overflow-hidden bg-white hover:border-teal-700"
                          >
                            <img src={IMAGES.accessibleDoor} alt="Accessible Door" className="w-full h-16 object-cover" />
                            <div className="p-1.5 text-[11px] font-semibold text-slate-800 group-hover:text-teal-900 truncate">
                              Automatic Portal
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateDraftResponse(q.id, { photoUrl: IMAGES.courthouse });
                              setPhotoPickerOpenFor(null);
                            }}
                            className="text-left group border border-slate-300 rounded-lg overflow-hidden bg-white hover:border-teal-700"
                          >
                            <img src={IMAGES.courthouse} alt="Switchback Ramp" className="w-full h-16 object-cover" />
                            <div className="p-1.5 text-[11px] font-semibold text-slate-800 group-hover:text-teal-900 truncate">
                              Switchback Ramp
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              updateDraftResponse(q.id, { photoUrl: IMAGES.civicCentre });
                              setPhotoPickerOpenFor(null);
                            }}
                            className="text-left group border border-slate-300 rounded-lg overflow-hidden bg-white hover:border-teal-700"
                          >
                            <img src={IMAGES.civicCentre} alt="Civic Plaza" className="w-full h-16 object-cover" />
                            <div className="p-1.5 text-[11px] font-semibold text-slate-800 group-hover:text-teal-900 truncate">
                              Plaza Level Path
                            </div>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Single Question Stepper Controls (When in 'single' focused mode) */}
          {questionViewMode === 'single' && (
            <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
              <button
                type="button"
                disabled={activeQuestionIndex === 0 && currentSectionIndex === 0}
                onClick={() => {
                  if (activeQuestionIndex > 0) {
                    setActiveQuestionIndex(activeQuestionIndex - 1);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  } else if (currentSectionIndex > 0) {
                    handlePrevSection();
                  }
                }}
                className={`min-h-[44px] px-4 py-2 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors ${
                  activeQuestionIndex === 0 && currentSectionIndex === 0
                    ? 'text-slate-500 bg-slate-800 cursor-not-allowed'
                    : 'text-slate-200 bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{activeQuestionIndex > 0 ? 'Previous Question' : 'Previous Section'}</span>
              </button>

              <div className="text-center">
                <div className="text-xs font-bold text-teal-300">
                  Question {activeQuestionIndex + 1} of {sectionQuestions.length}
                </div>
                <div className="text-[10px] text-slate-400">
                  {currentSection.shortTitle}
                </div>
              </div>

              {activeQuestionIndex < sectionQuestions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveQuestionIndex(activeQuestionIndex + 1);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="min-h-[44px] px-5 py-2 text-xs font-bold text-slate-900 bg-teal-300 hover:bg-teal-200 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : currentSectionIndex < AUDIT_SECTIONS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNextSection}
                  className="min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <span>Next Section</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="min-h-[44px] px-6 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-600 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Finish & Publish</span>
                </button>
              )}
            </div>
          )}

          {/* Section Step Navigation Footer */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
            <button
              type="button"
              disabled={currentSectionIndex === 0}
              onClick={handlePrevSection}
              className={`min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                currentSectionIndex === 0
                  ? 'text-slate-300 bg-slate-100 cursor-not-allowed'
                  : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous Section</span>
            </button>

            <div className="text-xs text-slate-500 font-semibold hidden sm:block">
              {currentSectionIndex + 1} of {AUDIT_SECTIONS.length} Sections
            </div>

            {currentSectionIndex < AUDIT_SECTIONS.length - 1 ? (
              <button
                type="button"
                onClick={handleNextSection}
                className="min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Next Section</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="min-h-[44px] px-6 py-2 text-xs font-bold text-white bg-teal-800 hover:bg-teal-900 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Complete & Publish Audit</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Live Scorecard, Completion %, Critical Barriers (4 cols) */}
        <div className="lg:col-span-4 space-y-6 sticky top-20">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Live Audit Calculation
              </span>
              <button
                type="button"
                onClick={() => setShowScoringModal(true)}
                className="text-xs text-teal-800 hover:text-teal-950 underline font-medium"
              >
                Formula
              </button>
            </div>

            {/* Score & Tier Highlight */}
            <div className="text-center space-y-2">
              <div className="font-mono">
                {liveCalculation && liveCalculation.overallScore !== null ? (
                  <div className="inline-flex items-baseline gap-1">
                    <span className="text-5xl font-black text-slate-900 tabular-nums">
                      {liveCalculation.overallScore}
                    </span>
                    <span className="text-lg text-slate-400 font-medium">/ 100</span>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-slate-500 py-3">Score Unavailable</div>
                )}
              </div>

              {tierColor && liveCalculation && (
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs ${tierColor.badge}`}>
                    {liveCalculation.statusTier}
                  </span>
                </div>
              )}

              {/* Re-Audit improvement comparison */}
              {previousScore !== null && liveCalculation && liveCalculation.overallScore !== null && (
                <div className="pt-2 flex items-center justify-center gap-1.5 text-xs">
                  <span className="text-slate-500">Prior: {previousScore}/100</span>
                  <span>·</span>
                  {scoreDiff !== null && (
                    <span
                      className={`inline-flex items-center font-bold font-mono ${
                        scoreDiff > 0
                          ? 'text-emerald-700'
                          : scoreDiff < 0
                          ? 'text-rose-700'
                          : 'text-slate-600'
                      }`}
                    >
                      {scoreDiff > 0 ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />+{scoreDiff} pts
                        </>
                      ) : scoreDiff < 0 ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                          {scoreDiff} pts
                        </>
                      ) : (
                        'No change'
                      )}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Assessment Completion Progress Bar (Separate from score) */}
            <div className="space-y-1.5 py-2 border-y border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700">Audit Completion:</span>
                <span className="font-mono text-slate-900 tabular-nums">
                  {liveCalculation ? liveCalculation.completionPercentage : 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-teal-700 h-full rounded-full transition-all duration-300"
                  style={{ width: `${liveCalculation ? liveCalculation.completionPercentage : 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{liveCalculation ? liveCalculation.totalAnswered : 0} answered</span>
                <span>{liveCalculation ? liveCalculation.totalUnanswered : 0} unanswered</span>
              </div>
            </div>

            {/* Critical Barriers Alert (A high score must never conceal critical barriers) */}
            {liveCalculation && liveCalculation.criticalBarriersCount > 0 && (
              <div className="p-3 rounded-lg border border-rose-300 bg-rose-50 text-rose-950 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
                  <span>
                    {liveCalculation.criticalBarriersCount} Critical Barrier
                    {liveCalculation.criticalBarriersCount > 1 ? 's' : ''} Flagged
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 leading-snug">
                  High-severity structural hazards (such as entrance steps or inaccessible toilets) remain flagged regardless of the overall score.
                </p>
              </div>
            )}

            {/* Category Breakdown Progress */}
            <div className="space-y-2.5">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Scores by Section
              </div>
              {AUDIT_SECTIONS.map((sec) => {
                const sScore = liveCalculation?.sectionScores[sec.id] || {
                  earned: 0,
                  possible: 0,
                  percent: 0,
                  answeredCount: 0,
                  totalCount: 0,
                };
                return (
                  <div key={sec.id} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 truncate max-w-[160px] font-medium">
                        {sec.shortTitle}
                      </span>
                      <span className="font-mono text-slate-900 tabular-nums">
                        {sScore.possible > 0 ? `${sScore.percent}%` : '—'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          sScore.percent >= 80
                            ? 'bg-emerald-600'
                            : sScore.percent >= 50
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

            {/* Submission Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full min-h-[44px] py-2.5 text-xs font-bold text-white bg-teal-800 rounded-lg hover:bg-teal-900 transition-colors shadow-xs"
              >
                {auditDraft.isReaudit ? t.publishReaudit : t.publishAudit}
              </button>
              <button
                type="button"
                onClick={handleSaveAndNotify}
                className="w-full min-h-[44px] py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                {savedFeedback ? 'Progress Saved to Browser!' : t.saveDraft}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ScoringExplainerModal
        isOpen={showScoringModal}
        onClose={() => setShowScoringModal(false)}
      />
    </div>
  );
};
