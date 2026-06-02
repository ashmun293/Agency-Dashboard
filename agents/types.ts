export const VERTICALS = ["home-services", "property-management-real-estate", "legal-professional-services"] as const;

export type Vertical = (typeof VERTICALS)[number];

export const RUBRIC_CATEGORIES = [
  "clearOperationalPain",
  "repeatableWorkflow",
  "digitalOrSemiDigitalProcess",
  "enoughVolume",
  "budgetCapacity",
  "decisionMakerAccess",
  "measurableBusinessOutcome"
] as const;

export type RubricCategory = (typeof RUBRIC_CATEGORIES)[number];

export const RUBRIC_LABELS: Record<RubricCategory, string> = {
  clearOperationalPain: "Clear operational pain",
  repeatableWorkflow: "Repeatable workflow",
  digitalOrSemiDigitalProcess: "Digital or semi-digital process",
  enoughVolume: "Enough volume",
  budgetCapacity: "Budget capacity",
  decisionMakerAccess: "Decision maker access",
  measurableBusinessOutcome: "Measurable business outcome"
};

export type RubricScores = Record<RubricCategory, number>;

export type ProviderName = "fixture" | "google";
export type ScoringProviderName = "rules" | "openai";

export type PriorityTier = "Excellent prospect" | "Strong prospect" | "Possible prospect" | "Low priority";
export type QualificationStatus = "qualified" | "possible" | "low-priority" | "disqualified";

export type EvidenceSourceType =
  | "website"
  | "google-business-profile"
  | "review"
  | "job-posting"
  | "directory"
  | "technology"
  | "fixture";

export type Evidence = {
  sourceType: EvidenceSourceType;
  sourceName: string;
  url?: string;
  note: string;
};

export type CandidateSignals = {
  clearOperationalPain: string[];
  repeatableWorkflow: string[];
  digitalOrSemiDigitalProcess: string[];
  enoughVolume: string[];
  budgetCapacity: string[];
  decisionMakerAccess: string[];
  measurableBusinessOutcome: string[];
  disqualifiers?: string[];
};

export type BusinessCandidate = {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  vertical: Vertical;
  location: string;
  estimatedSize: string;
  decisionMakerFound: boolean;
  targetRole: string;
  contactPath: string;
  primaryWorkflow: string;
  evidence: Evidence[];
  signals: CandidateSignals;
  isFixture?: boolean;
};

export type QualifiedProspect = BusinessCandidate & {
  scores: RubricScores;
  totalScore: number;
  priorityTier: PriorityTier;
  qualificationStatus: QualificationStatus;
  likelyWorkflowToAutomate: string;
  outreachAngle: string;
};

export type SourcingQuery = {
  location: string;
  verticals: Vertical[];
  limit: number;
};

export type SourcingRunConfig = SourcingQuery & {
  providerName: ProviderName;
  scoringName: ScoringProviderName;
  outputDir: string;
};

export type AgentName =
  | "Scraper Agent"
  | "Evidence Agent"
  | "Dedupe Agent"
  | "Scoring Agent"
  | "Outreach Writer Agent"
  | "Compliance Guard Agent"
  | "Approval Coordinator Agent"
  | "Gmail Sender Agent"
  | "Follow-up Planner Agent"
  | "Export/CRM Logger Agent";

export type AgentStatus = "idle" | "running" | "success" | "warning" | "blocked" | "error";
export type ContactConfidence = "none" | "low" | "medium" | "high";
export type ReviewStatus = "new" | "needs-review" | "reviewed" | "skipped";
export type ApprovalStatus = "draft" | "needs-review" | "approved" | "rejected";
export type SendStatus = "not-ready" | "blocked" | "would-send" | "sent" | "failed";
export type SuppressionStatus = "clear" | "suppressed";
export type OutreachDraftType = "first-touch" | "follow-up";

export type AgentStep = {
  id: string;
  agentName: AgentName;
  status: AgentStatus;
  summary: string;
  outputCount: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
};

export type ComplianceChecklist = {
  hasSenderIdentity: boolean;
  hasPhysicalAddress: boolean;
  hasOptOutLanguage: boolean;
  hasTruthfulSubject: boolean;
  hasRecipientEmail: boolean;
  isApproved: boolean;
  isNotSuppressed: boolean;
  noAutoSend: boolean;
  notes: string[];
};

export type SendLogEntry = {
  id: string;
  timestamp: string;
  status: SendStatus;
  provider: "gmail" | "test-mode";
  messageId?: string;
  detail: string;
};

export type OutreachDraft = {
  id: string;
  prospectId: string;
  type: OutreachDraftType;
  subject: string;
  body: string;
  approvalStatus: ApprovalStatus;
  sendStatus: SendStatus;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  sentAt?: string;
  complianceChecklist: ComplianceChecklist;
  sendLog: SendLogEntry[];
};

export type FollowUpRecommendation = {
  id: string;
  dueInDays: number;
  subject: string;
  body: string;
  reason: string;
  requiresApproval: true;
};

export type SourcingProspect = QualifiedProspect & {
  contactEmail: string;
  contactSource: string;
  contactConfidence: ContactConfidence;
  suppressionStatus: SuppressionStatus;
  agentSteps: AgentStep[];
  reviewStatus: ReviewStatus;
  assignedNextAction: string;
  outreachDrafts: OutreachDraft[];
  complianceChecklist: ComplianceChecklist;
  followUpRecommendations: FollowUpRecommendation[];
};

export type SourcingRunRecord = {
  id: string;
  generatedAt: string;
  config: SourcingRunConfig;
  prospectIds: string[];
  agentSteps: AgentStep[];
  summary: {
    totalProspects: number;
    qualified: number;
    needsReview: number;
    approved: number;
    sent: number;
  };
};

export type SenderSettings = {
  senderName: string;
  senderEmail: string;
  senderPostalAddress: string;
  optOutText: string;
  sendMode: "test" | "live";
  gmailTokenPath: string;
};

export type DashboardUiState = {
  location: string;
  limit: number;
  providerName: ProviderName;
  scoringName: ScoringProviderName;
  verticals: Vertical[];
};

export type SourcingStoreData = {
  runs: SourcingRunRecord[];
  prospects: SourcingProspect[];
  agentSteps: AgentStep[];
  suppressions: string[];
  settings: SenderSettings;
  uiState: DashboardUiState;
  updatedAt: string;
};

export type GmailSendRequest = {
  to: string;
  fromName: string;
  fromEmail: string;
  subject: string;
  body: string;
};

export type GmailSendResult = {
  status: SendStatus;
  provider: "gmail" | "test-mode";
  messageId?: string;
  detail: string;
};

export type ExportedFiles = {
  jsonPath: string;
  csvPath: string;
  summaryPath: string;
};

export type SourcingRunResult = {
  config: SourcingRunConfig;
  generatedAt: string;
  candidates: BusinessCandidate[];
  prospects: QualifiedProspect[];
  exportedFiles: ExportedFiles;
};

export interface CandidateProvider {
  name: ProviderName;
  listCandidates(query: SourcingQuery): Promise<BusinessCandidate[]>;
}

export interface ProspectScorer {
  name: ScoringProviderName;
  score(candidate: BusinessCandidate): Promise<QualifiedProspect>;
}
