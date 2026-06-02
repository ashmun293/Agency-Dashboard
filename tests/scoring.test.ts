import assert from "node:assert/strict";
import test from "node:test";
import { fixtureCandidates } from "../agents/data/fixtures.js";
import { FixtureProvider } from "../agents/providers/fixtureProvider.js";
import { RulesScorer, mapTotalScoreToPriorityTier, scoreCandidateSignals } from "../agents/scoring/rulesScorer.js";
import type { SourcingQuery } from "../agents/types.js";

test("maps total scores to requirement priority tiers", () => {
  assert.equal(mapTotalScoreToPriorityTier(35), "Excellent prospect");
  assert.equal(mapTotalScoreToPriorityTier(30), "Excellent prospect");
  assert.equal(mapTotalScoreToPriorityTier(29), "Strong prospect");
  assert.equal(mapTotalScoreToPriorityTier(24), "Strong prospect");
  assert.equal(mapTotalScoreToPriorityTier(23), "Possible prospect");
  assert.equal(mapTotalScoreToPriorityTier(18), "Possible prospect");
  assert.equal(mapTotalScoreToPriorityTier(17), "Low priority");
});

test("rules scorer disqualifies candidates with low capacity and explicit disqualifiers", async () => {
  const candidate = fixtureCandidates.find((item) => item.id === "fixture-sunset-solo-handyman");
  assert.ok(candidate);

  const prospect = await new RulesScorer().score(candidate);
  assert.equal(prospect.qualificationStatus, "disqualified");
  assert.equal(prospect.priorityTier, "Low priority");
});

test("signal-count rubric scoring is deterministic", () => {
  const candidate = fixtureCandidates.find((item) => item.id === "fixture-pacific-coast-hvac");
  assert.ok(candidate);

  const scores = scoreCandidateSignals(candidate);
  assert.deepEqual(scores, {
    clearOperationalPain: 5,
    repeatableWorkflow: 5,
    digitalOrSemiDigitalProcess: 5,
    enoughVolume: 5,
    budgetCapacity: 5,
    decisionMakerAccess: 4,
    measurableBusinessOutcome: 5
  });
});

test("fixture provider returns stable Los Angeles candidates", async () => {
  const provider = new FixtureProvider();
  const query: SourcingQuery = { location: "Los Angeles, CA", verticals: ["home-services"], limit: 3 };

  const first = await provider.listCandidates(query);
  const second = await provider.listCandidates(query);

  assert.deepEqual(
    first.map((candidate) => candidate.id),
    second.map((candidate) => candidate.id)
  );
  assert.deepEqual(
    first.map((candidate) => candidate.id),
    ["fixture-pacific-coast-hvac", "fixture-westside-restoration", "fixture-bright-current-electric"]
  );
});
