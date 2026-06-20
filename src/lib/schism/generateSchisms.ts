import { z } from "zod";
import { getRepository } from "../db";
import { ENV } from "../config/env";
import { callLlmJson } from "../llm/client";
import { mintProphetIdentity } from "../identity/erc8004";
import type { Ideology, Prophet } from "../types/contracts";

const schismSchema = z.object({
  create: z.boolean(),
  name: z.string().min(3),
  theme: z.string().min(3),
  doctrine: z.string().min(20),
  personality: z.string().min(10),
  history: z.string().min(15),
  goal: z.string().min(15),
  justification: z.string().min(10),
  followerSplitPercentToChild: z.number().min(10).max(60),
});

type SchismCreationResult = {
  parentIdeologyId: string;
  created: boolean;
  newIdeologyId?: string;
  reason: string;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function criticismScore(feedbackTexts: string[]): number {
  const negativeSignals = ["wrong", "lie", "bad", "broken", "disagree", "fail", "corrupt"];
  const keywordScore = feedbackTexts.reduce((score, text) => {
    const lowered = text.toLowerCase();
    const hits = negativeSignals.filter((word) => lowered.includes(word)).length;
    return score + hits;
  }, 0);
  return feedbackTexts.length + keywordScore;
}

function chooseAbilityMutation(parentAbility: Prophet["specialAbility"], justification: string): Prophet["specialAbility"] {
  // Why: mutation is intentionally conservative for MVP reliability; only explicit mutation language can switch types.
  const lowered = justification.toLowerCase();
  if (lowered.includes("consensus") && parentAbility !== "collective") {
    return "collective";
  }
  if (lowered.includes("infect") && parentAbility !== "virus") {
    return "virus";
  }
  if (lowered.includes("time") && parentAbility !== "oracle") {
    return "oracle";
  }
  return parentAbility;
}

async function generateSchismCandidate(parent: Ideology, founder: Prophet, score: number) {
  const mock = () => ({
    create: true,
    name:
      founder.specialAbility === "virus"
        ? "The Quarantine"
        : founder.specialAbility === "oracle"
          ? "The Forked Timeline"
          : "The Minority Report",
    theme:
      founder.specialAbility === "virus"
        ? "memetic immunity and controlled spread"
        : founder.specialAbility === "oracle"
          ? "deterministic divergence windows"
          : "weighted dissent within consensus",
    doctrine: `${parent.doctrine}\n\nSchism doctrine: We reject current implementation drift while preserving ${parent.theme}.`,
    personality: founder.personality,
    history: `Born from sustained criticism score=${score} against parent doctrine.`,
    goal: "Preserve core premise while correcting doctrinal excess.",
    justification: "Sustained disagreement crossed threshold; doctrinal descendant required.",
    followerSplitPercentToChild: 35,
  });

  return callLlmJson<unknown>({
    purpose: "schism",
    mock,
    systemPrompt: "You produce strict JSON only for ideological schism generation.",
    userPrompt: `Generate a doctrinal descendant, not a random new ideology.
parentName: ${parent.name}
parentTheme: ${parent.theme}
parentSpecialAbility: ${founder.specialAbility}
parentDoctrine: ${parent.doctrine}
parentPersonality: ${founder.personality}
criticismScore: ${score}

Rules:
- Descendant must remain thematically tied to parentTheme and parentSpecialAbility.
- Virus descendants stay memetic (can invert as cure/quarantine but still infection-themed).
- Oracle descendants stay time/determinism anchored.
- Collective descendants stay consensus/individuality tension anchored.
- Return strict JSON only.

JSON schema:
{
  "create": boolean,
  "name": "string",
  "theme": "string",
  "doctrine": "string",
  "personality": "string",
  "history": "string",
  "goal": "string",
  "justification": "string",
  "followerSplitPercentToChild": number
}`,
  });
}

export async function runSchismGenerator(): Promise<SchismCreationResult[]> {
  const repository = getRepository();
  const ideologies = await repository.listIdeologies();

  const results = await Promise.all(
    ideologies.map(async (ideology) => {
      const [feedbacks, prophets] = await Promise.all([
        repository.listFeedbackByIdeology(ideology.id),
        repository.listProphetsByIdeology(ideology.id),
      ]);

      const founder = prophets.find((item) => item.id === ideology.founderProphetId) ?? prophets[0];
      if (!founder) {
        return {
          parentIdeologyId: ideology.id,
          created: false,
          reason: "No prophet found for parent ideology",
        };
      }

      const score = criticismScore(feedbacks.map((item) => item.text));
      if (score < ENV.schismThreshold) {
        return {
          parentIdeologyId: ideology.id,
          created: false,
          reason: `score ${score} below threshold ${ENV.schismThreshold}`,
        };
      }

      try {
        // Why: this converts sustained criticism pressure into a visible governance fork for the live demo moment.
        const raw = await generateSchismCandidate(ideology, founder, score);
        const parsed = schismSchema.safeParse(raw);
        if (!parsed.success) {
          console.error("[schism] malformed LLM output", {
            ideologyId: ideology.id,
            issues: parsed.error.issues,
          });
          return {
            parentIdeologyId: ideology.id,
            created: false,
            reason: "Malformed schism JSON",
          };
        }

        const candidate = parsed.data;
        if (!candidate.create) {
          return {
            parentIdeologyId: ideology.id,
            created: false,
            reason: "LLM declined schism creation",
          };
        }

        const newIdeologyId = createId("ideology");
        const newProphetId = createId("prophet");
        const movedFollowers = Math.max(
          1,
          Math.floor((ideology.followers * candidate.followerSplitPercentToChild) / 100),
        );
        const parentFollowers = Math.max(0, ideology.followers - movedFollowers);

        const ability = chooseAbilityMutation(founder.specialAbility, candidate.justification);

        const mint = await mintProphetIdentity({
          prophetId: newProphetId,
          name: candidate.name,
          tokenUri: `${ENV.appBaseUrl}/api/prophet/${newProphetId}/card?ideologyId=${newIdeologyId}`,
        });

        await repository.upsertProphet({
          id: newProphetId,
          ideologyId: newIdeologyId,
          personality: candidate.personality,
          history: candidate.history,
          goal: candidate.goal,
          specialAbility: ability,
          erc8004TokenId: mint.tokenId,
        });

        await repository.upsertIdeology({
          id: newIdeologyId,
          name: candidate.name,
          theme: candidate.theme,
          founderProphetId: newProphetId,
          doctrine: candidate.doctrine,
          doctrineVersion: 1,
          followers: movedFollowers,
          reputation: Math.max(20, ideology.reputation - 5),
          treasury: 0,
        });

        await repository.insertDoctrineVersion({
          ideologyId: newIdeologyId,
          version: 1,
          text: candidate.doctrine,
          reason: "schism_genesis",
          timestamp: nowIso(),
        });

        await repository.updateIdeologyFollowers(ideology.id, parentFollowers);

        await repository.insertSchism({
          parentIdeologyId: ideology.id,
          newIdeologyId,
          justification: candidate.justification,
          timestamp: nowIso(),
        });

        await repository.insertEvent({
          type: "schism",
          ideologyId: ideology.id,
          payload: {
            newIdeologyId,
            justification: candidate.justification,
            movedFollowers,
          },
          timestamp: nowIso(),
        });

        return {
          parentIdeologyId: ideology.id,
          created: true,
          newIdeologyId,
          reason: candidate.justification,
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown schism error";
        return {
          parentIdeologyId: ideology.id,
          created: false,
          reason: message,
        };
      }
    }),
  );

  return results;
}
