/**
 * AccessGap Type Definitions
 * Data models for civic accessibility audits, public service mapping, and citizen assistance.
 */

export type UserMode = 'citizen' | 'auditor';

export type AccessibilityTier =
  | 'Higher recorded accessibility score'
  | 'Improvements recommended'
  | 'Significant barriers identified'
  | 'Score unavailable';

export type VerificationStatus =
  | 'verified'
  | 'user_reported'
  | 'unknown'
  | 'needs_reinspection'
  | 'verified_audit'
  | 'citizen_reported'
  | 'outdated'
  | 'demonstration_record';

export type ProblemCategory =
  | 'Inaccessible entrance'
  | 'Blocked ramp'
  | 'Broken lift'
  | 'Obstructed pathway'
  | 'Inaccessible toilet'
  | 'Missing signage'
  | 'Other accessibility problems';

export interface CitizenProblemReport {
  id: string;
  buildingId: string;
  buildingName: string;
  problemType: ProblemCategory;
  description: string;
  location?: string;
  photoUrl?: string;
  status: 'User-reported' | 'Assigned' | 'Work Started' | 'Waiting for Verification' | 'Verified Resolved';
  assignedTo?: string;
  createdAt: string;
  linkedQuestionId?: string;
}

export type BuildingCategory =
  | 'Government offices'
  | 'Hospitals and healthcare centres'
  | 'Educational institutions'
  | 'Public transport facilities'
  | 'Banks and public service centres'
  | 'Other public buildings';

export type AuditSectionId =
  | 'entrance_approach'
  | 'internal_movement'
  | 'toilets_facilities'
  | 'signage_communication'
  | 'safety_usability';

export type QuestionResponseValue =
  | 'yes'
  | 'partially'
  | 'no'
  | 'not_applicable'
  | 'not_inspected';

export type PriorityLevel = 'high' | 'medium' | 'low';

export type CorrectiveActionStatus =
  | 'reported'
  | 'assigned'
  | 'in_progress'
  | 'awaiting_verification'
  | 'verified_resolved';

export interface ActionHistoryEntry {
  id: string;
  date: string;
  fromStatus: CorrectiveActionStatus;
  toStatus: CorrectiveActionStatus;
  note: string;
  actor: string;
}

export interface AuditQuestion {
  id: string;
  sectionId: AuditSectionId;
  question: string;
  description: string;
  whyItMatters: string;
  guidelineReference: string;
  defaultPriority: PriorityLevel;
  weight: number;
  isCritical?: boolean;
}

export interface ItemAuditResponse {
  status: QuestionResponseValue;
  priority?: PriorityLevel;
  location?: string;
  measurement?: string;
  notes?: string;
  photoUrl?: string;
  recommendedFix?: string;
  actionStatus?: CorrectiveActionStatus;
  assignedTo?: string; // Responsible person, department, or contractor
  actionNotes?: string;
  actionDate?: string;
  verificationResult?: 'passed' | 'failed' | 'pending';
  verificationNotes?: string;
  verifiedBy?: string;
  flaggedForReinspection?: boolean;
  actionHistory?: ActionHistoryEntry[];
}

export interface AuditRecord {
  id: string;
  buildingId: string;
  auditorName: string;
  auditorRole: 'Certified Auditor' | 'Community Advocate' | 'Citizen Volunteer' | 'Facility Staff';
  auditDate: string;
  overallScore: number | null;
  completionPercentage: number;
  totalAnswered: number;
  totalUnanswered: number;
  totalBarriers: number;
  criticalBarriersCount: number;
  previousScore?: number | null;
  previousAuditId?: string;
  sectionScores: Record<AuditSectionId, { earned: number; possible: number; percent: number }>;
  checklistResponses: Record<string, ItemAuditResponse>;
  summary: string;
  version: number;
}

export interface Building {
  id: string;
  name: string;
  category: BuildingCategory;
  address: string;
  city: string;
  district: string;
  department?: string;
  coordinates: {
    x: number;
    y: number;
    lat: number;
    lng: number;
  };
  phone: string;
  hours: string;
  description: string;
  imageUrl: string;
  currentScore: number | null;
  statusTier: AccessibilityTier;
  verificationStatus: VerificationStatus;
  completionPercentage: number;
  facilities: string[];
  lastAuditedDate: string;
  auditCount: number;
  openIssuesCount: number;
  unverifiedFixesCount: number; // Awaiting verification
  resolvedIssuesCount: number; // Verified resolved
  urgentImprovementsNeeded: boolean;
  isUserRegistered?: boolean;
}

export type AssistanceType =
  | 'Wheelchair Navigation'
  | 'Visual Guide / Escort'
  | 'Sign Language & Communication'
  | 'Heavy Door / Mobility Assistance'
  | 'Form Filling & Counter Escort'
  | 'Sensory Friendly Visit Accompaniment';

export type ContactPreference = 'Phone call' | 'SMS' | 'WhatsApp' | 'Email';
export type RequestStatus = 'Pending' | 'Accepted' | 'Completed' | 'Cancelled';

export interface AssistanceRequest {
  id: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  contactPreference: ContactPreference;
  buildingId: string;
  buildingName: string;
  buildingAddress: string;
  assistanceType: AssistanceType;
  requestedDate: string;
  requestedTime: string;
  specialRequirements: string;
  status: RequestStatus;
  assignedVolunteer?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppView = 'home' | 'audit' | 'map' | 'assist' | 'report_problem';

export type AppLanguage = 'en' | 'hi' | 'mr';

export interface ActiveAuditDraft {
  buildingId: string;
  auditorName: string;
  auditorRole: 'Certified Auditor' | 'Community Advocate' | 'Citizen Volunteer' | 'Facility Staff';
  auditDate: string;
  currentSectionIndex: number;
  responses: Record<string, ItemAuditResponse>;
  summary: string;
  isReaudit: boolean;
  baseAuditId?: string;
  lastSavedAt: string;
}
