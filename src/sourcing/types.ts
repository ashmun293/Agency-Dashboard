export type Vertical = "home-services" | "property-management-real-estate" | "legal-professional-services";
export type AgentStatus = "idle" | "running" | "success" | "warning" | "blocked" | "error";
export type ApprovalStatus = "draft" | "needs-review" | "approved" | "rejected";
export type SendStatus = "not-ready" | "blocked" | "would-send" | "sent" | "failed";
export type ReviewStatus = "new" | "needs-review" | "reviewed" | "skipped";
export type QualificationStatus = "qualified" | "possible" | "low-priority" | "disqualified";
export type ContactConfidence = "none" | "low" | "medium" | "high";

export type AgentStep = {
  id: string;
  agentName: string;
  status: AgentStatus;
  summary: string;
  outputCount: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
};

export type Evidence = {
  sourceType: string;
  sourceName: string;
  url?: string;
  note: string;
};

export type RubricScores = {
  clearOperationalPain: number;
  repeatableWorkflow: number;
  digitalOrSemiDigitalProcess: number;
  enoughVolume: number;
  budgetCapacity: number;
  decisionMakerAccess: number;
  measurableBusinessOutcome: number;
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
  type: "first-touch" | "follow-up";
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

export type SourcingProspect = {
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
  scores: RubricScores;
  totalScore: number;
  priorityTier: string;
  qualificationStatus: QualificationStatus;
  likelyWorkflowToAutomate: string;
  outreachAngle: string;
  contactEmail: string;
  contactSource: string;
  contactConfidence: ContactConfidence;
  suppressionStatus: "clear" | "suppressed";
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
  config: {
    location: string;
    verticals: Vertical[];
    limit: number;
    providerName: "fixture" | "google";
    scoringName: "rules" | "openai";
    outputDir: string;
  };
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

export type DashboardUiState = {
  location: string;
  limit: number;
  providerName: "fixture" | "google";
  scoringName: "rules" | "openai";
  verticals: Vertical[];
};
