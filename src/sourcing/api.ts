import type { AgentStep, DashboardUiState, SourcingProspect, SourcingRunRecord, Vertical } from "./types";

export type RunPayload = {
  location: string;
  verticals: Vertical[];
  limit: number;
  providerName: "fixture" | "google";
  scoringName: "rules" | "openai";
};

export type RuntimeSettings = {
  senderName: string;
  senderEmail: string;
  hasSenderPostalAddress: boolean;
  sendMode: "test" | "live";
  gmailTokenPathConfigured: boolean;
  hasGoogleMapsApiKey: boolean;
  hasOpenAiApiKey: boolean;
  openAiModel: string;
  defaultProviderName: "fixture" | "google";
  defaultScoringName: "rules" | "openai";
  hasSupabaseUrl: boolean;
  hasSupabaseServiceRoleKey: boolean;
  persistenceProvider: "local" | "supabase";
};

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string; draft?: { sendLog?: Array<{ detail?: string }> } };
    throw new Error(body.error ?? body.draft?.sendLog?.[0]?.detail ?? `Request failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

async function requestJsonWithAllowedStatus<T>(path: string, allowedStatuses: number[], init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });
  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok && !allowedStatuses.includes(response.status)) {
    throw new Error(body.error ?? `Request failed with ${response.status}`);
  }
  return body;
}

export const sourcingApi = {
  async loadConfig() {
    return requestJson<{ settings: RuntimeSettings; uiState: DashboardUiState }>("/api/config");
  },
  async loadUiState() {
    return requestJson<{ uiState: DashboardUiState }>("/api/ui-state");
  },
  async saveUiState(uiState: DashboardUiState) {
    return requestJson<{ uiState: DashboardUiState }>("/api/ui-state", {
      method: "PATCH",
      body: JSON.stringify(uiState)
    });
  },
  async loadProspects() {
    return requestJson<{ prospects: SourcingProspect[] }>("/api/prospects");
  },
  async loadRuns() {
    return requestJson<{ runs: SourcingRunRecord[] }>("/api/runs");
  },
  async loadAgents() {
    return requestJson<{ agentSteps: AgentStep[]; settings: RuntimeSettings }>("/api/agents/status");
  },
  async startRun(payload: RunPayload) {
    return requestJson<{ run: SourcingRunRecord; prospects: SourcingProspect[] }>("/api/runs", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  async draftOutreach(prospectId: string) {
    return requestJson<{ prospect: SourcingProspect; draft: SourcingProspect["outreachDrafts"][number] }>("/api/prospects/" + encodeURIComponent(prospectId) + "/draft-outreach", {
      method: "POST",
      body: JSON.stringify({})
    });
  },
  async approveDraft(draftId: string) {
    return requestJson<{ prospect: SourcingProspect; draft: SourcingProspect["outreachDrafts"][number] }>("/api/outreach/" + encodeURIComponent(draftId) + "/approve", {
      method: "POST",
      body: JSON.stringify({})
    });
  },
  async sendDraft(draftId: string) {
    return requestJsonWithAllowedStatus<{ prospect: SourcingProspect; draft: SourcingProspect["outreachDrafts"][number] }>("/api/outreach/" + encodeURIComponent(draftId) + "/send", [409], {
      method: "POST",
      body: JSON.stringify({})
    });
  }
};
