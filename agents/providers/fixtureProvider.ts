import { fixtureCandidates } from "../data/fixtures.js";
import type { BusinessCandidate, CandidateProvider, SourcingQuery } from "../types.js";

export class FixtureProvider implements CandidateProvider {
  name = "fixture" as const;

  async listCandidates(query: SourcingQuery): Promise<BusinessCandidate[]> {
    const location = query.location.toLowerCase();
    return fixtureCandidates
      .filter((candidate) => candidate.location.toLowerCase() === location)
      .filter((candidate) => query.verticals.includes(candidate.vertical))
      .slice(0, query.limit)
      .map((candidate) => ({ ...candidate, evidence: [...candidate.evidence] }));
  }
}
