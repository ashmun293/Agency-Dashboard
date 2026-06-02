import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createApiServer } from "../agents/server/apiServer.js";
import { LocalSourcingStore } from "../agents/store/jsonStore.js";
import type { SourcingProspect, SourcingStoreData } from "../agents/types.js";
import { runAgentTeam } from "../agents/workflow/agentTeam.js";

type RunCreationResponse = {
  prospects: SourcingProspect[];
  run: { agentSteps: Array<{ agentName: string }> };
};

test("agent team creates enriched prospects and agent steps", async () => {
  const store = await createTempStore();
  const data = await store.read();
  const result = await runAgentTeam(data.settings, {
    location: "Los Angeles, CA",
    verticals: ["home-services"],
    limit: 3,
    providerName: "fixture",
    scoringName: "rules",
    outputDir: await fs.mkdtemp(path.join(os.tmpdir(), "agent-team-export-"))
  });

  assert.equal(result.prospects.length, 3);
  assert.ok(result.run.agentSteps.some((step) => step.agentName === "Scraper Agent"));
  assert.ok(result.run.agentSteps.some((step) => step.agentName === "Compliance Guard Agent"));
  assert.ok(result.prospects.every((prospect) => prospect.contactEmail));
  assert.ok(result.prospects.every((prospect) => prospect.followUpRecommendations.length > 0));
});

test("API run creation creates prospects and agent status", async () => {
  await withTestApi(async ({ baseUrl }) => {
    const response = await postJson<RunCreationResponse>(
      `${baseUrl}/api/runs`,
      {
        location: "Los Angeles, CA",
        verticals: ["home-services"],
        limit: 2,
        providerName: "fixture",
        scoringName: "rules"
      },
      201
    );

    assert.equal(response.prospects.length, 2);
    assert.ok(response.run.agentSteps.some((step) => step.agentName === "Scoring Agent"));

    const agents = await getJson<{ agentSteps: Array<{ agentName: string }> }>(`${baseUrl}/api/agents/status`);
    assert.ok(agents.agentSteps.length > 0);
  });
});

test("API config redacts secrets and reports runtime readiness", async () => {
  await withTestApi(async ({ baseUrl }) => {
    const config = await getJson<{ settings: Record<string, unknown>; uiState: Record<string, unknown> }>(`${baseUrl}/api/config`);

    assert.equal(config.settings.defaultProviderName, "fixture");
    assert.equal(config.settings.defaultScoringName, "rules");
    assert.equal(typeof config.settings.hasGoogleMapsApiKey, "boolean");
    assert.equal(typeof config.settings.hasOpenAiApiKey, "boolean");
    assert.equal(config.settings.persistenceProvider, "local");
    assert.equal(config.uiState.location, "Los Angeles, CA");
    assert.equal("googleMapsApiKey" in config.settings, false);
    assert.equal("openAiApiKey" in config.settings, false);
  });
});

test("API UI state persists dashboard run controls", async () => {
  await withTestApi(async ({ baseUrl }) => {
    const saved = await patchJson<{ uiState: Record<string, unknown> }>(`${baseUrl}/api/ui-state`, {
      location: "Pasadena, CA",
      limit: 7,
      providerName: "google",
      scoringName: "openai",
      verticals: ["legal-professional-services"]
    });

    assert.equal(saved.uiState.location, "Pasadena, CA");
    assert.equal(saved.uiState.limit, 7);
    assert.equal(saved.uiState.providerName, "google");

    const loaded = await getJson<{ uiState: Record<string, unknown> }>(`${baseUrl}/api/ui-state`);
    assert.deepEqual(loaded.uiState, saved.uiState);
  });
});

test("API draft creation and approval attach outreach to a prospect", async () => {
  await withSeededApi(async ({ baseUrl }) => {
    const prospects = await getJson<{ prospects: SourcingProspect[] }>(`${baseUrl}/api/prospects`);
    const draftResponse = await postJson<{ prospect: SourcingProspect }>(`${baseUrl}/api/prospects/${prospects.prospects[0].id}/draft-outreach`, {}, 201);
    const draft = draftResponse.prospect.outreachDrafts[0];

    assert.equal(draft.approvalStatus, "needs-review");
    assert.match(draft.body, /not contact|not interested/i);

    const approved = await postJson<{ prospect: SourcingProspect }>(`${baseUrl}/api/outreach/${draft.id}/approve`, {});
    assert.equal(approved.prospect.outreachDrafts[0].approvalStatus, "approved");
  });
});

test("API send is blocked before approval", async () => {
  await withSeededApi(async ({ baseUrl }) => {
    const prospects = await getJson<{ prospects: SourcingProspect[] }>(`${baseUrl}/api/prospects`);
    const draftResponse = await postJson<{ prospect: SourcingProspect }>(`${baseUrl}/api/prospects/${prospects.prospects[0].id}/draft-outreach`, {}, 201);
    const blocked = await postJson<{ draft: { sendStatus: string; sendLog: Array<{ detail: string }> } }>(`${baseUrl}/api/outreach/${draftResponse.prospect.outreachDrafts[0].id}/send`, {}, 409);

    assert.equal(blocked.draft.sendStatus, "blocked");
    assert.match(blocked.draft.sendLog[0].detail, /Human approval required/);
  });
});

test("API approved send in test mode logs would-send and does not call Gmail", async () => {
  await withSeededApi(async ({ baseUrl }) => {
    const prospects = await getJson<{ prospects: SourcingProspect[] }>(`${baseUrl}/api/prospects`);
    const draftResponse = await postJson<{ prospect: SourcingProspect }>(`${baseUrl}/api/prospects/${prospects.prospects[0].id}/draft-outreach`, {}, 201);
    const draftId = draftResponse.prospect.outreachDrafts[0].id;
    await postJson(`${baseUrl}/api/outreach/${draftId}/approve`, {});
    const sent = await postJson<{ draft: { sendStatus: string; sendLog: Array<{ provider: string; detail: string }> } }>(`${baseUrl}/api/outreach/${draftId}/send`, {});

    assert.equal(sent.draft.sendStatus, "would-send");
    assert.equal(sent.draft.sendLog[0].provider, "test-mode");
    assert.match(sent.draft.sendLog[0].detail, /Gmail API was not called/);
  });
});

test("API live send is blocked when compliance fields are missing", async () => {
  await withSeededApi(async ({ baseUrl, store }) => {
    const data = await store.read();
    await store.write({ ...data, settings: { ...data.settings, sendMode: "live", senderPostalAddress: "" } });

    const prospects = await getJson<{ prospects: SourcingProspect[] }>(`${baseUrl}/api/prospects`);
    const draftResponse = await postJson<{ prospect: SourcingProspect }>(`${baseUrl}/api/prospects/${prospects.prospects[0].id}/draft-outreach`, {}, 201);
    const draftId = draftResponse.prospect.outreachDrafts[0].id;
    await postJson(`${baseUrl}/api/outreach/${draftId}/approve`, {});
    const blocked = await postJson<{ draft: { sendStatus: string; sendLog: Array<{ detail: string }> } }>(`${baseUrl}/api/outreach/${draftId}/send`, {}, 409);

    assert.equal(blocked.draft.sendStatus, "blocked");
    assert.match(blocked.draft.sendLog[0].detail, /postal address/i);
  });
});

test("API suppression blocks future sends", async () => {
  await withSeededApi(async ({ baseUrl, store }) => {
    const prospects = await getJson<{ prospects: SourcingProspect[] }>(`${baseUrl}/api/prospects`);
    const draftResponse = await postJson<{ prospect: SourcingProspect }>(`${baseUrl}/api/prospects/${prospects.prospects[0].id}/draft-outreach`, {}, 201);
    const draftId = draftResponse.prospect.outreachDrafts[0].id;
    const approved = await postJson<{ prospect: SourcingProspect }>(`${baseUrl}/api/outreach/${draftId}/approve`, {});
    await store.updateProspect({ ...approved.prospect, suppressionStatus: "suppressed" });
    const blocked = await postJson<{ draft: { sendStatus: string; sendLog: Array<{ detail: string }> } }>(`${baseUrl}/api/outreach/${draftId}/send`, {}, 409);

    assert.equal(blocked.draft.sendStatus, "blocked");
    assert.match(blocked.draft.sendLog[0].detail, /suppressed/i);
  });
});

async function withSeededApi(callback: (context: { baseUrl: string; store: LocalSourcingStore }) => Promise<void>) {
  await withTestApi(async (context) => {
    await postJson(
      `${context.baseUrl}/api/runs`,
      {
        location: "Los Angeles, CA",
        verticals: ["home-services"],
        limit: 2,
        providerName: "fixture",
        scoringName: "rules"
      },
      201
    );
    await callback(context);
  });
}

async function withTestApi(callback: (context: { baseUrl: string; store: LocalSourcingStore }) => Promise<void>) {
  const store = await createTempStore();
  const server = createApiServer(store);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await callback({ baseUrl, store });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

async function createTempStore(): Promise<LocalSourcingStore> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "sourcing-store-"));
  const store = new LocalSourcingStore(path.join(dir, "store.json"));
  const data: SourcingStoreData = await store.read();
  await store.write({
    ...data,
    settings: {
      ...data.settings,
      sendMode: "test",
      senderName: "Test Sender",
      senderEmail: "sender@example.com",
      senderPostalAddress: "123 Test St, Los Angeles, CA 90001"
    }
  });
  return store;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  assert.equal(response.status, 200);
  return (await response.json()) as T;
}

async function postJson<T = unknown>(url: string, body: unknown, expectedStatus = 200): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  assert.equal(response.status, expectedStatus);
  return (await response.json()) as T;
}

async function patchJson<T = unknown>(url: string, body: unknown, expectedStatus = 200): Promise<T> {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  assert.equal(response.status, expectedStatus);
  return (await response.json()) as T;
}
