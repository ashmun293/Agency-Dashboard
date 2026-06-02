import { getDefaultConfig } from "../config/defaults.js";
import { exportProspects } from "../exporters/exportProspects.js";
import { createCandidateProvider } from "../providers/index.js";
import { createProspectScorer } from "../scoring/index.js";
import type { SourcingRunConfig, SourcingRunResult } from "../types.js";

export async function runSourcing(overrides: Partial<SourcingRunConfig> = {}): Promise<SourcingRunResult> {
  const config: SourcingRunConfig = {
    ...getDefaultConfig(),
    ...overrides,
    verticals: overrides.verticals ?? getDefaultConfig().verticals
  };

  const provider = createCandidateProvider(config.providerName);
  const scorer = createProspectScorer(config.scoringName);
  const generatedAt = new Date().toISOString();

  const candidates = await provider.listCandidates({
    location: config.location,
    verticals: config.verticals,
    limit: config.limit
  });

  const prospects = (await Promise.all(candidates.map((candidate) => scorer.score(candidate)))).sort(
    (first, second) => second.totalScore - first.totalScore || first.companyName.localeCompare(second.companyName)
  );

  const exportedFiles = await exportProspects(config, prospects, generatedAt);

  return {
    config,
    generatedAt,
    candidates,
    prospects,
    exportedFiles
  };
}
