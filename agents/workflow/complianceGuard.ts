import type { ComplianceChecklist, OutreachDraft, SenderSettings, SourcingProspect } from "../types.js";

export function buildComplianceChecklist(
  prospect: Pick<SourcingProspect, "contactEmail" | "suppressionStatus">,
  settings: SenderSettings,
  draft?: Pick<OutreachDraft, "approvalStatus" | "subject" | "body">
): ComplianceChecklist {
  const notes: string[] = [];
  const hasSenderIdentity = Boolean(settings.senderName.trim() && settings.senderEmail.trim());
  const hasPhysicalAddress = Boolean(settings.senderPostalAddress.trim());
  const hasOptOutLanguage = Boolean((draft?.body ?? "").toLowerCase().includes("not contact") || (draft?.body ?? "").toLowerCase().includes("not interested"));
  const hasTruthfulSubject = Boolean(draft?.subject && !/urgent|final notice|invoice|account statement/i.test(draft.subject));
  const hasRecipientEmail = Boolean(prospect.contactEmail.trim());
  const isApproved = draft?.approvalStatus === "approved";
  const isNotSuppressed = prospect.suppressionStatus !== "suppressed";

  if (!hasSenderIdentity) notes.push("Missing sender identity.");
  if (!hasPhysicalAddress) notes.push("Missing sender postal address for live sending.");
  if (!hasOptOutLanguage) notes.push("Missing clear opt-out language.");
  if (!hasTruthfulSubject) notes.push("Subject may be missing or misleading.");
  if (!hasRecipientEmail) notes.push("Missing recipient email.");
  if (!isApproved) notes.push("Human approval required.");
  if (!isNotSuppressed) notes.push("Recipient is suppressed.");

  return {
    hasSenderIdentity,
    hasPhysicalAddress,
    hasOptOutLanguage,
    hasTruthfulSubject,
    hasRecipientEmail,
    isApproved,
    isNotSuppressed,
    noAutoSend: true,
    notes
  };
}

export function hasLiveSendClearance(checklist: ComplianceChecklist): boolean {
  return (
    checklist.hasSenderIdentity &&
    checklist.hasPhysicalAddress &&
    checklist.hasOptOutLanguage &&
    checklist.hasTruthfulSubject &&
    checklist.hasRecipientEmail &&
    checklist.isApproved &&
    checklist.isNotSuppressed &&
    checklist.noAutoSend
  );
}
