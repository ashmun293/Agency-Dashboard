import path from "node:path";
import type { SourcingRunConfig, Vertical } from "../types.js";

export const DEFAULT_LOCATION = "Los Angeles, CA";
export const DEFAULT_VERTICALS: Vertical[] = ["home-services", "property-management-real-estate", "legal-professional-services"];
export const DEFAULT_LIMIT = 50;
export const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), "exports", "business-sourcing");

export function getDefaultConfig(): SourcingRunConfig {
  return {
    location: DEFAULT_LOCATION,
    verticals: DEFAULT_VERTICALS,
    limit: DEFAULT_LIMIT,
    providerName: "fixture",
    scoringName: "rules",
    outputDir: DEFAULT_OUTPUT_DIR
  };
}
