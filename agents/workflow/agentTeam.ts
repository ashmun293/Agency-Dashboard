import { getDefaultConfig } from "../config/defaults.js";
import { exportProspects } from "../exporters/exportProspects.js";
import { createCandidateProvider } from "../providers/index.js";
import { createProspectScorer } from "../scoring/index.js";
import type { AgentName, AgentStep, SenderSettings, SourcingProspect, SourcingRunConfig, SourcingRunRecord } from "../types.js";
import { buildComplianceChecklist } from "./complianceGuard.js";
import { inferContact } from "./contactEnrichment.js";
import { dedupeCandidates } from "./dedupe.js";
import { createFollowUpRecommendations } from "./followUpPlanner.js";

export type AgentTeamRunResult = {
  run: SourcingRunRecord;
  prospects: SourcingProspect[];
};

export async function runAgentTeam(settings: SenderSettings, overrides: Partial<SourcingRunConfig> = {}): Promise<AgentTeamRunResult> {
  const config: SourcingRunConfig = {
    ...getDefaultConfig(),
    ...overrides,
    verticals: overrides.verticals ?? getDefaultConfig().verticals
  };
  const runId = `run-${Date.now()}`;
  const generatedAt = new Date().toISOString();
  const steps: AgentStep[] = [];

  const provider = createCandidateProvider(config.providerName);
  const scraperStartedAt = new Date().toISOString();
  const candidates = await provider.listCandidates({ location: config.location, verticals: config.verticals, limit: config.limit });
  steps.push(step("Scraper Agent", "success", `Seeded ${candidates.length} candidates from ${config.providerName}.`, candidates.length, scraperStartedAt));

  const evidenceStartedAt = new Date().toISOString();
  steps.push(step("Evidence Agent", "success", "Attached website, review, hiring, portal, and contact-path evidence already available from provider outputs.", candidates.length, evidenceStartedAt));

  const dedupeStartedAt = new Date().toISOString();
  const deduped = dedupeCandidates(candidates);
  steps.push(step("Dedupe Agent", deduped.length < candidates.length ? "warning" : "success", `Normalized ${candidates.length - deduped.length} duplicate records.`, deduped.length, dedupeStartedAt));

  const scoringStartedAt = new Date().toISOString();
  const scorer = createProspectScorer(config.scoringName);
  const qualified = (await Promise.all(deduped.map((candidate) => scorer.score(candidate)))).sort((a, b) => b.totalScore - a.totalScore || a.companyName.localeCompare(b.companyName));
  steps.push(step("Scoring Agent", "success", `Scored ${qualified.length} prospects against the 7-part sourcing rubric.`, qualified.length, scoringStartedAt));

  const prospects: SourcingProspect[] = qualified.map((prospect) => {
    const contact = inferContact(prospect);
    const shell: SourcingProspect = {
      ...prospect,
      ...contact,
      suppressionStatus: "clear",
      agentSteps: [],
      reviewStatus: prospect.qualificationStatus === "qualified" ? "needs-review" : "new",
      assignedNextAction: prospect.qualificationStatus === "qualified" ? "Draft outreach" : "Review evidence",
      outreachDrafts: [],
      complianceChecklist: buildComplianceChecklist({ ...contact, suppressionStatus: "clear" }, settings),
      followUpRecommendations: []
    };
    return {
      ...shell,
      agentSteps: steps,
      followUpRecommendations: createFollowUpRecommendations(shell)
    };
  });

  steps.push(step("Outreach Writer Agent", "idle", "Ready to draft first-touch emails for selected prospects.", 0, new Date().toISOString()));
  steps.push(step("Compliance Guard Agent", "success", "Human approval required. No auto-send. Live sending requires sender identity, postal address, opt-out language, and unsuppressed recipient.", prospects.length, new Date().toISOString()));
  steps.push(step("Approval Coordinator Agent", "idle", "Waiting for prospect review and draft approvals.", 0, new Date().toISOString()));
  steps.push(step("Gmail Sender Agent", settings.sendMode === "live" ? "idle" : "blocked", settings.sendMode === "live" ? "Live mode enabled; approved compliant drafts may be sent." : "Test mode enabled; Gmail calls are disabled.", 0, new Date().toISOString()));
  steps.push(step("Follow-up Planner Agent", "success", "Suggested follow-up drafts created; every follow-up still requires approval.", prospects.length * 2, new Date().toISOString()));

  await exportProspects(config, qualified, generatedAt);
  steps.push(step("Export/CRM Logger Agent", "success", "Wrote JSON, CSV, and run summary exports.", qualified.length, new Date().toISOString()));

  const run: SourcingRunRecord = {
    id: runId,
    generatedAt,
    config,
    prospectIds: prospects.map((prospect) => prospect.id),
    agentSteps: steps,
    summary: {
      totalProspects: prospects.length,
      qualified: prospects.filter((prospect) => prospect.qualificationStatus === "qualified").length,
      needsReview: prospects.filter((prospect) => prospect.reviewStatus === "needs-review").length,
      approved: 0,
      sent: 0
    }
  };

  return { run, prospects };
}

function step(agentName: AgentName, status: AgentStep["status"], summary: string, outputCount: number, startedAt: string): AgentStep {
  return {
    id: `${agentName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    agentName,
    status,
    summary,
    outputCount,
    startedAt,
    completedAt: new Date().toISOString()
  };
}
