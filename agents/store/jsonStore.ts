import fs from "node:fs/promises";
import path from "node:path";
import { DEFAULT_LIMIT, DEFAULT_LOCATION, DEFAULT_VERTICALS } from "../config/defaults.js";
import { VERTICALS, type DashboardUiState, type SenderSettings, type SourcingProspect, type SourcingRunRecord, type SourcingStoreData } from "../types.js";

export const DEFAULT_STORE_PATH = path.resolve(process.cwd(), "var", "sourcing-store.json");

export interface SourcingStore {
  read(): Promise<SourcingStoreData>;
  write(data: SourcingStoreData): Promise<SourcingStoreData>;
  upsertRun(run: SourcingRunRecord, prospects: SourcingProspect[]): Promise<SourcingStoreData>;
  updateProspect(prospect: SourcingProspect): Promise<SourcingStoreData>;
}

export class LocalSourcingStore implements SourcingStore {
  constructor(private readonly storePath = process.env.SOURCING_STORE_PATH ?? DEFAULT_STORE_PATH) {}

  async read(): Promise<SourcingStoreData> {
    try {
      const raw = await fs.readFile(this.storePath, "utf8");
      return normalizeStore(JSON.parse(raw) as Partial<SourcingStoreData>);
    } catch (error) {
      if (error instanceof Error && "code" in error && (error as Error & { code?: string }).code === "ENOENT") {
        return createEmptyStore();
      }
      throw error;
    }
  }

  async write(data: SourcingStoreData): Promise<SourcingStoreData> {
    const next = { ...data, updatedAt: new Date().toISOString() };
    await fs.mkdir(path.dirname(this.storePath), { recursive: true });
    await fs.writeFile(this.storePath, JSON.stringify(next, null, 2));
    return next;
  }

  async upsertRun(run: SourcingRunRecord, prospects: SourcingProspect[]): Promise<SourcingStoreData> {
    const current = await this.read();
    const prospectIds = new Set(prospects.map((prospect) => prospect.id));
    const preservedProspects = current.prospects.filter((prospect) => !prospectIds.has(prospect.id));
    const runs = [run, ...current.runs.filter((item) => item.id !== run.id)].slice(0, 25);
    const agentSteps = [...run.agentSteps, ...current.agentSteps].slice(0, 100);
    return this.write({
      ...current,
      runs,
      prospects: [...prospects, ...preservedProspects],
      agentSteps
    });
  }

  async updateProspect(prospect: SourcingProspect): Promise<SourcingStoreData> {
    const current = await this.read();
    return this.write({
      ...current,
      prospects: current.prospects.map((item) => (item.id === prospect.id ? prospect : item))
    });
  }
}

export function createEmptyStore(): SourcingStoreData {
  return {
    runs: [],
    prospects: [],
    agentSteps: [],
    suppressions: [],
    settings: getSenderSettingsFromEnv(),
    uiState: createDefaultUiState(),
    updatedAt: new Date().toISOString()
  };
}

export function getSenderSettingsFromEnv(): SenderSettings {
  return {
    senderName: process.env.SENDER_NAME ?? "AI Automation Consultant",
    senderEmail: process.env.SENDER_EMAIL ?? "you@example.com",
    senderPostalAddress: process.env.SENDER_POSTAL_ADDRESS ?? "",
    optOutText:
      process.env.OUTREACH_OPT_OUT_TEXT ??
      "If this is not relevant, reply 'not interested' and I will not contact you again.",
    sendMode: process.env.OUTREACH_SEND_MODE === "live" ? "live" : "test",
    gmailTokenPath: process.env.GMAIL_TOKEN_PATH ?? path.resolve(process.cwd(), "var", "gmail-token.json")
  };
}

export function normalizeStore(value: Partial<SourcingStoreData>): SourcingStoreData {
  const empty = createEmptyStore();
  return {
    runs: value.runs ?? empty.runs,
    prospects: value.prospects ?? empty.prospects,
    agentSteps: value.agentSteps ?? empty.agentSteps,
    suppressions: value.suppressions ?? empty.suppressions,
    settings: { ...empty.settings, ...(value.settings ?? {}) },
    uiState: normalizeDashboardUiState(value.uiState),
    updatedAt: value.updatedAt ?? empty.updatedAt
  };
}

export function createDefaultUiState(): DashboardUiState {
  const limit = Number.parseInt(process.env.SOURCING_UI_LIMIT ?? String(DEFAULT_LIMIT), 10);
  const providerName = process.env.SOURCING_UI_PROVIDER ?? process.env.SOURCING_PROVIDER;
  const scoringName = process.env.SOURCING_UI_SCORING_PROVIDER ?? process.env.SCORING_PROVIDER;

  return {
    location: DEFAULT_LOCATION,
    limit: Number.isFinite(limit) ? limit : DEFAULT_LIMIT,
    providerName: providerName === "google" ? "google" : "fixture",
    scoringName: scoringName === "openai" ? "openai" : "rules",
    verticals: DEFAULT_VERTICALS
  };
}

export function normalizeDashboardUiState(value?: Partial<DashboardUiState>): DashboardUiState {
  const defaults = createDefaultUiState();
  const verticals = Array.isArray(value?.verticals)
    ? value.verticals.filter((item): item is DashboardUiState["verticals"][number] => VERTICALS.includes(item as DashboardUiState["verticals"][number]))
    : defaults.verticals;
  const limit = typeof value?.limit === "number" && Number.isFinite(value.limit) ? value.limit : defaults.limit;

  return {
    location: typeof value?.location === "string" && value.location.trim() ? value.location.trim() : defaults.location,
    limit: Math.max(1, Math.min(200, Math.round(limit))),
    providerName: value?.providerName === "google" || value?.providerName === "fixture" ? value.providerName : defaults.providerName,
    scoringName: value?.scoringName === "openai" || value?.scoringName === "rules" ? value.scoringName : defaults.scoringName,
    verticals: verticals.length ? verticals : defaults.verticals
  };
}
