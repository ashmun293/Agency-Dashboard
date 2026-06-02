import { RulesScorer } from "./rulesScorer.js";
import type { BusinessCandidate, ProspectScorer, QualifiedProspect, RubricScores } from "../types.js";
import { mapTotalScoreToPriorityTier, determineQualificationStatus, sumScores } from "./rulesScorer.js";

type OpenAiScorePayload = {
  scores: RubricScores;
  likelyWorkflowToAutomate: string;
  outreachAngle: string;
};

export class OpenAiScorer implements ProspectScorer {
  name = "openai" as const;

  constructor(private readonly apiKey = process.env.OPENAI_API_KEY, private readonly model = process.env.OPENAI_MODEL ?? "gpt-4o-mini") {}

  async score(candidate: BusinessCandidate): Promise<QualifiedProspect> {
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY is required when SCORING_PROVIDER=openai or --scoring openai.");
    }

    const payload = await this.callStructuredScorer(candidate);
    const totalScore = sumScores(payload.scores);
    return {
      ...candidate,
      scores: payload.scores,
      totalScore,
      priorityTier: mapTotalScoreToPriorityTier(totalScore),
      qualificationStatus: determineQualificationStatus(candidate, payload.scores, totalScore),
      likelyWorkflowToAutomate: payload.likelyWorkflowToAutomate,
      outreachAngle: payload.outreachAngle
    };
  }

  private async callStructuredScorer(candidate: BusinessCandidate): Promise<OpenAiScorePayload> {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "system",
            content:
              "Score businesses for AI automation services. Use only supplied evidence. Return strict JSON with 1-5 rubric scores, a one-sentence workflow hypothesis, and a specific outreach angle."
          },
          {
            role: "user",
            content: JSON.stringify(candidate, null, 2)
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "business_sourcing_score",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              required: ["scores", "likelyWorkflowToAutomate", "outreachAngle"],
              properties: {
                scores: {
                  type: "object",
                  additionalProperties: false,
                  required: [
                    "clearOperationalPain",
                    "repeatableWorkflow",
                    "digitalOrSemiDigitalProcess",
                    "enoughVolume",
                    "budgetCapacity",
                    "decisionMakerAccess",
                    "measurableBusinessOutcome"
                  ],
                  properties: {
                    clearOperationalPain: { type: "integer", minimum: 1, maximum: 5 },
                    repeatableWorkflow: { type: "integer", minimum: 1, maximum: 5 },
                    digitalOrSemiDigitalProcess: { type: "integer", minimum: 1, maximum: 5 },
                    enoughVolume: { type: "integer", minimum: 1, maximum: 5 },
                    budgetCapacity: { type: "integer", minimum: 1, maximum: 5 },
                    decisionMakerAccess: { type: "integer", minimum: 1, maximum: 5 },
                    measurableBusinessOutcome: { type: "integer", minimum: 1, maximum: 5 }
                  }
                },
                likelyWorkflowToAutomate: { type: "string" },
                outreachAngle: { type: "string" }
              }
            }
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI structured scoring failed with ${response.status}: ${await response.text()}`);
    }

    const body = (await response.json()) as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
    const text = body.output_text ?? body.output?.flatMap((item) => item.content ?? []).find((item) => item.text)?.text;
    if (!text) {
      return new RulesScorer().score(candidate).then((prospect) => ({
        scores: prospect.scores,
        likelyWorkflowToAutomate: prospect.likelyWorkflowToAutomate,
        outreachAngle: prospect.outreachAngle
      }));
    }

    return JSON.parse(text) as OpenAiScorePayload;
  }
}
