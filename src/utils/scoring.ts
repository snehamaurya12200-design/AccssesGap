import {
  AuditSectionId,
  QuestionResponseValue,
  ItemAuditResponse,
  AccessibilityTier,
} from '../types';
import { AUDIT_QUESTIONS, AUDIT_SECTIONS } from './auditQuestions';

export interface ScoreCalculationResult {
  overallScore: number | null; // null if "Score unavailable"
  statusTier: AccessibilityTier;
  completionPercentage: number;
  totalQuestions: number;
  totalAnswered: number;
  totalUnanswered: number;
  totalBarriers: number;
  criticalBarriersCount: number;
  criticalBarriersList: Array<{
    questionId: string;
    questionText: string;
    sectionId: AuditSectionId;
    response: ItemAuditResponse;
  }>;
  sectionScores: Record<
    AuditSectionId,
    { earned: number; possible: number; percent: number; answeredCount: number; totalCount: number }
  >;
  totalEarnedPoints: number;
  totalPossiblePoints: number;
}

/**
 * Calculates a verified accessibility score out of 100 based on standard checklist responses.
 *
 * Scoring Rules:
 * - Yes = 100 points
 * - Partially = 50 points
 * - No = 0 points
 * - Not applicable = excluded from calculation
 * - Not inspected = excluded from calculation, counted as incomplete
 *
 * Formula:
 * Accessibility score = total points earned ÷ total possible points for applicable, inspected questions × 100.
 * Rounded to nearest whole number.
 * If 0 applicable inspected questions, returns null ("Score unavailable").
 */
export function calculateAccessibilityScore(
  responses: Record<string, ItemAuditResponse>
): ScoreCalculationResult {
  const sectionScores: Record<
    AuditSectionId,
    { earned: number; possible: number; percent: number; answeredCount: number; totalCount: number }
  > = {
    entrance_approach: { earned: 0, possible: 0, percent: 0, answeredCount: 0, totalCount: 0 },
    internal_movement: { earned: 0, possible: 0, percent: 0, answeredCount: 0, totalCount: 0 },
    toilets_facilities: { earned: 0, possible: 0, percent: 0, answeredCount: 0, totalCount: 0 },
    signage_communication: { earned: 0, possible: 0, percent: 0, answeredCount: 0, totalCount: 0 },
    safety_usability: { earned: 0, possible: 0, percent: 0, answeredCount: 0, totalCount: 0 },
  };

  let totalEarnedPoints = 0;
  let totalPossiblePoints = 0;
  let totalAnswered = 0;
  let totalUnanswered = 0;
  let totalBarriers = 0;
  let criticalBarriersCount = 0;

  const criticalBarriersList: ScoreCalculationResult['criticalBarriersList'] = [];

  for (const q of AUDIT_QUESTIONS) {
    const sec = q.sectionId;
    sectionScores[sec].totalCount++;

    const resp = responses[q.id];
    const status: QuestionResponseValue = resp?.status || 'not_inspected';

    if (status === 'not_inspected') {
      totalUnanswered++;
      continue;
    }

    // It was answered (yes, partially, no, or not_applicable)
    totalAnswered++;
    sectionScores[sec].answeredCount++;

    if (status === 'not_applicable') {
      // Excluded from both numerator and denominator
      continue;
    }

    // Applicable item: max points is 100 for this question
    const itemMaxPoints = 100;
    sectionScores[sec].possible += itemMaxPoints;
    totalPossiblePoints += itemMaxPoints;

    if (status === 'yes') {
      sectionScores[sec].earned += 100;
      totalEarnedPoints += 100;
    } else if (status === 'partially') {
      sectionScores[sec].earned += 50;
      totalEarnedPoints += 50;
      totalBarriers++;

      if (q.isCritical) {
        criticalBarriersCount++;
        criticalBarriersList.push({
          questionId: q.id,
          questionText: q.question,
          sectionId: q.sectionId,
          response: resp,
        });
      }
    } else if (status === 'no') {
      // 0 earned points
      totalBarriers++;

      if (q.isCritical) {
        criticalBarriersCount++;
        criticalBarriersList.push({
          questionId: q.id,
          questionText: q.question,
          sectionId: q.sectionId,
          response: resp,
        });
      }
    }
  }

  // Calculate percentages per section
  for (const secMeta of AUDIT_SECTIONS) {
    const sId = secMeta.id;
    const entry = sectionScores[sId];
    if (entry.possible > 0) {
      entry.percent = Math.round((entry.earned / entry.possible) * 100);
    } else {
      entry.percent = entry.answeredCount > 0 ? 100 : 0;
    }
  }

  // Calculate overall completion percentage (answered / total)
  const completionPercentage = Math.round((totalAnswered / AUDIT_QUESTIONS.length) * 100);

  // Overall score: if totalPossiblePoints === 0, score is unavailable
  let overallScore: number | null = null;
  let statusTier: AccessibilityTier = 'Score unavailable';

  if (totalPossiblePoints > 0) {
    overallScore = Math.round((totalEarnedPoints / totalPossiblePoints) * 100);

    if (overallScore >= 80) {
      statusTier = 'Higher recorded accessibility score';
    } else if (overallScore >= 60) {
      statusTier = 'Improvements recommended';
    } else {
      statusTier = 'Significant barriers identified';
    }
  }

  return {
    overallScore,
    statusTier,
    completionPercentage,
    totalQuestions: AUDIT_QUESTIONS.length,
    totalAnswered,
    totalUnanswered,
    totalBarriers,
    criticalBarriersCount,
    criticalBarriersList,
    sectionScores,
    totalEarnedPoints,
    totalPossiblePoints,
  };
}

export function getTierColorClass(tier: AccessibilityTier): {
  badge: string;
  text: string;
  border: string;
  bgLight: string;
} {
  switch (tier) {
    case 'Higher recorded accessibility score':
      return {
        badge: 'text-emerald-900 bg-emerald-50 border border-emerald-300 font-semibold',
        text: 'text-emerald-800',
        border: 'border-emerald-500',
        bgLight: 'bg-emerald-50',
      };
    case 'Improvements recommended':
      return {
        badge: 'text-amber-900 bg-amber-50 border border-amber-300 font-semibold',
        text: 'text-amber-800',
        border: 'border-amber-500',
        bgLight: 'bg-amber-50',
      };
    case 'Significant barriers identified':
      return {
        badge: 'text-rose-900 bg-rose-50 border border-rose-300 font-semibold',
        text: 'text-rose-800',
        border: 'border-rose-500',
        bgLight: 'bg-rose-50',
      };
    case 'Score unavailable':
    default:
      return {
        badge: 'text-slate-700 bg-slate-100 border border-slate-300 font-medium',
        text: 'text-slate-600',
        border: 'border-slate-400',
        bgLight: 'bg-slate-50',
      };
  }
}
