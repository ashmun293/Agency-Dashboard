import type { AgentStep, SourcingProspect, SourcingRunRecord } from "./types";

const now = new Date().toISOString();

export const sampleAgentSteps: AgentStep[] = [
  { id: "scraper", agentName: "Scraper Agent", status: "success", summary: "Seeded 12 Los Angeles candidates from fixture provider.", outputCount: 12, startedAt: now, completedAt: now },
  { id: "evidence", agentName: "Evidence Agent", status: "success", summary: "Attached public evidence, contact paths, and workflow signals.", outputCount: 12, startedAt: now, completedAt: now },
  { id: "scoring", agentName: "Scoring Agent", status: "success", summary: "Scored prospects against the sourcing rubric.", outputCount: 12, startedAt: now, completedAt: now },
  { id: "outreach", agentName: "Outreach Writer Agent", status: "idle", summary: "Ready to draft first-touch outreach.", outputCount: 0, startedAt: now, completedAt: now },
  { id: "guard", agentName: "Compliance Guard Agent", status: "blocked", summary: "Human approval required. No auto-send.", outputCount: 12, startedAt: now, completedAt: now },
  { id: "gmail", agentName: "Gmail Sender Agent", status: "blocked", summary: "Test mode enabled; Gmail calls are disabled.", outputCount: 0, startedAt: now, completedAt: now }
];

const baseChecklist = {
  hasSenderIdentity: true,
  hasPhysicalAddress: false,
  hasOptOutLanguage: true,
  hasTruthfulSubject: true,
  hasRecipientEmail: true,
  isApproved: false,
  isNotSuppressed: true,
  noAutoSend: true,
  notes: ["Human approval required.", "Missing sender postal address for live sending."]
};

export const sampleProspects: SourcingProspect[] = [
  {
    id: "fixture-pacific-coast-hvac",
    companyName: "Pacific Coast HVAC & Plumbing",
    website: "https://example.com/pacific-coast-hvac",
    industry: "HVAC and plumbing",
    vertical: "home-services",
    location: "Los Angeles, CA",
    estimatedSize: "25-50 employees",
    decisionMakerFound: true,
    targetRole: "Owner or Operations Manager",
    contactPath: "Website quote form and office phone",
    primaryWorkflow: "lead follow-up and appointment scheduling",
    evidence: [
      { sourceType: "website", sourceName: "Company website", url: "https://example.com/pacific-coast-hvac", note: "Promotes emergency service, maintenance plans, online quote requests, and multiple service areas." },
      { sourceType: "review", sourceName: "Sample review signals", note: "Sample reviews mention missed callbacks and delayed arrival windows." }
    ],
    scores: { clearOperationalPain: 5, repeatableWorkflow: 5, digitalOrSemiDigitalProcess: 5, enoughVolume: 5, budgetCapacity: 5, decisionMakerAccess: 4, measurableBusinessOutcome: 5 },
    totalScore: 34,
    priorityTier: "Excellent prospect",
    qualificationStatus: "qualified",
    likelyWorkflowToAutomate: "This company likely needs help with lead follow-up and appointment scheduling because public signals show emergency service, quote requests, and callback pressure.",
    outreachAngle: "I noticed your team handles emergency service and online quote requests across Los Angeles. I help automate lead follow-up and appointment coordination.",
    contactEmail: "service@example.com",
    contactSource: "Inferred from public website domain; verify before live outreach.",
    contactConfidence: "medium",
    suppressionStatus: "clear",
    agentSteps: sampleAgentSteps,
    reviewStatus: "needs-review",
    assignedNextAction: "Draft outreach",
    outreachDrafts: [],
    complianceChecklist: baseChecklist,
    followUpRecommendations: [
      { id: "follow-up-1", dueInDays: 4, subject: "Following up on lead response", body: "Suggested follow-up draft. Requires approval.", reason: "No reply after first touch.", requiresApproval: true }
    ]
  },
  {
    id: "fixture-echo-park-property-management",
    companyName: "Echo Park Property Management",
    website: "https://example.com/echo-park-property-management",
    industry: "Residential property management",
    vertical: "property-management-real-estate",
    location: "Los Angeles, CA",
    estimatedSize: "20-60 employees",
    decisionMakerFound: true,
    targetRole: "Managing Broker or Operations Manager",
    contactPath: "Owner inquiry form, tenant portal, and office email",
    primaryWorkflow: "tenant maintenance intake and owner reporting",
    evidence: [
      { sourceType: "website", sourceName: "Company website", url: "https://example.com/echo-park-property-management", note: "Features tenant portal, owner statements, rental applications, maintenance requests, and vacancy listings." }
    ],
    scores: { clearOperationalPain: 5, repeatableWorkflow: 5, digitalOrSemiDigitalProcess: 5, enoughVolume: 5, budgetCapacity: 5, decisionMakerAccess: 4, measurableBusinessOutcome: 4 },
    totalScore: 33,
    priorityTier: "Excellent prospect",
    qualificationStatus: "qualified",
    likelyWorkflowToAutomate: "This company likely needs help with maintenance intake because tenant portals, owner reports, and repeated maintenance requests create daily coordination work.",
    outreachAngle: "I noticed the tenant portal and owner reporting workflows. I help property managers automate request triage and status updates.",
    contactEmail: "leasing@example.com",
    contactSource: "Inferred from public website domain; verify before live outreach.",
    contactConfidence: "medium",
    suppressionStatus: "clear",
    agentSteps: sampleAgentSteps,
    reviewStatus: "needs-review",
    assignedNextAction: "Draft outreach",
    outreachDrafts: [],
    complianceChecklist: baseChecklist,
    followUpRecommendations: []
  },
  {
    id: "fixture-wilshire-client-intake-law",
    companyName: "Wilshire Client Intake Law Group",
    website: "https://example.com/wilshire-client-intake-law",
    industry: "Personal injury and employment law",
    vertical: "legal-professional-services",
    location: "Los Angeles, CA",
    estimatedSize: "25-75 employees",
    decisionMakerFound: true,
    targetRole: "Managing Partner or Intake Manager",
    contactPath: "Free consultation form, phone intake, and web chat",
    primaryWorkflow: "new client intake and document collection",
    evidence: [
      { sourceType: "website", sourceName: "Company website", url: "https://example.com/wilshire-client-intake-law", note: "Uses consultation forms, web chat, multiple practice areas, and document-heavy case intake." }
    ],
    scores: { clearOperationalPain: 5, repeatableWorkflow: 5, digitalOrSemiDigitalProcess: 5, enoughVolume: 4, budgetCapacity: 5, decisionMakerAccess: 4, measurableBusinessOutcome: 4 },
    totalScore: 32,
    priorityTier: "Excellent prospect",
    qualificationStatus: "qualified",
    likelyWorkflowToAutomate: "This company likely needs help with client intake because consultation forms, chat, and document-heavy case screening create repeat admin work.",
    outreachAngle: "I noticed your intake and consultation workflows. I help firms automate lead intake, document reminders, and CRM summaries.",
    contactEmail: "intake@example.com",
    contactSource: "Inferred from public website domain; verify before live outreach.",
    contactConfidence: "medium",
    suppressionStatus: "clear",
    agentSteps: sampleAgentSteps,
    reviewStatus: "needs-review",
    assignedNextAction: "Draft outreach",
    outreachDrafts: [],
    complianceChecklist: baseChecklist,
    followUpRecommendations: []
  }
];

export const sampleRuns: SourcingRunRecord[] = [
  {
    id: "sample-run",
    generatedAt: now,
    config: {
      location: "Los Angeles, CA",
      verticals: ["home-services", "property-management-real-estate", "legal-professional-services"],
      limit: 50,
      providerName: "fixture",
      scoringName: "rules",
      outputDir: "exports/business-sourcing"
    },
    prospectIds: sampleProspects.map((prospect) => prospect.id),
    agentSteps: sampleAgentSteps,
    summary: { totalProspects: 12, qualified: 10, needsReview: 10, approved: 0, sent: 0 }
  }
];
