import fs from "node:fs/promises";
import path from "node:path";
import { RUBRIC_CATEGORIES, RUBRIC_LABELS } from "../types.js";
import type { ExportedFiles, QualifiedProspect, SourcingRunConfig } from "../types.js";
import { slugify } from "../utils/slug.js";

export async function exportProspects(config: SourcingRunConfig, prospects: QualifiedProspect[], generatedAt = new Date().toISOString()): Promise<ExportedFiles> {
  await fs.mkdir(config.outputDir, { recursive: true });

  const locationSlug = slugify(config.location.replace(/,\s*[A-Z]{2}$/i, ""));
  const jsonPath = path.join(config.outputDir, `${locationSlug}-prospects.json`);
  const csvPath = path.join(config.outputDir, `${locationSlug}-prospects.csv`);
  const summaryPath = path.join(config.outputDir, `${locationSlug}-run-summary.md`);

  await fs.writeFile(jsonPath, JSON.stringify({ generatedAt, config, prospects }, null, 2));
  await fs.writeFile(csvPath, toCsv(prospects));
  await fs.writeFile(summaryPath, toSummaryMarkdown(config, prospects, generatedAt));

  return { jsonPath, csvPath, summaryPath };
}

export function toCsv(prospects: QualifiedProspect[]): string {
  const headers = [
    "companyName",
    "website",
    "industry",
    "vertical",
    "location",
    "estimatedSize",
    "decisionMakerFound",
    "targetRole",
    "contactPath",
    ...RUBRIC_CATEGORIES,
    "totalScore",
    "priorityTier",
    "qualificationStatus",
    "likelyWorkflowToAutomate",
    "outreachAngle",
    "evidence"
  ];

  const rows = prospects.map((prospect) =>
    headers.map((header) => {
      if (RUBRIC_CATEGORIES.includes(header as (typeof RUBRIC_CATEGORIES)[number])) {
        return prospect.scores[header as (typeof RUBRIC_CATEGORIES)[number]];
      }
      if (header === "evidence") {
        return prospect.evidence.map((item) => `${item.sourceName}: ${item.note}${item.url ? ` (${item.url})` : ""}`).join(" | ");
      }
      return prospect[header as keyof QualifiedProspect] ?? "";
    })
  );

  return [headers, ...rows].map((row) => row.map((value) => escapeCsv(String(value))).join(",")).join("\n") + "\n";
}

function toSummaryMarkdown(config: SourcingRunConfig, prospects: QualifiedProspect[], generatedAt: string): string {
  const qualified = prospects.filter((prospect) => prospect.qualificationStatus === "qualified").length;
  const possible = prospects.filter((prospect) => prospect.qualificationStatus === "possible").length;
  const lowPriority = prospects.filter((prospect) => prospect.qualificationStatus === "low-priority").length;
  const disqualified = prospects.filter((prospect) => prospect.qualificationStatus === "disqualified").length;
  const averageScore = prospects.length ? (prospects.reduce((total, prospect) => total + prospect.totalScore, 0) / prospects.length).toFixed(1) : "0.0";

  const lines = [
    `# Business Sourcing Run Summary`,
    "",
    `Generated: ${generatedAt}`,
    `Location: ${config.location}`,
    `Verticals: ${config.verticals.join(", ")}`,
    `Provider: ${config.providerName}`,
    `Scoring: ${config.scoringName}`,
    "",
    "## Results",
    "",
    `- Prospects exported: ${prospects.length}`,
    `- Qualified: ${qualified}`,
    `- Possible: ${possible}`,
    `- Low priority: ${lowPriority}`,
    `- Disqualified: ${disqualified}`,
    `- Average score: ${averageScore}`,
    "",
    "## Top Prospects",
    "",
    ...prospects.slice(0, 10).map((prospect, index) => `${index + 1}. ${prospect.companyName} - ${prospect.totalScore}/35 (${prospect.priorityTier})`),
    "",
    "## Rubric",
    "",
    ...RUBRIC_CATEGORIES.map((category) => `- ${RUBRIC_LABELS[category]}: 1-5`),
    ""
  ];

  return lines.join("\n");
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, "\"\"")}"`;
  }
  return value;
}
