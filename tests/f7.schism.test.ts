import { describe, expect, it } from "vitest";
import { setRepository } from "../src/lib/db";
import { InMemoryRepository } from "../src/lib/db/inMemoryRepository";
import { seedProphets } from "../src/lib/f1/seedProphets";
import { runSchismGenerator } from "../src/lib/schism/generateSchisms";

describe("F7 schism generator", () => {
  it("creates schism records and event when criticism crosses threshold", async () => {
    const repository = new InMemoryRepository();
    setRepository(repository);

    const seeded = await seedProphets();
    const parent = seeded.ideologies.find((item) => item.name === "The Virus") ?? seeded.ideologies[0];

    for (let index = 0; index < 30; index += 1) {
      repository.feedbacks.push({
        ideologyId: parent.id,
        userId: `u${index}`,
        text: "wrong bad disagree fail",
        timestamp: new Date().toISOString(),
      });
    }

    const results = await runSchismGenerator();
    const parentResult = results.find((item) => item.parentIdeologyId === parent.id);

    expect(parentResult?.created).toBe(true);
    expect(parentResult?.newIdeologyId).toBeTruthy();

    expect(repository.schisms.length).toBeGreaterThanOrEqual(1);
    expect(repository.events.some((event) => event.type === "schism")).toBe(true);

    const parentAfter = repository.ideologies.get(parent.id);
    expect(parentAfter?.followers).toBeGreaterThanOrEqual(0);
  });
});
