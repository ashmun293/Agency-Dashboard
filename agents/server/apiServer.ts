import http from "node:http";
import { DEFAULT_LIMIT, DEFAULT_LOCATION, DEFAULT_OUTPUT_DIR, DEFAULT_VERTICALS } from "../config/defaults.js";
import { GmailSender } from "../outreach/gmailSender.js";
import { normalizeDashboardUiState, type SourcingStore } from "../store/jsonStore.js";
import { createSourcingStore } from "../store/supabaseStore.js";
import type { OutreachDraft, ProviderName, ScoringProviderName, SourcingRunConfig, SourcingProspect, Vertical } from "../types.js";
import { VERTICALS } from "../types.js";
import { loadDotEnv } from "../utils/env.js";
import { buildComplianceChecklist, hasLiveSendClearance } from "../workflow/complianceGuard.js";
import { runAgentTeam } from "../workflow/agentTeam.js";
import { createOutreachDraft } from "../workflow/outreachWriter.js";

type JsonRecord = Record<string, unknown>;

export function createApiServer(store = createSourcingStore()): http.Server {
  return http.createServer(async (request, response) => {
    try {
      response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5173");
      response.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,OPTIONS");
      response.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (request.method === "OPTIONS") {
        response.writeHead(204);
        response.end();
        return;
      }

      const url = new URL(request.url ?? "/", "http://127.0.0.1");
      const path = url.pathname;

      if (request.method === "GET" && path === "/api/health") {
        return sendJson(response, 200, { ok: true });
      }

      if (request.method === "GET" && path === "/api/config") {
        const data = await store.read();
        return sendJson(response, 200, { settings: redactSettings(data.settings), uiState: data.uiState });
      }

      if (request.method === "GET" && path === "/api/ui-state") {
        const data = await store.read();
        return sendJson(response, 200, { uiState: data.uiState });
      }

      if (request.method === "PATCH" && path === "/api/ui-state") {
        const body = await readJson(request);
        const data = await store.read();
        const uiState = normalizeDashboardUiState({ ...data.uiState, ...body });
        const next = await store.write({ ...data, uiState });
        return sendJson(response, 200, { uiState: next.uiState });
      }

      if (request.method === "POST" && path === "/api/runs") {
        const body = await readJson(request);
        const data = await store.read();
        const config = normalizeRunConfig(body);
        const result = await runAgentTeam(data.settings, config);
        const next = await store.upsertRun(result.run, result.prospects);
        return sendJson(response, 201, { run: result.run, prospects: result.prospects, store: summarizeStore(next) });
      }

      if (request.method === "GET" && path === "/api/runs") {
        const data = await store.read();
        return sendJson(response, 200, { runs: data.runs });
      }

      if (request.method === "GET" && path === "/api/prospects") {
        const data = await store.read();
        return sendJson(response, 200, { prospects: data.prospects });
      }

      const prospectMatch = path.match(/^\/api\/prospects\/([^/]+)$/);
      if (request.method === "GET" && prospectMatch) {
        const data = await store.read();
        const prospect = data.prospects.find((item) => item.id === decodeURIComponent(prospectMatch[1]));
        if (!prospect) return sendJson(response, 404, { error: "Prospect not found." });
        return sendJson(response, 200, { prospect });
      }

      const draftMatch = path.match(/^\/api\/prospects\/([^/]+)\/draft-outreach$/);
      if (request.method === "POST" && draftMatch) {
        const data = await store.read();
        const prospect = findProspect(data.prospects, draftMatch[1]);
        if (!prospect) return sendJson(response, 404, { error: "Prospect not found." });
        const existing = prospect.outreachDrafts.find((draft) => draft.type === "first-touch");
        const draft = createOutreachDraft(prospect, data.settings, existing?.id);
        const updated = {
          ...prospect,
          reviewStatus: "needs-review" as const,
          assignedNextAction: "Review outreach draft",
          outreachDrafts: existing ? prospect.outreachDrafts.map((item) => (item.id === existing.id ? draft : item)) : [draft, ...prospect.outreachDrafts],
          complianceChecklist: draft.complianceChecklist
        };
        await store.updateProspect(updated);
        return sendJson(response, 201, { prospect: updated, draft });
      }

      const patchDraftMatch = path.match(/^\/api\/outreach\/([^/]+)$/);
      if (request.method === "PATCH" && patchDraftMatch) {
        const body = await readJson(request);
        const update = await updateDraft(store, patchDraftMatch[1], (draft, prospect, settings) => ({
          ...draft,
          subject: typeof body.subject === "string" ? body.subject : draft.subject,
          body: typeof body.body === "string" ? body.body : draft.body,
          approvalStatus: typeof body.approvalStatus === "string" ? (body.approvalStatus as OutreachDraft["approvalStatus"]) : draft.approvalStatus,
          updatedAt: new Date().toISOString(),
          complianceChecklist: buildComplianceChecklist(prospect, settings, {
            subject: typeof body.subject === "string" ? body.subject : draft.subject,
            body: typeof body.body === "string" ? body.body : draft.body,
            approvalStatus: typeof body.approvalStatus === "string" ? (body.approvalStatus as OutreachDraft["approvalStatus"]) : draft.approvalStatus
          })
        }));
        if (!update) return sendJson(response, 404, { error: "Draft not found." });
        return sendJson(response, 200, update);
      }

      const approveDraftMatch = path.match(/^\/api\/outreach\/([^/]+)\/approve$/);
      if (request.method === "POST" && approveDraftMatch) {
        const update = await updateDraft(store, approveDraftMatch[1], (draft, prospect, settings) => {
          const approved = { ...draft, approvalStatus: "approved" as const, approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
          return {
            ...approved,
            complianceChecklist: buildComplianceChecklist(prospect, settings, approved)
          };
        });
        if (!update) return sendJson(response, 404, { error: "Draft not found." });
        return sendJson(response, 200, update);
      }

      const sendDraftMatch = path.match(/^\/api\/outreach\/([^/]+)\/send$/);
      if (request.method === "POST" && sendDraftMatch) {
        const update = await sendDraft(store, sendDraftMatch[1]);
        if (!update) return sendJson(response, 404, { error: "Draft not found." });
        return sendJson(response, update.draft.sendStatus === "blocked" ? 409 : 200, update);
      }

      if (request.method === "GET" && path === "/api/agents/status") {
        const data = await store.read();
        return sendJson(response, 200, { agentSteps: data.agentSteps, settings: redactSettings(data.settings) });
      }

      return sendJson(response, 404, { error: "Route not found." });
    } catch (error) {
      return sendJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
    }
  });
}

async function updateDraft(
  store: SourcingStore,
  draftId: string,
  updater: (draft: OutreachDraft, prospect: SourcingProspect, settings: Awaited<ReturnType<SourcingStore["read"]>>["settings"]) => OutreachDraft
): Promise<{ prospect: SourcingProspect; draft: OutreachDraft } | undefined> {
  const data = await store.read();
  const prospect = data.prospects.find((item) => item.outreachDrafts.some((draft) => draft.id === draftId));
  if (!prospect) return undefined;
  const draft = prospect.outreachDrafts.find((item) => item.id === draftId);
  if (!draft) return undefined;

  const updatedDraft = updater(draft, prospect, data.settings);
  const updatedProspect = {
    ...prospect,
    assignedNextAction: nextActionForDraft(updatedDraft),
    outreachDrafts: prospect.outreachDrafts.map((item) => (item.id === draftId ? updatedDraft : item)),
    complianceChecklist: updatedDraft.complianceChecklist
  };
  await store.updateProspect(updatedProspect);
  return { prospect: updatedProspect, draft: updatedDraft };
}

async function sendDraft(store: SourcingStore, draftId: string): Promise<{ prospect: SourcingProspect; draft: OutreachDraft } | undefined> {
  const data = await store.read();
  const prospect = data.prospects.find((item) => item.outreachDrafts.some((draft) => draft.id === draftId));
  const draft = prospect?.outreachDrafts.find((item) => item.id === draftId);
  if (!prospect || !draft) return undefined;

  const checklist = buildComplianceChecklist(prospect, data.settings, draft);
  const blockedReason = getSendBlockReason(prospect, draft, checklist, data.settings.sendMode);
  if (blockedReason) {
    const blockedDraft: OutreachDraft = {
      ...draft,
      sendStatus: "blocked",
      complianceChecklist: checklist,
      sendLog: [
        {
          id: `send-log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          status: "blocked",
          provider: "test-mode",
          detail: blockedReason
        },
        ...draft.sendLog
      ]
    };
    const updatedProspect = {
      ...prospect,
      assignedNextAction: blockedReason,
      outreachDrafts: prospect.outreachDrafts.map((item) => (item.id === draftId ? blockedDraft : item)),
      complianceChecklist: blockedDraft.complianceChecklist
    };
    await store.updateProspect(updatedProspect);
    return { prospect: updatedProspect, draft: blockedDraft };
  }

  const result = await new GmailSender(data.settings).send({
    to: prospect.contactEmail,
    fromName: data.settings.senderName,
    fromEmail: data.settings.senderEmail,
    subject: draft.subject,
    body: draft.body
  });
  const sentDraft: OutreachDraft = {
    ...draft,
    sendStatus: result.status,
    sentAt: result.status === "sent" ? new Date().toISOString() : draft.sentAt,
    complianceChecklist: checklist,
    sendLog: [
      {
        id: `send-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: result.status,
        provider: result.provider,
        messageId: result.messageId,
        detail: result.detail
      },
      ...draft.sendLog
    ]
  };
  const updatedProspect = {
    ...prospect,
    reviewStatus: "reviewed" as const,
    assignedNextAction: result.status === "sent" ? "Sent and logged" : "Would send in live mode",
    outreachDrafts: prospect.outreachDrafts.map((item) => (item.id === draftId ? sentDraft : item)),
    complianceChecklist: sentDraft.complianceChecklist
  };
  await store.updateProspect(updatedProspect);
  return { prospect: updatedProspect, draft: sentDraft };
}

function getSendBlockReason(prospect: SourcingProspect, draft: OutreachDraft, checklist: ReturnType<typeof buildComplianceChecklist>, sendMode: "test" | "live"): string | undefined {
  if (draft.approvalStatus !== "approved") return "Human approval required before sending.";
  if (!prospect.contactEmail) return "Recipient email is missing.";
  if (prospect.suppressionStatus === "suppressed") return "Recipient is suppressed.";
  if (sendMode === "live" && !hasLiveSendClearance(checklist)) return `Live send blocked: ${checklist.notes.join(" ")}`;
  return undefined;
}

function normalizeRunConfig(value: JsonRecord): Partial<SourcingRunConfig> {
  return {
    location: typeof value.location === "string" ? value.location : DEFAULT_LOCATION,
    limit: typeof value.limit === "number" ? value.limit : DEFAULT_LIMIT,
    verticals: normalizeVerticals(value.verticals),
    providerName: value.providerName === "google" || value.providerName === "fixture" ? value.providerName : defaultProviderFromEnv(),
    scoringName: value.scoringName === "openai" || value.scoringName === "rules" ? value.scoringName : defaultScoringFromEnv(),
    outputDir: typeof value.outputDir === "string" ? value.outputDir : DEFAULT_OUTPUT_DIR
  };
}

function normalizeVerticals(value: unknown): Vertical[] {
  if (!Array.isArray(value)) return DEFAULT_VERTICALS;
  const requested = value.filter((item): item is Vertical => typeof item === "string" && VERTICALS.includes(item as Vertical));
  return requested.length ? requested : DEFAULT_VERTICALS;
}

function findProspect(prospects: SourcingProspect[], prospectId: string): SourcingProspect | undefined {
  return prospects.find((prospect) => prospect.id === decodeURIComponent(prospectId));
}

function nextActionForDraft(draft: OutreachDraft): string {
  if (draft.approvalStatus === "approved") return "Ready for guarded send";
  if (draft.approvalStatus === "rejected") return "Revise draft";
  return "Review outreach draft";
}

function summarizeStore(data: Awaited<ReturnType<SourcingStore["read"]>>): JsonRecord {
  return {
    runCount: data.runs.length,
    prospectCount: data.prospects.length,
    updatedAt: data.updatedAt
  };
}

function redactSettings(settings: Awaited<ReturnType<SourcingStore["read"]>>["settings"]): JsonRecord {
  const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL);
  const hasSupabaseServiceRoleKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY);

  return {
    senderName: settings.senderName,
    senderEmail: settings.senderEmail,
    hasSenderPostalAddress: Boolean(settings.senderPostalAddress),
    sendMode: settings.sendMode,
    gmailTokenPathConfigured: Boolean(settings.gmailTokenPath),
    hasGoogleMapsApiKey: Boolean(process.env.GOOGLE_MAPS_API_KEY),
    hasOpenAiApiKey: Boolean(process.env.OPENAI_API_KEY),
    openAiModel: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    defaultProviderName: defaultProviderFromEnv(),
    defaultScoringName: defaultScoringFromEnv(),
    hasSupabaseUrl,
    hasSupabaseServiceRoleKey,
    persistenceProvider: hasSupabaseUrl && hasSupabaseServiceRoleKey ? "supabase" : "local"
  };
}

function defaultProviderFromEnv(): ProviderName {
  return process.env.SOURCING_PROVIDER === "google" ? "google" : "fixture";
}

function defaultScoringFromEnv(): ScoringProviderName {
  return process.env.SCORING_PROVIDER === "openai" ? "openai" : "rules";
}

async function readJson(request: http.IncomingMessage): Promise<JsonRecord> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? (JSON.parse(raw) as JsonRecord) : {};
}

function sendJson(response: http.ServerResponse, status: number, payload: unknown): void {
  response.writeHead(status, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

if (process.argv[1]?.endsWith("apiServer.js")) {
  loadDotEnv();
  const port = Number.parseInt(process.env.SOURCING_API_PORT ?? "4174", 10);
  createApiServer().listen(port, "127.0.0.1", () => {
    console.log(`Sourcing API listening on http://127.0.0.1:${port}`);
  });
}
