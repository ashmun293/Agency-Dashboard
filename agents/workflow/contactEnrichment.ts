import type { ContactConfidence, QualifiedProspect } from "../types.js";

export function inferContact(prospect: QualifiedProspect): { contactEmail: string; contactSource: string; contactConfidence: ContactConfidence } {
  const domain = safeDomain(prospect.website);
  if (!domain) {
    return {
      contactEmail: "",
      contactSource: "No website domain available",
      contactConfidence: "none"
    };
  }

  const localPart = prospect.vertical === "legal-professional-services" ? "intake" : prospect.vertical === "property-management-real-estate" ? "leasing" : "service";
  return {
    contactEmail: `${localPart}@${domain}`,
    contactSource: "Inferred from public website domain; verify before live outreach.",
    contactConfidence: prospect.isFixture ? "medium" : "low"
  };
}

function safeDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
