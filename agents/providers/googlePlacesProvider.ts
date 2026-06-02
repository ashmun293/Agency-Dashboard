import type { BusinessCandidate, CandidateProvider, SourcingQuery, Vertical } from "../types.js";

type GooglePlace = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  websiteUri?: string;
  nationalPhoneNumber?: string;
  rating?: number;
  userRatingCount?: number;
  types?: string[];
};

type GoogleTextSearchResponse = {
  places?: GooglePlace[];
};

const verticalSearchTerms: Record<Vertical, string[]> = {
  "home-services": ["HVAC plumbing roofing electrical restoration service business"],
  "property-management-real-estate": ["property management leasing real estate office"],
  "legal-professional-services": ["law firm accounting bookkeeping insurance agency"]
};

const verticalIndustryLabels: Record<Vertical, string> = {
  "home-services": "Home services",
  "property-management-real-estate": "Property management or real estate",
  "legal-professional-services": "Legal or professional services"
};

export class GooglePlacesProvider implements CandidateProvider {
  name = "google" as const;

  constructor(private readonly apiKey = process.env.GOOGLE_MAPS_API_KEY) {}

  async listCandidates(query: SourcingQuery): Promise<BusinessCandidate[]> {
    if (!this.apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is required when SOURCING_PROVIDER=google or --provider google.");
    }

    const candidates: BusinessCandidate[] = [];
    const perSearchLimit = Math.min(Math.max(query.limit, 1), 20);

    for (const vertical of query.verticals) {
      for (const term of verticalSearchTerms[vertical]) {
        const places = await this.searchPlaces(`${term} in ${query.location}`, perSearchLimit);
        for (const place of places) {
          candidates.push(mapPlaceToCandidate(place, vertical, query.location));
          if (candidates.length >= query.limit) return candidates;
        }
      }
    }

    return candidates.slice(0, query.limit);
  }

  private async searchPlaces(textQuery: string, pageSize: number): Promise<GooglePlace[]> {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": this.apiKey ?? "",
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.websiteUri",
          "places.nationalPhoneNumber",
          "places.rating",
          "places.userRatingCount",
          "places.types"
        ].join(",")
      },
      body: JSON.stringify({
        textQuery,
        pageSize,
        includePureServiceAreaBusinesses: true
      })
    });

    if (!response.ok) {
      throw new Error(`Google Places Text Search failed with ${response.status}: ${await response.text()}`);
    }

    const payload = (await response.json()) as GoogleTextSearchResponse;
    return payload.places ?? [];
  }
}

function mapPlaceToCandidate(place: GooglePlace, vertical: Vertical, location: string): BusinessCandidate {
  const companyName = place.displayName?.text ?? "Unknown business";
  const reviewCount = place.userRatingCount ?? 0;
  const hasWebsite = Boolean(place.websiteUri);
  const ratingNote = place.rating ? `${place.rating} average rating from ${reviewCount} Google reviews.` : `${reviewCount} Google reviews.`;

  return {
    id: `google-${place.id ?? slugForId(companyName)}`,
    companyName,
    website: place.websiteUri ?? "",
    industry: verticalIndustryLabels[vertical],
    vertical,
    location,
    estimatedSize: "Unknown",
    decisionMakerFound: false,
    targetRole: defaultTargetRole(vertical),
    contactPath: hasWebsite ? "Company website" : place.nationalPhoneNumber ? "Phone number from Google Places" : "Unknown",
    primaryWorkflow: defaultWorkflow(vertical),
    evidence: [
      {
        sourceType: "google-business-profile",
        sourceName: "Google Places Text Search",
        note: `${ratingNote} Address: ${place.formattedAddress ?? "not provided"}.`
      },
      ...(hasWebsite
        ? [
            {
              sourceType: "website" as const,
              sourceName: "Google Places website field",
              url: place.websiteUri,
              note: "Website is available for compliant follow-up enrichment."
            }
          ]
        : [])
    ],
    signals: {
      clearOperationalPain: reviewCount >= 50 ? ["large public review footprint suggests frequent customer interactions"] : [],
      repeatableWorkflow: ["service or client intake likely repeats"],
      digitalOrSemiDigitalProcess: hasWebsite ? ["website available for intake/contact review"] : [],
      enoughVolume: reviewCount >= 100 ? ["100+ Google reviews"] : reviewCount >= 25 ? ["25+ Google reviews"] : [],
      budgetCapacity: ["commercial local service category"],
      decisionMakerAccess: hasWebsite ? ["website contact path"] : [],
      measurableBusinessOutcome: ["faster inquiry response", "more completed bookings or consults"]
    }
  };
}

function defaultWorkflow(vertical: Vertical): string {
  if (vertical === "home-services") return "lead intake and appointment scheduling";
  if (vertical === "property-management-real-estate") return "inquiry routing and showing or maintenance follow-up";
  return "client intake and document follow-up";
}

function defaultTargetRole(vertical: Vertical): string {
  if (vertical === "home-services") return "Owner or Operations Manager";
  if (vertical === "property-management-real-estate") return "Managing Broker or Operations Manager";
  return "Managing Partner or Office Manager";
}

function slugForId(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
