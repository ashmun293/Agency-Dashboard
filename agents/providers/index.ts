import { FixtureProvider } from "./fixtureProvider.js";
import { GooglePlacesProvider } from "./googlePlacesProvider.js";
import type { CandidateProvider, ProviderName } from "../types.js";

export function createCandidateProvider(providerName: ProviderName): CandidateProvider {
  if (providerName === "google") return new GooglePlacesProvider();
  return new FixtureProvider();
}
