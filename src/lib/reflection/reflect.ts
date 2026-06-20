import { z } from "zod";
import { callLlmJson } from "../llm/client";
import { getRepository } from "../db";
import type { Event, Ideology } from "../types/contracts";

const reflectionSchema = z.object({
  change: z.boolean(),
  newDoctrine: z.string().min(20),
  reason: z.string().min(10),
});

type ReflectionResult = {
  ideologyId: string;
  changed: boolean;
  skipped: boolean;
  reason: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function summarizeRecentEvents(events: Event[]): string {
  return events
    .slice(0, 6)
    .map((event) => `${event.type}:${JSON.stringify(event.payload)}`)
    .join("\n");
}

async function reflectOneIdeology(ideology: Ideology): Promise<ReflectionResult> {
  const repository = getRepository();
  const [metrics, prophets] = await Promise.all([
    repository.getIdeologyMetrics(ideology.id),
    repository.listProphetsByIdeology(ideology.id),
  ]);

  const prophet = prophets.find((item) => item.id === ideology.founderProphetId) ?? prophets[0];
  const personality = prophet?.personality ?? "Maintain founding voice.";

  const mockDecision = () => {
    const criticismCount = metrics.criticismTexts.length;
    const shouldChange = criticismCount >= 3 || metrics.followerGrowth > 4;

    if (!shouldChange) {
      return {
        change: false,
        newDoctrine: ideology.doctrine,
        reason: "No major pressure detected this cycle.",
      };
    }

    return {
      change: true,
      newDoctrine: `${ideology.doctrine}\n\nAmendment v${ideology.doctrineVersion + 1}: We absorb criticism without abandoning ${ideology.theme}.`,
      reason: `Cycle pressure from ${criticismCount} criticism signals and growth=${metrics.followerGrowth}.`,
    };
  };

  // Why: Reflection is periodic governance pressure; we keep JSON strict so one bad LLM output never crashes the whole batch.
  const raw = await callLlmJson<unknown>({
    purpose: "reflection",
    mock: mockDecision,
    systemPrompt:
      "You are a doctrine reflection engine. Return strict JSON only, no markdown, no prose.",
    userPrompt: `Evaluate whether ideology doctrine should evolve.
ideologyName: ${ideology.name}
theme: ${ideology.theme}
personality: ${personality}
currentDoctrine: ${ideology.doctrine}
doctrineVersion: ${ideology.doctrineVersion}
followers: ${metrics.ideology.followers}
followerGrowth: ${metrics.followerGrowth}
treasury: ${metrics.ideology.treasury}
criticism: ${metrics.criticismTexts.join(" | ") || "none"}
recentEvents:\n${summarizeRecentEvents(metrics.recentEvents) || "none"}

Return JSON exactly:
{
  "change": boolean,
  "newDoctrine": "string",
  "reason": "string"
}

Important constraints:
- Preserve voice from theme + personality.
- Oracle must stay deterministic/calm.
- Virus must maintain escalating memetic style.
- Collective must remain consensus-driven in framing.`,
  });

  const parsed = reflectionSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("[reflect] malformed LLM output", {
      ideologyId: ideology.id,
      issues: parsed.error.issues,
    });
    return {
      ideologyId: ideology.id,
      changed: false,
      skipped: true,
      reason: "Malformed reflection JSON",
    };
  }

  const decision = parsed.data;
  if (!decision.change) {
    return {
      ideologyId: ideology.id,
      changed: false,
      skipped: false,
      reason: decision.reason,
    };
  }

  const newVersion = ideology.doctrineVersion + 1;
  await repository.insertDoctrineVersion({
    ideologyId: ideology.id,
    version: newVersion,
    text: decision.newDoctrine,
    reason: decision.reason,
    timestamp: nowIso(),
  });
  await repository.updateIdeologyDoctrine(ideology.id, decision.newDoctrine, newVersion);
  await repository.insertEvent({
    type: "doctrine_change",
    ideologyId: ideology.id,
    payload: {
      version: newVersion,
      reason: decision.reason,
    },
    timestamp: nowIso(),
  });

  return {
    ideologyId: ideology.id,
    changed: true,
    skipped: false,
    reason: decision.reason,
  };
}

export async function runReflectionCycle(): Promise<ReflectionResult[]> {
  const repository = getRepository();
  const ideologies = await repository.listIdeologies();

  // Why: each ideology is independent, so Promise.all keeps reflection fast for live demos.
  const results = await Promise.all(
    ideologies.map(async (ideology) => {
      try {
        return await reflectOneIdeology(ideology);
      } catch (error) {
        const message = error instanceof Error ? error.message : "unknown";
        console.error("[reflect] ideology failed", { ideologyId: ideology.id, message });
        return {
          ideologyId: ideology.id,
          changed: false,
          skipped: true,
          reason: message,
        };
      }
    }),
  );

  return results;
}

export function getReflectionIntervalMs(): number {
  return 15 * 60 * 1000;
}

export function startReflectionScheduler(): NodeJS.Timeout {
  return setInterval(() => {
    void runReflectionCycle();
  }, getReflectionIntervalMs());
}
