import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Building,
  AuditRecord,
  AssistanceRequest,
  AppView,
  ActiveAuditDraft,
  ItemAuditResponse,
  RequestStatus,
  CorrectiveActionStatus,
  AppLanguage,
  UserMode,
  ActionHistoryEntry,
  CitizenProblemReport,
  ProblemCategory,
} from '../types';
import {
  INITIAL_BUILDINGS,
  INITIAL_AUDIT_RECORDS,
  INITIAL_ASSISTANCE_REQUESTS,
  INITIAL_PROBLEM_REPORTS,
} from '../data/initialData';
import { AUDIT_QUESTIONS } from '../utils/auditQuestions';
import { calculateAccessibilityScore } from '../utils/scoring';

interface AppContextType {
  userMode: UserMode;
  setUserMode: (mode: UserMode) => void;
  buildings: Building[];
  audits: AuditRecord[];
  requests: AssistanceRequest[];
  problemReports: CitizenProblemReport[];
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedBuildingId: string | null;
  setSelectedBuildingId: (id: string | null) => void;
  selectedBuilding: Building | undefined;

  // Modals & Navigation Helpers
  buildingProfileModalId: string | null;
  setBuildingProfileModalId: (id: string | null) => void;
  showHelpModal: boolean;
  setShowHelpModal: (show: boolean) => void;
  showReportProblemModal: boolean;
  setShowReportProblemModal: (show: boolean, buildingId?: string) => void;

  // Problem Reporting
  submitProblemReport: (data: {
    buildingId: string;
    problemType: ProblemCategory;
    description: string;
    location?: string;
    photoUrl?: string;
    linkedQuestionId?: string;
  }) => CitizenProblemReport;
  updateProblemReportStatus: (
    reportId: string,
    status: CitizenProblemReport['status'],
    assignedTo?: string
  ) => void;

  // Building Registration
  registerBuilding: (data: {
    name: string;
    category: Building['category'];
    address: string;
    city: string;
    district: string;
    department?: string;
    phone?: string;
    hours?: string;
    description?: string;
    imageUrl?: string;
  }) => string;

  // Audit workflow
  isAuditing: boolean;
  auditDraft: ActiveAuditDraft | null;
  hasSavedDraft: boolean;
  startAudit: (buildingId: string, isReaudit?: boolean) => void;
  saveDraft: () => void;
  resumeDraft: () => void;
  cancelAudit: () => void;
  updateDraftResponse: (questionId: string, response: Partial<ItemAuditResponse>) => void;
  updateDraftMeta: (
    field: 'auditorName' | 'auditorRole' | 'summary' | 'auditDate',
    value: string
  ) => void;
  updateDraftSectionIndex: (index: number) => void;
  submitAudit: () => AuditRecord;

  // Corrective action tracking & verification
  updateIssueActionStatus: (
    buildingId: string,
    questionId: string,
    actionStatus: CorrectiveActionStatus,
    assignedTo?: string,
    actionNotes?: string,
    verificationResult?: 'passed' | 'failed' | 'pending',
    verificationNotes?: string,
    verifiedBy?: string,
    flaggedForReinspection?: boolean
  ) => void;

  citizenReportBarrier: (
    buildingId: string,
    questionId: string,
    notes: string,
    photoUrl?: string,
    location?: string
  ) => void;

  // Assistance requests workflow
  submitAssistanceRequest: (
    data: Omit<AssistanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => string;
  updateRequestStatus: (requestId: string, status: RequestStatus, volunteerName?: string) => void;
  deleteRequest: (requestId: string) => void;

  // Accessibility & Display Preferences
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  textSize: 'normal' | 'large' | 'extralarge';
  setTextSize: (size: 'normal' | 'large' | 'extralarge') => void;
  highContrast: boolean;
  toggleHighContrast: () => void;

  // Utilities
  resetToDemoData: () => void;
  getBuildingAudits: (buildingId: string) => AuditRecord[];
  getLatestAudit: (buildingId: string) => AuditRecord | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER_MODE: 'accessgap_usermode',
  BUILDINGS: 'accessgap_buildings_v2',
  AUDITS: 'accessgap_audits_v2',
  REQUESTS: 'accessgap_requests_v2',
  PROBLEM_REPORTS: 'accessgap_problem_reports_v2',
  SAVED_DRAFT: 'accessgap_saved_draft_v2',
  CONTRAST: 'accessgap_contrast',
  TEXT_SIZE: 'accessgap_text_size',
  LANGUAGE: 'accessgap_lang',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 0. User Mode (Citizen vs Auditor & Manager)
  const [userMode, setUserModeState] = useState<UserMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER_MODE);
      return saved === 'auditor' ? 'auditor' : 'citizen';
    } catch {
      return 'citizen';
    }
  });

  const setUserMode = (mode: UserMode) => {
    setUserModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_MODE, mode);
    } catch (e) {
      console.warn(e);
    }
  };

  // 1. Buildings state
  const [buildings, setBuildings] = useState<Building[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BUILDINGS);
      return saved ? JSON.parse(saved) : INITIAL_BUILDINGS;
    } catch {
      return INITIAL_BUILDINGS;
    }
  });

  // 2. Audits state
  const [audits, setAudits] = useState<AuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDITS);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_RECORDS;
    } catch {
      return INITIAL_AUDIT_RECORDS;
    }
  });

  // 3. Assistance requests state
  const [requests, setRequests] = useState<AssistanceRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
      return saved ? JSON.parse(saved) : INITIAL_ASSISTANCE_REQUESTS;
    } catch {
      return INITIAL_ASSISTANCE_REQUESTS;
    }
  });

  // 4. Citizen Problem Reports state
  const [problemReports, setProblemReports] = useState<CitizenProblemReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROBLEM_REPORTS);
      return saved ? JSON.parse(saved) : INITIAL_PROBLEM_REPORTS;
    } catch {
      return INITIAL_PROBLEM_REPORTS;
    }
  });

  // Navigation & Selection - Default to 'home' view for first-time clarity
  const [activeView, setActiveView] = useState<AppView>('home');
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>('bldg-courthouse');

  // Modals & Contextual Overlays
  const [buildingProfileModalId, setBuildingProfileModalId] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [showReportProblemModal, setShowReportProblemModalState] = useState<boolean>(false);

  const setShowReportProblemModal = (show: boolean, targetBuildingId?: string) => {
    setShowReportProblemModalState(show);
    if (targetBuildingId) {
      setSelectedBuildingId(targetBuildingId);
    }
  };

  // Active Audit & Draft State
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [auditDraft, setAuditDraft] = useState<ActiveAuditDraft | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(STORAGE_KEYS.SAVED_DRAFT);
    } catch {
      return false;
    }
  });

  // Language state
  const [language, setLanguageState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return saved === 'hi' ? 'hi' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (e) {
      console.warn(e);
    }
  };

  // Accessibility state
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CONTRAST) === 'true';
    } catch {
      return false;
    }
  });

  const [textSize, setTextSizeState] = useState<'normal' | 'large' | 'extralarge'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEXT_SIZE);
      if (saved === 'large' || saved === 'extralarge') return saved;
      return 'normal';
    } catch {
      return 'normal';
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BUILDINGS, JSON.stringify(buildings));
    } catch (e) {
      console.warn('Failed to save buildings to localStorage', e);
    }
  }, [buildings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDITS, JSON.stringify(audits));
    } catch (e) {
      console.warn('Failed to save audits to localStorage', e);
    }
  }, [audits]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
    } catch (e) {
      console.warn('Failed to save requests to localStorage', e);
    }
  }, [requests]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROBLEM_REPORTS, JSON.stringify(problemReports));
    } catch (e) {
      console.warn('Failed to save problemReports to localStorage', e);
    }
  }, [problemReports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRAST, String(highContrast));
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    } catch (e) {
      console.warn(e);
    }
  }, [highContrast]);

  const setTextSize = (size: 'normal' | 'large' | 'extralarge') => {
    setTextSizeState(size);
    try {
      localStorage.setItem(STORAGE_KEYS.TEXT_SIZE, size);
    } catch (e) {
      console.warn(e);
    }
  };

  const toggleHighContrast = () => {
    setHighContrast((prev) => !prev);
  };

  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId);

  const getBuildingAudits = (buildingId: string) => {
    return audits
      .filter((a) => a.buildingId === buildingId)
      .sort((a, b) => b.version - a.version);
  };

  const getLatestAudit = (buildingId: string) => {
    const list = getBuildingAudits(buildingId);
    return list[0];
  };

  // Register New Building
  const registerBuilding = (data: {
    name: string;
    category: Building['category'];
    address: string;
    city: string;
    district: string;
    department?: string;
    phone?: string;
    hours?: string;
    description?: string;
    imageUrl?: string;
  }): string => {
    const newId = `bldg-${Date.now()}`;
    const newBuilding: Building = {
      id: newId,
      name: data.name.trim(),
      category: data.category,
      address: data.address.trim(),
      city: data.city.trim() || 'Central Metro',
      district: data.district.trim(),
      department: data.department?.trim() || undefined,
      coordinates: {
        x: 40 + Math.floor(Math.random() * 30),
        y: 35 + Math.floor(Math.random() * 35),
        lat: 43.65 + (Math.random() - 0.5) * 0.05,
        lng: -79.38 + (Math.random() - 0.5) * 0.05,
      },
      phone: data.phone?.trim() || '(555) 000-0000',
      hours: data.hours?.trim() || 'Mon-Fri: 9:00 AM – 5:00 PM',
      description:
        data.description?.trim() ||
        'Newly registered civic building awaiting detailed accessibility verification.',
      imageUrl: data.imageUrl || '/src/assets/images/building_civic_centre_1792601609884.jpg',
      currentScore: null,
      statusTier: 'Score unavailable',
      verificationStatus: 'unknown',
      completionPercentage: 0,
      facilities: [],
      lastAuditedDate: 'Not yet audited',
      auditCount: 0,
      openIssuesCount: 0,
      unverifiedFixesCount: 0,
      resolvedIssuesCount: 0,
      urgentImprovementsNeeded: false,
      isUserRegistered: true,
    };

    setBuildings((prev) => [newBuilding, ...prev]);
    setSelectedBuildingId(newId);
    return newId;
  };

  // Start an audit session (initial or re-audit)
  const startAudit = (buildingId: string, isReaudit = false) => {
    const bldg = buildings.find((b) => b.id === buildingId);
    if (!bldg) return;

    setSelectedBuildingId(buildingId);

    const latest = getLatestAudit(buildingId);
    const initialResponses: Record<string, ItemAuditResponse> = {};

    AUDIT_QUESTIONS.forEach((q) => {
      if (latest && latest.checklistResponses[q.id]) {
        const prior = latest.checklistResponses[q.id];
        initialResponses[q.id] = {
          ...prior,
          actionStatus:
            prior.actionStatus ||
            (prior.status === 'no' || prior.status === 'partially' ? 'reported' : undefined),
          notes: isReaudit && prior.notes ? `[Prior inspection]: ${prior.notes}` : prior.notes,
        };
      } else {
        // Default unanswered
        initialResponses[q.id] = {
          status: 'not_inspected',
        };
      }
    });

    const newDraft: ActiveAuditDraft = {
      buildingId,
      auditorName: '',
      auditorRole: 'Certified Auditor',
      auditDate: new Date().toISOString().split('T')[0],
      currentSectionIndex: 0,
      responses: initialResponses,
      summary: isReaudit
        ? `Re-audit following corrective accessibility remediation on ${bldg.name}.`
        : `Comprehensive accessibility assessment for ${bldg.name}.`,
      isReaudit,
      baseAuditId: latest?.id,
      lastSavedAt: new Date().toISOString(),
    };

    setAuditDraft(newDraft);
    setIsAuditing(true);
    setActiveView('audit');
  };

  // Save current audit draft to LocalStorage
  const saveDraft = () => {
    if (!auditDraft) return;
    try {
      const updatedDraft = {
        ...auditDraft,
        lastSavedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.SAVED_DRAFT, JSON.stringify(updatedDraft));
      setHasSavedDraft(true);
      setAuditDraft(updatedDraft);
    } catch (e) {
      console.warn('Failed to save audit draft', e);
    }
  };

  // Resume saved draft from LocalStorage
  const resumeDraft = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SAVED_DRAFT);
      if (saved) {
        const parsed: ActiveAuditDraft = JSON.parse(saved);
        setAuditDraft(parsed);
        setSelectedBuildingId(parsed.buildingId);
        setIsAuditing(true);
        setActiveView('audit');
      }
    } catch (e) {
      console.warn('Failed to resume draft', e);
    }
  };

  const cancelAudit = () => {
    setIsAuditing(false);
    setAuditDraft(null);
  };

  const updateDraftResponse = (questionId: string, patch: Partial<ItemAuditResponse>) => {
    setAuditDraft((prev) => {
      if (!prev) return null;
      const current = prev.responses[questionId] || { status: 'not_inspected' };
      const updated = {
        ...prev,
        responses: {
          ...prev.responses,
          [questionId]: { ...current, ...patch },
        },
      };
      // Auto-save draft in background
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_DRAFT, JSON.stringify(updated));
        setHasSavedDraft(true);
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const updateDraftMeta = (
    field: 'auditorName' | 'auditorRole' | 'summary' | 'auditDate',
    value: string
  ) => {
    setAuditDraft((prev) => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      try {
        localStorage.setItem(STORAGE_KEYS.SAVED_DRAFT, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const updateDraftSectionIndex = (index: number) => {
    setAuditDraft((prev) => {
      if (!prev) return null;
      return { ...prev, currentSectionIndex: index };
    });
  };

  // Submit and finalize audit
  const submitAudit = (): AuditRecord => {
    if (!auditDraft) throw new Error('No active audit session');

    const bldg = buildings.find((b) => b.id === auditDraft.buildingId);
    if (!bldg) throw new Error('Building not found');

    const previousAudit = getLatestAudit(auditDraft.buildingId);
    const previousScore = previousAudit ? previousAudit.overallScore : null;
    const nextVersion = previousAudit ? previousAudit.version + 1 : 1;

    const scoreResult = calculateAccessibilityScore(auditDraft.responses);

    const newAuditRecord: AuditRecord = {
      id: `audit-${Date.now()}`,
      buildingId: auditDraft.buildingId,
      auditorName: auditDraft.auditorName.trim() || 'Community Access Auditor',
      auditorRole: auditDraft.auditorRole,
      auditDate: auditDraft.auditDate || new Date().toISOString().split('T')[0],
      overallScore: scoreResult.overallScore,
      completionPercentage: scoreResult.completionPercentage,
      totalAnswered: scoreResult.totalAnswered,
      totalUnanswered: scoreResult.totalUnanswered,
      totalBarriers: scoreResult.totalBarriers,
      criticalBarriersCount: scoreResult.criticalBarriersCount,
      previousScore,
      previousAuditId: previousAudit?.id,
      sectionScores: scoreResult.sectionScores,
      checklistResponses: auditDraft.responses,
      summary: auditDraft.summary,
      version: nextVersion,
    };

    // Determine open issues vs unverified fixes vs resolved issues
    let openIssues = 0;
    let unverifiedFixes = 0;
    let resolvedIssues = 0;
    let urgentNeeded = false;

    Object.values(auditDraft.responses).forEach((resp) => {
      if (resp.status === 'no' || resp.status === 'partially') {
        if (resp.actionStatus === 'verified_resolved') {
          resolvedIssues++;
        } else if (resp.actionStatus === 'awaiting_verification') {
          unverifiedFixes++;
          openIssues++;
        } else {
          openIssues++;
          if (resp.priority === 'high') {
            urgentNeeded = true;
          }
        }
      }
    });

    if (scoreResult.overallScore !== null && scoreResult.overallScore < 60) {
      urgentNeeded = true;
    }

    // Determine verified facilities
    const facilitiesList: string[] = [];
    if (auditDraft.responses['q_entrance_ramp']?.status === 'yes') facilitiesList.push('Wheelchair Ramp');
    if (auditDraft.responses['q_entrance_stepfree']?.status === 'yes') facilitiesList.push('Step-Free Entrance');
    if (auditDraft.responses['q_internal_lift']?.status === 'yes') facilitiesList.push('Accessible Elevator');
    if (auditDraft.responses['q_facility_toilet_available']?.status === 'yes') facilitiesList.push('Accessible Restroom');
    if (auditDraft.responses['q_signage_accessible_formats']?.status === 'yes') facilitiesList.push('Braille Signage');
    if (auditDraft.responses['q_signage_assistance']?.status === 'yes') facilitiesList.push('Enquiry Assistance');

    // Update Building record
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== auditDraft.buildingId) return b;
        return {
          ...b,
          currentScore: scoreResult.overallScore,
          statusTier: scoreResult.statusTier,
          verificationStatus: 'verified_audit',
          completionPercentage: scoreResult.completionPercentage,
          facilities: facilitiesList.length > 0 ? facilitiesList : b.facilities,
          lastAuditedDate: newAuditRecord.auditDate,
          auditCount: b.auditCount + 1,
          openIssuesCount: openIssues,
          unverifiedFixesCount: unverifiedFixes,
          resolvedIssuesCount: resolvedIssues,
          urgentImprovementsNeeded: urgentNeeded,
        };
      })
    );

    // Save audit record
    setAudits((prev) => [newAuditRecord, ...prev]);

    // Clear saved draft
    try {
      localStorage.removeItem(STORAGE_KEYS.SAVED_DRAFT);
      setHasSavedDraft(false);
    } catch (e) {
      console.warn(e);
    }

    // End audit session
    setIsAuditing(false);
    setAuditDraft(null);

    return newAuditRecord;
  };

  // Update corrective action status on the latest audit with full accountability workflow
  const updateIssueActionStatus = (
    buildingId: string,
    questionId: string,
    actionStatus: CorrectiveActionStatus,
    assignedTo?: string,
    actionNotes?: string,
    verificationResult?: 'passed' | 'failed' | 'pending',
    verificationNotes?: string,
    verifiedBy?: string,
    flaggedForReinspection?: boolean
  ) => {
    const latest = getLatestAudit(buildingId);
    if (!latest) return;

    const existingResponse = latest.checklistResponses[questionId];
    if (!existingResponse) return;

    // Physical verification transition:
    // If physical verification was rejected, push back to 'in_progress'
    let finalStatus: CorrectiveActionStatus = actionStatus;
    if (verificationResult === 'failed') {
      finalStatus = 'in_progress';
    } else if (verificationResult === 'passed') {
      finalStatus = 'verified_resolved';
    }

    const historyEntry: ActionHistoryEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: new Date().toISOString().split('T')[0],
      fromStatus: existingResponse.actionStatus || 'reported',
      toStatus: finalStatus,
      note:
        verificationNotes ||
        actionNotes ||
        (verificationResult === 'failed'
          ? 'Physical verification failed: Barrier still present or substandard. Returned to In Progress.'
          : verificationResult === 'passed'
          ? 'Physical verification passed: Remediation verified compliant with accessibility standards.'
          : `Accountability status updated to ${finalStatus}`),
      actor:
        verifiedBy ||
        (userMode === 'auditor' ? 'Municipal Facility Auditor' : 'Public Auditor'),
    };

    const updatedItemResponse: ItemAuditResponse = {
      ...existingResponse,
      actionStatus: finalStatus,
      assignedTo: assignedTo !== undefined ? assignedTo : existingResponse.assignedTo,
      actionDate: new Date().toISOString().split('T')[0],
      actionNotes: actionNotes !== undefined ? actionNotes : existingResponse.actionNotes,
      verificationResult:
        verificationResult !== undefined
          ? verificationResult
          : existingResponse.verificationResult,
      verificationNotes:
        verificationNotes !== undefined
          ? verificationNotes
          : existingResponse.verificationNotes,
      verifiedBy:
        verifiedBy !== undefined ? verifiedBy : existingResponse.verifiedBy,
      flaggedForReinspection:
        flaggedForReinspection !== undefined
          ? flaggedForReinspection
          : existingResponse.flaggedForReinspection,
      actionHistory: [...(existingResponse.actionHistory || []), historyEntry],
    };

    const updatedResponses = {
      ...latest.checklistResponses,
      [questionId]: updatedItemResponse,
    };

    const updatedAudit: AuditRecord = {
      ...latest,
      checklistResponses: updatedResponses,
    };

    // Update in audit list
    setAudits((prev) => prev.map((a) => (a.id === latest.id ? updatedAudit : a)));

    // Recalculate building open issues, unverified fixes & resolved counts
    let openCount = 0;
    let unverifiedCount = 0;
    let resolvedCount = 0;
    let urgent = false;

    Object.values(updatedResponses).forEach((resp) => {
      if (resp.status === 'no' || resp.status === 'partially') {
        if (resp.actionStatus === 'verified_resolved') {
          resolvedCount++;
        } else if (resp.actionStatus === 'awaiting_verification') {
          unverifiedCount++;
          openCount++;
        } else {
          openCount++;
          if (resp.priority === 'high') urgent = true;
        }
      }
    });

    if (latest.overallScore !== null && latest.overallScore < 60) {
      urgent = true;
    }

    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== buildingId) return b;
        return {
          ...b,
          openIssuesCount: openCount,
          unverifiedFixesCount: unverifiedCount,
          resolvedIssuesCount: resolvedCount,
          urgentImprovementsNeeded: urgent,
        };
      })
    );
  };

  // Citizen Report Barrier (Available in Citizen Mode)
  const citizenReportBarrier = (
    buildingId: string,
    questionId: string,
    notes: string,
    photoUrl?: string,
    location?: string
  ) => {
    const latest = getLatestAudit(buildingId);
    if (!latest) return;

    const existingResponse = latest.checklistResponses[questionId] || {
      status: 'no',
    };

    const historyEntry: ActionHistoryEntry = {
      id: `act-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      fromStatus: existingResponse.actionStatus || 'reported',
      toStatus: 'reported',
      note: `Citizen barrier report: ${notes}`,
      actor: 'Public Citizen Report',
    };

    const updatedItemResponse: ItemAuditResponse = {
      ...existingResponse,
      status: 'no',
      priority: existingResponse.priority || 'high',
      notes: notes
        ? `${existingResponse.notes ? existingResponse.notes + ' | ' : ''}[Citizen Report]: ${notes}`
        : existingResponse.notes,
      photoUrl: photoUrl || existingResponse.photoUrl,
      location: location || existingResponse.location,
      actionStatus: 'reported',
      actionDate: new Date().toISOString().split('T')[0],
      actionHistory: [...(existingResponse.actionHistory || []), historyEntry],
    };

    const updatedResponses = {
      ...latest.checklistResponses,
      [questionId]: updatedItemResponse,
    };

    const updatedAudit: AuditRecord = {
      ...latest,
      checklistResponses: updatedResponses,
    };

    setAudits((prev) => prev.map((a) => (a.id === latest.id ? updatedAudit : a)));

    let openCount = 0;
    let unverifiedCount = 0;
    let resolvedCount = 0;
    let urgent = false;

    Object.values(updatedResponses).forEach((resp) => {
      if (resp.status === 'no' || resp.status === 'partially') {
        if (resp.actionStatus === 'verified_resolved') {
          resolvedCount++;
        } else if (resp.actionStatus === 'awaiting_verification') {
          unverifiedCount++;
          openCount++;
        } else {
          openCount++;
          if (resp.priority === 'high') urgent = true;
        }
      }
    });

    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== buildingId) return b;
        return {
          ...b,
          openIssuesCount: openCount,
          unverifiedFixesCount: unverifiedCount,
          resolvedIssuesCount: resolvedCount,
          urgentImprovementsNeeded: urgent || b.urgentImprovementsNeeded,
        };
      })
    );
  };

  // Submit Assistance Request
  const submitAssistanceRequest = (
    data: Omit<AssistanceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ) => {
    const id = `req-${Date.now()}`;
    const newRequest: AssistanceRequest = {
      ...data,
      id,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRequests((prev) => [newRequest, ...prev]);
    return id;
  };

  const updateRequestStatus = (
    requestId: string,
    status: RequestStatus,
    volunteerName?: string
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        return {
          ...r,
          status,
          assignedVolunteer: volunteerName || r.assignedVolunteer,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteRequest = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId));
  };

  const submitProblemReport = (data: {
    buildingId: string;
    problemType: ProblemCategory;
    description: string;
    location?: string;
    photoUrl?: string;
    linkedQuestionId?: string;
  }): CitizenProblemReport => {
    const targetBuilding = buildings.find((b) => b.id === data.buildingId);
    const newReport: CitizenProblemReport = {
      id: `rep-${Date.now()}`,
      buildingId: data.buildingId,
      buildingName: targetBuilding ? targetBuilding.name : 'Public Facility',
      problemType: data.problemType,
      description: data.description,
      location: data.location || 'Reported area',
      photoUrl: data.photoUrl,
      status: 'User-reported',
      createdAt: new Date().toISOString().split('T')[0],
      linkedQuestionId: data.linkedQuestionId,
    };

    setProblemReports((prev) => [newReport, ...prev]);

    // Update target building status to user_reported and increment openIssuesCount
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== data.buildingId) return b;
        return {
          ...b,
          verificationStatus: 'user_reported',
          openIssuesCount: b.openIssuesCount + 1,
        };
      })
    );

    // Map category to question ID if needed
    const categoryToQuestionMap: Record<ProblemCategory, string> = {
      'Inaccessible entrance': 'q_entrance_stepfree',
      'Blocked ramp': 'q_entrance_ramp',
      'Broken lift': 'q_internal_lift',
      'Obstructed pathway': 'q_internal_pathways',
      'Inaccessible toilet': 'q_facility_toilet_available',
      'Missing signage': 'q_signage_easy',
      'Other accessibility problems': 'q_safety_hazards',
    };
    const targetQId =
      data.linkedQuestionId || categoryToQuestionMap[data.problemType] || 'q_entrance_stepfree';

    citizenReportBarrier(
      data.buildingId,
      targetQId,
      `[${data.problemType}]: ${data.description}`,
      data.photoUrl,
      data.location
    );

    return newReport;
  };

  const updateProblemReportStatus = (
    reportId: string,
    status: CitizenProblemReport['status'],
    assignedTo?: string
  ) => {
    setProblemReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;
        return {
          ...r,
          status,
          assignedTo: assignedTo !== undefined ? assignedTo : r.assignedTo,
        };
      })
    );
  };

  const resetToDemoData = () => {
    setBuildings(INITIAL_BUILDINGS);
    setAudits(INITIAL_AUDIT_RECORDS);
    setRequests(INITIAL_ASSISTANCE_REQUESTS);
    setProblemReports(INITIAL_PROBLEM_REPORTS);
    setSelectedBuildingId(INITIAL_BUILDINGS[0].id);
    setIsAuditing(false);
    setAuditDraft(null);
    setHasSavedDraft(false);
    localStorage.removeItem(STORAGE_KEYS.BUILDINGS);
    localStorage.removeItem(STORAGE_KEYS.AUDITS);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.PROBLEM_REPORTS);
    localStorage.removeItem(STORAGE_KEYS.SAVED_DRAFT);
  };

  return (
    <AppContext.Provider
      value={{
        userMode,
        setUserMode,
        buildings,
        audits,
        requests,
        problemReports,
        activeView,
        setActiveView,
        selectedBuildingId,
        setSelectedBuildingId,
        selectedBuilding,
        buildingProfileModalId,
        setBuildingProfileModalId,
        showHelpModal,
        setShowHelpModal,
        showReportProblemModal,
        setShowReportProblemModal,
        submitProblemReport,
        updateProblemReportStatus,
        registerBuilding,
        isAuditing,
        auditDraft,
        hasSavedDraft,
        startAudit,
        saveDraft,
        resumeDraft,
        cancelAudit,
        updateDraftResponse,
        updateDraftMeta,
        updateDraftSectionIndex,
        submitAudit,
        updateIssueActionStatus,
        citizenReportBarrier,
        submitAssistanceRequest,
        updateRequestStatus,
        deleteRequest,
        language,
        setLanguage,
        textSize,
        setTextSize,
        highContrast,
        toggleHighContrast,
        resetToDemoData,
        getBuildingAudits,
        getLatestAudit,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
