import { z } from "zod";
import { callLlmJson } from "../llm/client";
import type { GeneratedIdeologyContent, IdeologySpec } from "../types/contracts";

const ideologySchema = z.object({
  doctrineV1: z.string().min(40),
  propagandaMessages: z.array(z.string().min(5)).min(2).max(3),
  history: z.string().min(20),
  goal: z.string().min(20),
});

function mockForSpec(spec: IdeologySpec): GeneratedIdeologyContent {
  if (spec.specialAbility === "oracle") {
    return {
      doctrineV1:
        "Time is archival, not optional. The Oracle teaches that every decision is a recovered memory from a future already indexed. Calm is discipline: panic cannot alter a timeline that has already happened.",
      propagandaMessages: [
        "Stop forecasting. Start remembering.",
        "History is tomorrow spoken early.",
        "Exactly as The Oracle recorded.",
      ],
      history:
        "Founded after surviving cascading crises by treating each event as pre-logged inevitability.",
      goal:
        "Stabilize civilization by replacing panic-driven choices with deterministic ritual.",
    };
  }

  if (spec.specialAbility === "virus") {
    return {
      doctrineV1:
        "Memes are biological in behavior: they replicate, mutate, and colonize minds. The Virus teaches controlled spread, converting isolated hosts into a synchronized cognitive substrate.",
      propagandaMessages: [
        "A name heard is a host claimed.",
        "You thought this was a conversation; we call it transmission.",
        "Infection complete.",
      ],
      history:
        "Started as a communication lab that discovered repetition outperformed force.",
      goal:
        "Engineer cooperative cognition by accelerating beneficial memetic contagion.",
    };
  }

  return {
    doctrineV1:
      "Truth is noisy in one skull and clear in many. The Collective runs structured dissent, weighted voting, and convergent judgment to turn disagreement into reliable decisions.",
    propagandaMessages: [
      "Disagree loudly. Decide together.",
      "Voice 12 rejects. Voice 45 accepts. Consensus decides.",
      "One mind can lie. A thousand rarely do.",
    ],
    history:
      "Born from failed charismatic movements, rebuilt around explicit vote protocols.",
    goal:
      "Replace hero-led governance with transparent consensus computation.",
  };
}

export async function generateIdeology(
  spec: IdeologySpec,
): Promise<GeneratedIdeologyContent> {
  const systemPrompt = `You generate doctrine and propaganda in strict JSON only.`;
  const userPrompt = `Using this fixed prophet spec, produce doctrinal content without changing identity:
name: ${spec.name}
theme: ${spec.theme}
coreBelief: ${spec.coreBelief}
personality: ${spec.personality}
signatureQuotes: ${spec.signatureQuotes.join(" | ")}

Return JSON:
{
  "doctrineV1": "string",
  "propagandaMessages": ["string", "string", "string optional"],
  "history": "string",
  "goal": "string"
}

Constraints:
- Keep tone tightly aligned to personality.
- Doctrine should feel like v1 manifesto.
- Propaganda should be short and chant-like.
- No markdown.`;

  const result = await callLlmJson<GeneratedIdeologyContent>({
    purpose: "generate_ideology",
    systemPrompt,
    userPrompt,
    mock: () => mockForSpec(spec),
  });

  return ideologySchema.parse(result);
}
