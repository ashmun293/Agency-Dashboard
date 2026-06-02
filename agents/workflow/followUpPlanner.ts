import type { FollowUpRecommendation, SourcingProspect } from "../types.js";

export function createFollowUpRecommendations(prospect: SourcingProspect): FollowUpRecommendation[] {
  return [
    {
      id: `follow-up-${prospect.id}-1`,
      dueInDays: 4,
      subject: `Following up on ${prospect.primaryWorkflow}`,
      body: `Short follow-up for ${prospect.companyName}: ask whether intake, follow-up, or scheduling is worth reviewing. Mention the same public evidence and keep it human-reviewed.`,
      reason: "First follow-up if no reply after the initial outreach.",
      requiresApproval: true
    },
    {
      id: `follow-up-${prospect.id}-2`,
      dueInDays: 10,
      subject: `Should I close the loop?`,
      body: `Final gentle follow-up for ${prospect.companyName}: offer to close the loop unless they want examples of automation opportunities in ${prospect.industry}.`,
      reason: "Low-pressure close-the-loop follow-up; still requires approval before sending.",
      requiresApproval: true
    }
  ];
}
