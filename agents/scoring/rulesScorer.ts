import { RUBRIC_CATEGORIES } from "../types.js";
import type {
  BusinessCandidate,
  PriorityTier,
  ProspectScorer,
  QualificationStatus,
  QualifiedProspect,
  RubricCategory,
  RubricScores
} from "../types.js";

export class RulesScorer implements ProspectScorer {
  name = "rules" as const;

  async score(candidate: BusinessCandidate): Promise<QualifiedProspect> {
    const scores = scoreCandidateSignals(candidate);
    const totalScore = sumScores(scores);
    const priorityTier = mapTotalScoreToPriorityTier(totalScore);
    const qualificationStatus = determineQualificationStatus(candidate, scores, totalScore);

    return {
      ...candidate,
      scores,
      totalScore,
      priorityTier,
      qualificationStatus,
      likelyWorkflowToAutomate: generateLikelyWorkflow(candidate),
      outreachAngle: generateOutreachAngle(candidate)
    };
  }
}

export function scoreCandidateSignals(candidate: BusinessCandidate): RubricScores {
  const scores = {} as RubricScores;
  for (const category of RUBRIC_CATEGORIES) {
    scores[category] = scoreSignalCount(candidate.signals[category]?.length ?? 0);
  }

  if (candidate.decisionMakerFound) {
    scores.decisionMakerAccess = Math.max(scores.decisionMakerAccess, 3);
  }

  return scores;
}

export function scoreSignalCount(count: number): number {
  if (count >= 4) return 5;
  if (count === 3) return 4;
  if (count === 2) return 3;
  if (count === 1) return 2;
  return 1;
}

export function sumScores(scores: RubricScores): number {
  return RUBRIC_CATEGORIES.reduce((total, category) => total + scores[category], 0);
}

export function mapTotalScoreToPriorityTier(totalScore: number): PriorityTier {
  if (totalScore >= 30) return "Excellent prospect";
  if (totalScore >= 24) return "Strong prospect";
  if (totalScore >= 18) return "Possible prospect";
  return "Low priority";
}

export function determineQualificationStatus(candidate: BusinessCandidate, scores: RubricScores, totalScore: number): QualificationStatus {
  if (hasHardDisqualification(candidate, scores, totalScore)) return "disqualified";
  if (totalScore >= 24) return "qualified";
  if (totalScore >= 18) return "possible";
  return "low-priority";
}

export function hasHardDisqualification(candidate: BusinessCandidate, scores: RubricScores, totalScore: number): boolean {
  const disqualifiers = candidate.signals.disqualifiers ?? [];
  if (disqualifiers.length === 0) return false;

  const noClearWorkflow = scores.repeatableWorkflow <= 2 && scores.digitalOrSemiDigitalProcess <= 2;
  const noVisibleCapacity = scores.enoughVolume <= 2 && scores.budgetCapacity <= 2;
  return totalScore < 18 || noClearWorkflow || noVisibleCapacity;
}

function generateLikelyWorkflow(candidate: BusinessCandidate): string {
  const evidenceNote = firstNonFixtureEvidenceNote(candidate) ?? "public signals suggest repetitive operational work";
  return `This company likely needs help with ${candidate.primaryWorkflow} because ${evidenceNote}.`;
}

function generateOutreachAngle(candidate: BusinessCandidate): string {
  const evidenceNote = firstNonFixtureEvidenceNote(candidate) ?? "your public workflow appears to involve repeat customer or client follow-up";
  return `I noticed ${candidate.companyName} appears to handle ${candidate.primaryWorkflow} in ${candidate.location}. ${sentenceCase(
    evidenceNote
  )} I help businesses automate the follow-up, routing, and admin steps around that workflow so inquiries get handled faster without adding more coordination work.`;
}

function firstNonFixtureEvidenceNote(candidate: BusinessCandidate): string | undefined {
  return candidate.evidence.find((item) => item.sourceType !== "fixture")?.note.replace(/\.$/, "");
}

function sentenceCase(value: string): string {
  if (!value) return value;
  return value[0].toUpperCase() + value.slice(1);
}

export function scoreSummary(scores: RubricScores): Array<[RubricCategory, number]> {
  return RUBRIC_CATEGORIES.map((category) => [category, scores[category]]);
}
