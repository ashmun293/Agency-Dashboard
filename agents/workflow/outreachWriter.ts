import type { OutreachDraft, SenderSettings, SourcingProspect } from "../types.js";
import { buildComplianceChecklist } from "./complianceGuard.js";

export function createOutreachDraft(prospect: SourcingProspect, settings: SenderSettings, existingDraftId?: string): OutreachDraft {
  const now = new Date().toISOString();
  const subject = `Idea for ${prospect.companyName}'s ${prospect.primaryWorkflow}`;
  const body = [
    `Hi ${prospect.targetRole.includes("Owner") ? "there" : prospect.targetRole},`,
    "",
    `I noticed ${prospect.companyName} appears to handle ${prospect.primaryWorkflow} around ${prospect.location}. ${prospect.evidence.find((item) => item.sourceType !== "fixture")?.note ?? prospect.outreachAngle}`,
    "",
    `Companies with that workflow often lose time when intake, follow-up, scheduling, or document collection gets handled manually. I help businesses automate those steps so new inquiries get handled faster without adding more admin work.`,
    "",
    "Would it be worth a quick look to see whether this is actually costing your team time?",
    "",
    `Best,`,
    settings.senderName,
    settings.senderPostalAddress ? settings.senderPostalAddress : "[postal address required before live sending]",
    "",
    settings.optOutText
  ].join("\n");

  const draft: OutreachDraft = {
    id: existingDraftId ?? `draft-${prospect.id}-${Date.now()}`,
    prospectId: prospect.id,
    type: "first-touch",
    subject,
    body,
    approvalStatus: "needs-review",
    sendStatus: "not-ready",
    createdAt: now,
    updatedAt: now,
    complianceChecklist: buildComplianceChecklist(prospect, settings, {
      subject,
      body,
      approvalStatus: "needs-review"
    }),
    sendLog: []
  };

  return draft;
}
