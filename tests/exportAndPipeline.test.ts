import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { exportProspects, toCsv } from "../agents/exporters/exportProspects.js";
import { runSourcing } from "../agents/pipeline/runSourcing.js";
import { RulesScorer } from "../agents/scoring/rulesScorer.js";
import { fixtureCandidates } from "../agents/data/fixtures.js";

test("CSV exporter includes schema fields and escaped evidence", async () => {
  const candidate = fixtureCandidates[0];
  const prospect = await new RulesScorer().score(candidate);
  const csv = toCsv([prospect]);

  assert.match(csv, /companyName,website,industry,vertical,location/);
  assert.match(csv, /Pacific Coast HVAC & Plumbing/);
  assert.match(csv, /likelyWorkflowToAutomate,outreachAngle,evidence/);
});

test("JSON, CSV, and summary exports are written", async () => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), "business-sourcing-export-"));
  const candidate = fixtureCandidates[0];
  const prospect = await new RulesScorer().score(candidate);

  const files = await exportProspects(
    {
      location: "Los Angeles, CA",
      verticals: ["home-services"],
      limit: 1,
      providerName: "fixture",
      scoringName: "rules",
      outputDir
    },
    [prospect],
    "2026-06-01T00:00:00.000Z"
  );

  const [json, csv, summary] = await Promise.all([fs.readFile(files.jsonPath, "utf8"), fs.readFile(files.csvPath, "utf8"), fs.readFile(files.summaryPath, "utf8")]);
  assert.match(json, /"companyName": "Pacific Coast HVAC & Plumbing"/);
  assert.match(csv, /Pacific Coast HVAC & Plumbing/);
  assert.match(summary, /Business Sourcing Run Summary/);
});

test("fixture smoke run creates Los Angeles export files without credentials", async () => {
  const outputDir = await fs.mkdtemp(path.join(os.tmpdir(), "business-sourcing-run-"));
  const result = await runSourcing({
    location: "Los Angeles, CA",
    verticals: ["home-services", "property-management-real-estate", "legal-professional-services"],
    limit: 5,
    providerName: "fixture",
    scoringName: "rules",
    outputDir
  });

  assert.equal(result.config.providerName, "fixture");
  assert.equal(result.config.scoringName, "rules");
  assert.equal(result.prospects.length, 5);
  assert.ok(result.prospects.every((prospect) => prospect.totalScore >= 18));

  await Promise.all([fs.access(result.exportedFiles.jsonPath), fs.access(result.exportedFiles.csvPath), fs.access(result.exportedFiles.summaryPath)]);
});
