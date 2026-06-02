import type { BusinessCandidate } from "../types.js";

export function dedupeCandidates(candidates: BusinessCandidate[]): BusinessCandidate[] {
  const seen = new Set<string>();
  const deduped: BusinessCandidate[] = [];

  for (const candidate of candidates) {
    const key = `${domainKey(candidate.website)}:${candidate.companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}:${candidate.location.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(candidate);
  }

  return deduped;
}

function domainKey(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
