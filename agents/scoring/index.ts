import { OpenAiScorer } from "./openaiScorer.js";
import { RulesScorer } from "./rulesScorer.js";
import type { ProspectScorer, ScoringProviderName } from "../types.js";

export function createProspectScorer(scoringName: ScoringProviderName): ProspectScorer {
  if (scoringName === "openai") return new OpenAiScorer();
  return new RulesScorer();
}
