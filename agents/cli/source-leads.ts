#!/usr/bin/env node
import { parseArgs } from "node:util";
import { DEFAULT_LIMIT, DEFAULT_LOCATION, DEFAULT_OUTPUT_DIR, DEFAULT_VERTICALS } from "../config/defaults.js";
import { runSourcing } from "../pipeline/runSourcing.js";
import { VERTICALS } from "../types.js";
import type { ProviderName, ScoringProviderName, Vertical } from "../types.js";
import { loadDotEnv } from "../utils/env.js";

loadDotEnv();

const parsed = parseArgs({
  options: {
    location: { type: "string" },
    vertical: { type: "string", multiple: true },
    limit: { type: "string" },
    provider: { type: "string" },
    scoring: { type: "string" },
    "output-dir": { type: "string" },
    "fixture-only": { type: "boolean" },
    help: { type: "boolean", short: "h" }
  },
  allowPositionals: false
});

if (parsed.values.help) {
  printHelp();
  process.exit(0);
}

try {
  const providerName = normalizeProvider(parsed.values.provider ?? process.env.SOURCING_PROVIDER ?? "fixture");
  const scoringName = normalizeScoring(parsed.values.scoring ?? process.env.SCORING_PROVIDER ?? "rules");
  const verticals = normalizeVerticals(parsed.values.vertical);
  const limit = normalizeLimit(parsed.values.limit);

  const result = await runSourcing({
    location: parsed.values.location ?? DEFAULT_LOCATION,
    verticals,
    limit,
    providerName,
    scoringName,
    outputDir: parsed.values["output-dir"] ?? DEFAULT_OUTPUT_DIR
  });

  const topProspect = result.prospects[0];
  console.log(`Sourcing complete: ${result.prospects.length} prospects for ${result.config.location}`);
  console.log(`Provider: ${result.config.providerName}; scoring: ${result.config.scoringName}`);
  if (topProspect) {
    console.log(`Top prospect: ${topProspect.companyName} (${topProspect.totalScore}/35, ${topProspect.priorityTier})`);
  }
  console.log(`JSON: ${result.exportedFiles.jsonPath}`);
  console.log(`CSV: ${result.exportedFiles.csvPath}`);
  console.log(`Summary: ${result.exportedFiles.summaryPath}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

function normalizeProvider(value: string): ProviderName {
  if (value === "google" || value === "fixture") return value;
  throw new Error(`Invalid provider "${value}". Expected one of: fixture, google.`);
}

function normalizeScoring(value: string): ScoringProviderName {
  if (value === "openai" || value === "rules") return value;
  throw new Error(`Invalid scoring provider "${value}". Expected one of: rules, openai.`);
}

function normalizeVerticals(values: string | string[] | undefined): Vertical[] {
  if (!values) return DEFAULT_VERTICALS;

  const requested = (Array.isArray(values) ? values : [values]).flatMap((value) => value.split(",").map((item) => item.trim()));
  if (requested.includes("all")) return DEFAULT_VERTICALS;

  const invalid = requested.filter((value) => !VERTICALS.includes(value as Vertical));
  if (invalid.length) {
    throw new Error(`Invalid vertical "${invalid.join(", ")}". Expected one of: ${VERTICALS.join(", ")}, all.`);
  }

  return requested as Vertical[];
}

function normalizeLimit(value: string | undefined): number {
  if (!value) return DEFAULT_LIMIT;
  const limit = Number.parseInt(value, 10);
  if (!Number.isFinite(limit) || limit < 1) {
    throw new Error(`Invalid limit "${value}". Use a positive integer.`);
  }
  return limit;
}

function printHelp(): void {
  console.log(`Business sourcing agents

Usage:
  npm run source:leads
  npm run source:leads -- --location "Los Angeles, CA" --vertical home-services --limit 50

Options:
  --location      Metro and state. Defaults to "Los Angeles, CA".
  --vertical      Repeatable or comma-separated vertical. Use all for every default vertical.
                  Allowed: ${VERTICALS.join(", ")}
  --limit         Maximum candidates to score. Defaults to ${DEFAULT_LIMIT}.
  --provider      fixture or google. Defaults to fixture.
  --scoring       rules or openai. Defaults to rules.
  --output-dir    Export directory. Defaults to ${DEFAULT_OUTPUT_DIR}.
  --fixture-only  Compatibility flag for deterministic offline fixture runs.
`);
}
