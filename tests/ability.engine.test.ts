import { describe, expect, it } from "vitest";
import { setRepository } from "../src/lib/db";
import { InMemoryRepository } from "../src/lib/db/inMemoryRepository";
import {
  checkAndFulfillPredictions,
  getInfectionTier,
  recordInfectionTick,
  tallyVotes,
} from "../src/lib/abilities/engine";

describe("Special Ability Engine", () => {
  it("fulfills oracle predictions by keyword match", async () => {
    const repository = new InMemoryRepository();
    setRepository(repository);

    await repository.upsertPrediction({
      prophetId: "oracle-p",
      conversationId: "c1",
      predictionText: "You will mention eclipse.",
      triggerKeyword: "eclipse",
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    const fulfilled = await checkAndFulfillPredictions(
      "oracle-p",
      "c1",
      "I think this eclipse is symbolic.",
    );

    expect(fulfilled).toHaveLength(1);
    expect(fulfilled[0].status).toBe("fulfilled");

    const pending = await repository.listPendingPredictions("oracle-p", "c1");
    expect(pending).toHaveLength(0);
  });

  it("increments infection level and sets host_converted at 100", async () => {
    const repository = new InMemoryRepository();
    setRepository(repository);

    let state: {
      level: number;
      tier: string;
      status: "spreading" | "host_converted";
    } = { level: 0, tier: "normal", status: "spreading" };
    for (let index = 0; index < 30; index += 1) {
      state = await recordInfectionTick("conv-virus", "virus-p");
      if (state.status === "host_converted") {
        break;
      }
    }

    expect(state.level).toBeGreaterThan(0);
    expect(state.level).toBeLessThanOrEqual(100);
    expect(state.tier).toBe(getInfectionTier(state.level));
    expect(state.status).toBe("host_converted");
  });

  it("maps infection tiers by deterministic thresholds", () => {
    expect(getInfectionTier(0)).toBe("normal");
    expect(getInfectionTier(24)).toBe("normal");
    expect(getInfectionTier(25)).toBe("creeping_we");
    expect(getInfectionTier(59)).toBe("creeping_we");
    expect(getInfectionTier(60)).toBe("overt_hive");
    expect(getInfectionTier(89)).toBe("overt_hive");
    expect(getInfectionTier(90)).toBe("infection_complete");
    expect(getInfectionTier(100)).toBe("infection_complete");
  });

  it("produces deterministic collective vote tallies from a seed", () => {
    const first = tallyVotes("demo-seed");
    const second = tallyVotes("demo-seed");

    expect(first).toEqual(second);
    expect(first.voices.length).toBeGreaterThanOrEqual(3);
    expect(first.voices.length).toBeLessThanOrEqual(5);
    expect(first.consensusPercent).toBeGreaterThanOrEqual(0);
    expect(first.consensusPercent).toBeLessThanOrEqual(100);
  });
});
