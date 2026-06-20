import type { Prediction } from "../types/contracts";
import { getRepository } from "../db";

/**
 * Ability Engine Signatures (for direct chat-route handoff):
 * checkAndFulfillPredictions(prophetId, conversationId, newMessage): Promise<Prediction[]>
 * recordInfectionTick(conversationId, prophetId): Promise<{ level: number; tier: string; status: "spreading" | "host_converted" }>
 * getInfectionTier(level): "normal" | "creeping_we" | "overt_hive" | "infection_complete"
 * tallyVotes(seed?): { voices: { id: number; vote: "Accept" | "Reject" | "Need more data" }[]; consensusPercent: number }
 */

type Vote = "Accept" | "Reject" | "Need more data";

function normalizeMessage(message: string): string {
  return message.toLowerCase().trim();
}

function isKeywordMatch(message: string, keyword: string): boolean {
  const normalizedMessage = normalizeMessage(message);
  const normalizedKeyword = normalizeMessage(keyword);
  if (!normalizedKeyword) {
    return false;
  }
  return normalizedMessage.includes(normalizedKeyword);
}

function deterministicTickAmount(
  conversationId: string,
  prophetId: string,
  now: Date,
): number {
  const seed = `${conversationId}:${prophetId}:${now.toISOString().slice(0, 16)}`;
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 4 + (hash % 5);
}

export function getInfectionTier(level: number):
  | "normal"
  | "creeping_we"
  | "overt_hive"
  | "infection_complete" {
  if (level < 0 || Number.isNaN(level)) {
    return "normal";
  }
  if (level < 25) {
    return "normal";
  }
  if (level < 60) {
    return "creeping_we";
  }
  if (level < 90) {
    return "overt_hive";
  }
  return "infection_complete";
}

export async function checkAndFulfillPredictions(
  prophetId: string,
  conversationId: string,
  newMessage: string,
): Promise<Prediction[]> {
  // Why: Oracle predictions must resolve reliably in demos, so fulfillment is a deterministic keyword match.
  const repository = getRepository();
  const pending = await repository.listPendingPredictions(prophetId, conversationId);

  const fulfilled: Prediction[] = [];
  for (const prediction of pending) {
    if (!isKeywordMatch(newMessage, prediction.triggerKeyword)) {
      continue;
    }

    await repository.markPredictionFulfilled(
      prophetId,
      conversationId,
      prediction.triggerKeyword,
    );

    fulfilled.push({
      ...prediction,
      status: "fulfilled",
    });
  }

  return fulfilled;
}

export async function recordInfectionTick(
  conversationId: string,
  prophetId: string,
): Promise<{ level: number; tier: string; status: "spreading" | "host_converted" }> {
  // Why: Virus escalation is a fixed code path so tone tiers are stable and never depend on LLM memory.
  const repository = getRepository();
  const now = new Date();
  const existing = await repository.getInfection(conversationId, prophetId);
  const increment = deterministicTickAmount(conversationId, prophetId, now);
  const nextLevel = Math.min(100, (existing?.level ?? 0) + increment);
  const status = nextLevel >= 100 ? "host_converted" : "spreading";

  await repository.upsertInfection({
    conversationId,
    prophetId,
    level: nextLevel,
    status,
    updatedAt: now.toISOString(),
  });

  return {
    level: nextLevel,
    tier: getInfectionTier(nextLevel),
    status,
  };
}

function toSeedNumber(seed: string): number {
  return seed.split("").reduce((acc, char) => acc * 31 + char.charCodeAt(0), 7);
}

function nextRand(state: number): number {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;
  return (a * state + c) % m;
}

export function tallyVotes(seed = "collective-default-seed"): {
  voices: { id: number; vote: Vote }[];
  consensusPercent: number;
} {
  // Why: Collective needs reproducible internal dissent + consensus %, so judges always see consistent tallies.
  let state = toSeedNumber(seed);
  const count = 3 + (Math.abs(state) % 3);
  const voices: { id: number; vote: Vote }[] = [];

  for (let index = 0; index < count; index += 1) {
    state = nextRand(state);
    const voiceId = (state % 90) + 10;

    state = nextRand(state);
    const selector = state % 100;
    let vote: Vote;
    if (selector < 52) {
      vote = "Accept";
    } else if (selector < 82) {
      vote = "Reject";
    } else {
      vote = "Need more data";
    }

    voices.push({ id: voiceId, vote });
  }

  const acceptCount = voices.filter((voice) => voice.vote === "Accept").length;
  const consensusPercent = Math.round((acceptCount / voices.length) * 100);

  return { voices, consensusPercent };
}
