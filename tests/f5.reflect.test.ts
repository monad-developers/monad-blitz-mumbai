import { describe, expect, it } from "vitest";
import { setRepository } from "../src/lib/db";
import { InMemoryRepository } from "../src/lib/db/inMemoryRepository";
import { seedProphets } from "../src/lib/f1/seedProphets";
import { runReflectionCycle } from "../src/lib/reflection/reflect";

describe("F5 reflection cycle", () => {
  it("runs all ideologies and persists doctrine_change when pressure exists", async () => {
    const repository = new InMemoryRepository();
    setRepository(repository);

    const seeded = await seedProphets();
    const target = seeded.ideologies[0];

    repository.feedbacks.push(
      { ideologyId: target.id, userId: "u1", text: "bad doctrine drift", timestamp: new Date().toISOString() },
      { ideologyId: target.id, userId: "u2", text: "disagree with this", timestamp: new Date().toISOString() },
      { ideologyId: target.id, userId: "u3", text: "wrong direction", timestamp: new Date().toISOString() },
    );

    const results = await runReflectionCycle();

    expect(results).toHaveLength(3);
    expect(results.some((item) => item.changed)).toBe(true);

    const ideologyAfter = repository.ideologies.get(target.id);
    expect(ideologyAfter).toBeTruthy();
    expect((ideologyAfter?.doctrineVersion ?? 0) >= 1).toBe(true);

    const changeEvents = repository.events.filter((event) => event.type === "doctrine_change");
    expect(changeEvents.length).toBeGreaterThanOrEqual(1);
  });
});
