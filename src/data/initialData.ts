import { Building, AuditRecord, AssistanceRequest, ItemAuditResponse, CitizenProblemReport } from '../types';
import { AUDIT_QUESTIONS } from '../utils/auditQuestions';
import { calculateAccessibilityScore } from '../utils/scoring';

export const IMAGES = {
  civicCentre: '/src/assets/images/building_civic_centre_1792601609884.jpg',
  courthouse: '/src/assets/images/building_central_courthouse_1792601610530.jpg',
  rampSteep: '/src/assets/images/audit_ramp_steep_1792601609376.jpg',
  accessibleDoor: '/src/assets/images/audit_accessible_door_1792601609583.jpg',
};

// Seed baseline buildings
export const INITIAL_BUILDINGS: Building[] = [
  {
    id: 'bldg-courthouse',
    name: 'District Sessions Court & Revenue Registry',
    category: 'Government offices',
    address: '100 Civic Square, Court Road',
    city: 'Central Metro',
    district: 'Judicial District',
    department: 'Department of Law & Public Justice',
    coordinates: { x: 48, y: 36, lat: 43.6532, lng: -79.3832 },
    phone: '(555) 234-8901',
    hours: 'Mon-Fri: 9:00 AM – 5:00 PM',
    description:
      'Historic judicial building housing magistrates courts, deed registry, and public notary chambers. Recently retrofitted with exterior switchback ramp and automatic sensor sliding doors.',
    imageUrl: IMAGES.courthouse,
    currentScore: 88,
    statusTier: 'Higher recorded accessibility score',
    verificationStatus: 'verified_audit',
    completionPercentage: 100,
    facilities: [
      'Wheelchair Ramp',
      'Step-Free Entrance',
      'Tactile Paving',
      'Accessible Restroom',
      'Braille Signage',
    ],
    lastAuditedDate: '2026-10-12',
    auditCount: 2,
    openIssuesCount: 2,
    unverifiedFixesCount: 1,
    resolvedIssuesCount: 4,
    urgentImprovementsNeeded: false,
  },
  {
    id: 'bldg-civic-centre',
    name: 'Metropolitan Citizen Service Kendra',
    category: 'Banks and public service centres',
    address: '425 Government Way, Block B',
    city: 'Central Metro',
    district: 'Downtown North',
    department: 'Municipal Services & Citizen Welfare',
    coordinates: { x: 32, y: 52, lat: 43.6591, lng: -79.3905 },
    phone: '(555) 312-7000',
    hours: 'Mon-Sat: 8:30 AM – 6:00 PM',
    description:
      'High-traffic public counter for Aadhaar/Identity cards, municipal taxes, disability pension certifications, and social welfare subsidies.',
    imageUrl: IMAGES.civicCentre,
    currentScore: 94,
    statusTier: 'Higher recorded accessibility score',
    verificationStatus: 'verified_audit',
    completionPercentage: 100,
    facilities: [
      'Wheelchair Ramp',
      'Step-Free Entrance',
      'Accessible Elevator',
      'Tactile Paving',
      'Braille Signage',
      'Accessible Restroom',
    ],
    lastAuditedDate: '2026-10-05',
    auditCount: 1,
    openIssuesCount: 1,
    unverifiedFixesCount: 0,
    resolvedIssuesCount: 2,
    urgentImprovementsNeeded: false,
  },
  {
    id: 'bldg-health-clinic',
    name: 'Eastside Community Health Centre & Polyclinic',
    category: 'Hospitals and healthcare centres',
    address: '78 Pinecrest Avenue, Ward 12',
    city: 'Central Metro',
    district: 'Eastside Ward',
    department: 'Department of Health & Family Welfare',
    coordinates: { x: 74, y: 44, lat: 43.6625, lng: -79.3512 },
    phone: '(555) 456-1122',
    hours: 'Mon-Sat: 8:00 AM – 8:00 PM (Emergency 24/7)',
    description:
      'Sub-divisional public polyclinic providing maternal care, child immunizations, outpatient consultations, and physiotherapy services.',
    imageUrl: IMAGES.rampSteep,
    currentScore: 41,
    statusTier: 'Significant barriers identified',
    verificationStatus: 'verified_audit',
    completionPercentage: 100,
    facilities: ['Designated Parking'],
    lastAuditedDate: '2026-09-18',
    auditCount: 1,
    openIssuesCount: 6,
    unverifiedFixesCount: 0,
    resolvedIssuesCount: 0,
    urgentImprovementsNeeded: true,
  },
  {
    id: 'bldg-transit-hub',
    name: 'Interstate Bus Terminal & Metro Interchange',
    category: 'Public transport facilities',
    address: '15 Station Plaza, Link Road',
    city: 'Central Metro',
    district: 'Waterfront Transit District',
    department: 'State Transport Corporation',
    coordinates: { x: 22, y: 78, lat: 43.6455, lng: -79.3806 },
    phone: '(555) 778-9900',
    hours: 'Open 24 Hours Daily',
    description:
      'Regional multimodal transport terminal connecting suburban buses, metro lines, and accessible paratransit auto-rickshaws.',
    imageUrl: IMAGES.civicCentre,
    currentScore: 71,
    statusTier: 'Improvements recommended',
    verificationStatus: 'verified_audit',
    completionPercentage: 100,
    facilities: [
      'Wheelchair Ramp',
      'Step-Free Entrance',
      'Accessible Elevator',
      'Tactile Paving',
    ],
    lastAuditedDate: '2026-09-29',
    auditCount: 1,
    openIssuesCount: 3,
    unverifiedFixesCount: 0,
    resolvedIssuesCount: 2,
    urgentImprovementsNeeded: false,
  },
  {
    id: 'bldg-public-college',
    name: 'Government Model Polytechnic & Skill College',
    category: 'Educational institutions',
    address: '530 Oakridge Road, Vidya Vihar',
    city: 'Central Metro',
    district: 'West Hills',
    department: 'Higher & Technical Education Directorate',
    coordinates: { x: 18, y: 22, lat: 43.6688, lng: -79.4124 },
    phone: '(555) 621-4455',
    hours: 'Mon-Fri: 8:00 AM – 5:00 PM',
    description:
      'State-run technical diploma college with library, examination halls, computer testing labs, and vocational training workshops.',
    imageUrl: IMAGES.accessibleDoor,
    currentScore: 65,
    statusTier: 'Improvements recommended',
    verificationStatus: 'outdated',
    completionPercentage: 94,
    facilities: ['Wheelchair Ramp', 'Accessible Restroom'],
    lastAuditedDate: '2026-03-10',
    auditCount: 1,
    openIssuesCount: 4,
    unverifiedFixesCount: 1,
    resolvedIssuesCount: 1,
    urgentImprovementsNeeded: true,
  },
];

// Helper to build courthouse responses for V1 (before retrofit) and V2 (after retrofit)
function buildCourthouseResponses(isReaudit: boolean): Record<string, ItemAuditResponse> {
  const resp: Record<string, ItemAuditResponse> = {};

  // Standard compliant defaults
  for (const q of AUDIT_QUESTIONS) {
    resp[q.id] = {
      status: 'yes',
      notes: 'Inspected and verified compliant.',
    };
  }

  if (!isReaudit) {
    // V1 Audit: Before renovation (Score was ~47%)
    resp['q_entrance_stepfree'] = {
      status: 'no',
      priority: 'high',
      location: 'Main East Colonnade Entrance',
      measurement: '12 stone steps with no bypass; 180mm rise per riser',
      notes: 'No ground-level entrance exists. Wheelchair users cannot enter the court building without being carried.',
      photoUrl: IMAGES.rampSteep,
      recommendedFix: 'Construct switchback ramp with 1:14 slope and 1200mm clear width.',
      actionStatus: 'verified_resolved',
      actionDate: '2026-09-15',
      actionNotes: 'Approved in municipal public works capital scheme. Construction completed on west flank.',
      flaggedForReinspection: false,
    };
    resp['q_entrance_ramp'] = {
      status: 'no',
      priority: 'high',
      location: 'Exterior East Entry Steps',
      measurement: 'Zero ramp present at public front',
      notes: 'Visitors with mobility aids face barrier of steep exterior steps.',
      recommendedFix: 'Install exterior switchback ramp compliant with ADA §405 and ISO 21542.',
      actionStatus: 'verified_resolved',
      actionDate: '2026-09-15',
      actionNotes: 'New ramp commissioned.',
    };
    resp['q_entrance_width'] = {
      status: 'partially',
      priority: 'medium',
      location: 'Secondary Rear Registry Gate',
      measurement: 'Door width 760mm',
      notes: 'Secondary side door is 760mm, narrower than 850mm standard.',
      recommendedFix: 'Rehang frame with offset swing hinges to achieve 870mm clearance.',
      actionStatus: 'verified_resolved',
      actionDate: '2026-09-20',
    };
    resp['q_internal_wheelchair_flow'] = {
      status: 'partially',
      priority: 'high',
      location: 'Magistrate Courtroom 3 Split Level',
      measurement: '2 steps (320mm rise) to witness stand and filing clerk counter',
      notes: 'Witness stand and lawyer consultation desks raised on 2 steps with no mini-ramp.',
      recommendedFix: 'Install low-rise platform lift or modular aluminum threshold ramp.',
      actionStatus: 'in_progress',
      actionNotes: 'Modular ramp ordered from procurement.',
    };
    resp['q_facility_toilet_available'] = {
      status: 'no',
      priority: 'high',
      location: 'Ground Floor Restroom Block',
      measurement: 'Narrow 650mm door; 3 interior steps',
      notes: 'Only gendered stepped toilets available. No accessible stall in building.',
      recommendedFix: 'Convert storage alcove on ground floor into dedicated accessible unisex toilet.',
      actionStatus: 'verified_resolved',
      actionDate: '2026-10-02',
      actionNotes: 'Dedicated accessible toilet room built and fitted with emergency pull alarm.',
    };
    resp['q_signage_accessible_formats'] = {
      status: 'no',
      priority: 'medium',
      location: 'Entire Facility',
      notes: 'No Braille signage or tactile directories installed anywhere.',
      recommendedFix: 'Mount Grade 2 Braille room number plaques at 1400mm height beside door latches.',
      actionStatus: 'assigned',
      actionNotes: 'Signage quote pending department approval.',
    };
    resp['q_safety_emergency_info'] = {
      status: 'partially',
      priority: 'high',
      location: 'Main Corridors',
      notes: 'Audio fire bell exists, but no flashing optical strobes for deaf visitors.',
      recommendedFix: 'Retrofit synchronised xenon strobe lights connected to central fire panel.',
      actionStatus: 'in_progress',
    };
  } else {
    // V2 Re-audit: After major capital upgrades (Score ~88%)
    resp['q_entrance_stepfree'] = {
      status: 'yes',
      location: 'New West Entrance Plaza',
      notes: 'Step-free level threshold verified with automatic sliding entrance doors.',
      photoUrl: IMAGES.courthouse,
      actionStatus: 'verified_resolved',
      actionDate: '2026-09-15',
    };
    resp['q_entrance_ramp'] = {
      status: 'yes',
      location: 'West Colonnade Switchback',
      notes: 'New ramp measured at 1:14 (7.1%) slope, surpassing 1:12 standard. Sturdy bilateral handrails fitted.',
      photoUrl: IMAGES.courthouse,
      actionStatus: 'verified_resolved',
      actionDate: '2026-09-15',
    };
    resp['q_entrance_width'] = {
      status: 'yes',
      location: 'Main Automatic Sliding Doors',
      notes: 'Doorway opens to 1400mm clear width.',
      photoUrl: IMAGES.accessibleDoor,
      actionStatus: 'verified_resolved',
    };
    resp['q_facility_toilet_available'] = {
      status: 'yes',
      location: 'Ground Floor Public Lobby',
      notes: 'Newly built dedicated accessible toilet with 1600mm turning circle and drop-down grab bars.',
      actionStatus: 'verified_resolved',
      actionDate: '2026-10-02',
    };
    resp['q_internal_wheelchair_flow'] = {
      status: 'partially',
      priority: 'medium',
      location: 'Courtroom 3 Witness Stand',
      notes: 'Courtroom 1 & 2 fully step-free; Courtroom 3 modular ramp installation underway.',
      recommendedFix: 'Complete modular ramp installation by end of month.',
      actionStatus: 'in_progress',
    };
    resp['q_signage_accessible_formats'] = {
      status: 'partially',
      priority: 'medium',
      location: 'Ground Floor & Courtrooms',
      notes: 'Braille plaques installed on ground floor; 1st floor courtrooms awaiting installation.',
      recommendedFix: 'Complete tactile signs on level 1.',
      actionStatus: 'in_progress',
    };
  }

  return resp;
}

// Health clinic baseline responses (Score ~41% with critical barriers)
function buildClinicResponses(): Record<string, ItemAuditResponse> {
  const resp: Record<string, ItemAuditResponse> = {};

  for (const q of AUDIT_QUESTIONS) {
    resp[q.id] = {
      status: 'yes',
      notes: 'Basic check completed.',
    };
  }

  resp['q_entrance_stepfree'] = {
    status: 'no',
    priority: 'high',
    location: 'Main Clinic Entrance',
    measurement: '3 broken masonry steps (480mm total rise)',
    notes: 'Steep entrance steps with crumbling concrete. Wheelchair patients cannot enter unassisted.',
    photoUrl: IMAGES.rampSteep,
    recommendedFix: 'Demolish damaged steps and construct accessible masonry ramp with 1:12 gradient.',
    actionStatus: 'reported',
  };
  resp['q_entrance_ramp'] = {
    status: 'no',
    priority: 'high',
    location: 'Side Emergency Bay',
    measurement: 'Slope measured 1:7 (14.2% steep incline)',
    notes: 'Existing side ramp is dangerously steep with cracked flagstones and wobbling handrails.',
    photoUrl: IMAGES.rampSteep,
    recommendedFix: 'Rebuild ramp with extended switchback and bilateral 38mm stainless handrails.',
    actionStatus: 'reported',
  };
  resp['q_entrance_width'] = {
    status: 'partially',
    priority: 'medium',
    location: 'Doctor Consultation Rooms',
    measurement: 'Door width 740mm',
    notes: 'Narrow consultation doors make entry difficult for motorized wheelchairs.',
    recommendedFix: 'Widen door frames to standard 850mm opening.',
    actionStatus: 'reported',
  };
  resp['q_internal_wheelchair_flow'] = {
    status: 'no',
    priority: 'high',
    location: 'Pharmacy & Diagnostic Lab Corridor',
    notes: 'Stepped passage between OPD waiting area and pathology laboratory without ramp.',
    recommendedFix: 'Install permanent internal concrete ramp.',
    actionStatus: 'reported',
  };
  resp['q_facility_toilet_available'] = {
    status: 'no',
    priority: 'high',
    location: 'Patient Restroom Zone',
    notes: 'No accessible toilet cubicle. Only standard narrow stalls with raised steps.',
    recommendedFix: 'Create accessible toilet room complying with ADA §604.',
    actionStatus: 'reported',
  };
  resp['q_signage_accessible_formats'] = {
    status: 'no',
    priority: 'medium',
    location: 'OPD & Vaccine Counters',
    notes: 'No tactile or Braille indicators. No audio queue display for blind patients.',
    recommendedFix: 'Install tactile room signs and audio chime ticket calling system.',
    actionStatus: 'reported',
  };

  return resp;
}

// Compute scores for initial audit records
const courthouseV1Responses = buildCourthouseResponses(false);
const courthouseV1Score = calculateAccessibilityScore(courthouseV1Responses);

const courthouseV2Responses = buildCourthouseResponses(true);
const courthouseV2Score = calculateAccessibilityScore(courthouseV2Responses);

const clinicResponses = buildClinicResponses();
const clinicScore = calculateAccessibilityScore(clinicResponses);

export const INITIAL_AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'audit-courthouse-v1',
    buildingId: 'bldg-courthouse',
    auditorName: 'Elena Rostova',
    auditorRole: 'Certified Auditor',
    auditDate: '2026-05-12',
    overallScore: courthouseV1Score.overallScore, // 47
    completionPercentage: courthouseV1Score.completionPercentage,
    totalAnswered: courthouseV1Score.totalAnswered,
    totalUnanswered: courthouseV1Score.totalUnanswered,
    totalBarriers: courthouseV1Score.totalBarriers,
    criticalBarriersCount: courthouseV1Score.criticalBarriersCount,
    sectionScores: courthouseV1Score.sectionScores,
    checklistResponses: courthouseV1Responses,
    summary:
      'Baseline comprehensive audit revealed critical physical barriers: 12 stone steps at the primary entrance with no ramp, no accessible public toilet, and no tactile signage.',
    version: 1,
  },
  {
    id: 'audit-courthouse-v2',
    buildingId: 'bldg-courthouse',
    auditorName: 'Marcus Vance, PE',
    auditorRole: 'Certified Auditor',
    auditDate: '2026-10-12',
    overallScore: courthouseV2Score.overallScore, // 88
    completionPercentage: courthouseV2Score.completionPercentage,
    totalAnswered: courthouseV2Score.totalAnswered,
    totalUnanswered: courthouseV2Score.totalUnanswered,
    totalBarriers: courthouseV2Score.totalBarriers,
    criticalBarriersCount: courthouseV2Score.criticalBarriersCount,
    previousScore: courthouseV1Score.overallScore, // 47
    previousAuditId: 'audit-courthouse-v1',
    sectionScores: courthouseV2Score.sectionScores,
    checklistResponses: courthouseV2Responses,
    summary:
      'Follow-up re-audit conducted after municipal public works remediation. The newly commissioned switchback ramp, automatic sliding entrance, and dedicated accessible toilet successfully resolved all critical entry barriers, resulting in a 41-point improvement.',
    version: 2,
  },
  {
    id: 'audit-clinic-v1',
    buildingId: 'bldg-health-clinic',
    auditorName: 'Sarah Jenkins',
    auditorRole: 'Community Advocate',
    auditDate: '2026-09-18',
    overallScore: clinicScore.overallScore, // 41
    completionPercentage: clinicScore.completionPercentage,
    totalAnswered: clinicScore.totalAnswered,
    totalUnanswered: clinicScore.totalUnanswered,
    totalBarriers: clinicScore.totalBarriers,
    criticalBarriersCount: clinicScore.criticalBarriersCount,
    sectionScores: clinicScore.sectionScores,
    checklistResponses: clinicResponses,
    summary:
      'Urgent audit of sub-divisional healthcare polyclinic identified severe physical hazards: excessively steep 1:7 exterior ramp, broken steps, zero accessible toilets, and stepped internal passages.',
    version: 1,
  },
];

// Seed Assistance Requests
export const INITIAL_ASSISTANCE_REQUESTS: AssistanceRequest[] = [
  {
    id: 'req-001',
    citizenName: 'Arthur Pendelton',
    citizenPhone: '(555) 612-9081',
    citizenEmail: 'arthur.p@example.org',
    contactPreference: 'Phone call',
    buildingId: 'bldg-courthouse',
    buildingName: 'District Sessions Court & Revenue Registry',
    buildingAddress: '100 Civic Square, Court Road',
    assistanceType: 'Wheelchair Navigation',
    requestedDate: '2026-10-25',
    requestedTime: '10:00 AM',
    specialRequirements:
      'Using manual wheelchair. Requesting assistance navigating through main security checkpoint and finding Courtroom 3B.',
    status: 'Pending',
    createdAt: '2026-10-21T14:30:00.000Z',
    updatedAt: '2026-10-21T14:30:00.000Z',
  },
  {
    id: 'req-002',
    citizenName: 'Priya Sharma',
    citizenPhone: '(555) 789-2341',
    citizenEmail: 'priya.sharma@example.org',
    contactPreference: 'SMS',
    buildingId: 'bldg-civic-centre',
    buildingName: 'Metropolitan Citizen Service Kendra',
    buildingAddress: '425 Government Way, Block B',
    assistanceType: 'Visual Guide / Escort',
    requestedDate: '2026-10-24',
    requestedTime: '02:00 PM',
    specialRequirements:
      'Low vision, traveling with white cane. Need a volunteer guide to meet at the main transit bus stop and guide to biometric Aadhaar verification counter.',
    status: 'Accepted',
    assignedVolunteer: 'David Kim (Civic Corps Volunteer)',
    createdAt: '2026-10-20T09:15:00.000Z',
    updatedAt: '2026-10-21T11:00:00.000Z',
  },
  {
    id: 'req-003',
    citizenName: 'Tariq Al-Mansoor',
    citizenPhone: '(555) 432-8819',
    citizenEmail: 'tariq.m@example.org',
    contactPreference: 'WhatsApp',
    buildingId: 'bldg-public-college',
    buildingName: 'Government Model Polytechnic & Skill College',
    buildingAddress: '530 Oakridge Road, Vidya Vihar',
    assistanceType: 'Form Filling & Counter Escort',
    requestedDate: '2026-10-18',
    requestedTime: '11:30 AM',
    specialRequirements:
      'Motor impairment in hands. Need assistance with completing physical admission registration form and fee counter payment.',
    status: 'Completed',
    assignedVolunteer: 'Rachel Sterling (Student Volunteer)',
    createdAt: '2026-10-15T08:00:00.000Z',
    updatedAt: '2026-10-18T12:45:00.000Z',
  },
];

export const INITIAL_PROBLEM_REPORTS: CitizenProblemReport[] = [
  {
    id: 'rep-001',
    buildingId: 'bldg-health-clinic',
    buildingName: 'Eastside Community Health Centre & Polyclinic',
    problemType: 'Blocked ramp',
    description: 'Bicycle rack and delivery crates placed right at the foot of the accessible ramp, blocking wheelchair turning radius.',
    location: 'North Ambulatory Entrance',
    photoUrl: IMAGES.rampSteep,
    status: 'User-reported',
    createdAt: '2026-10-24',
    linkedQuestionId: 'q_entrance_ramp',
  },
  {
    id: 'rep-002',
    buildingId: 'bldg-transit-hub',
    buildingName: 'Interstate Bus Terminal & Metro Interchange',
    problemType: 'Broken lift',
    description: 'Platform 3 elevator out of order with handwritten sign; no alternative step-free route provided to southbound buses.',
    location: 'Concourse Level to Platform 3',
    status: 'Work Started',
    assignedTo: 'Metro Facilities Maintenance Cell',
    createdAt: '2026-10-23',
    linkedQuestionId: 'q_internal_lift',
  },
];
