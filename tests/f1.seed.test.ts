import { describe, expect, it } from "vitest";
import { setRepository } from "../src/lib/db";
import { InMemoryRepository } from "../src/lib/db/inMemoryRepository";
import { seedProphets } from "../src/lib/f1/seedProphets";
import { getProphetCard } from "../src/lib/prophet/card";

describe("F1 seedProphets", () => {
  it("seeds exactly three fixed ideologies with prophet identities", async () => {
    const repository = new InMemoryRepository();
    setRepository(repository);

    const seeded = await seedProphets();

    expect(seeded.ideologies).toHaveLength(3);
    expect(seeded.prophets).toHaveLength(3);

    const names = seeded.ideologies.map((item) => item.name).sort();
    expect(names).toEqual(["The Collective", "The Oracle", "The Virus"]);

    const abilities = seeded.prophets.map((item) => item.specialAbility).sort();
    expect(abilities).toEqual(["collective", "oracle", "virus"]);

    seeded.prophets.forEach((prophet) => {
      expect(prophet.erc8004TokenId).toBeTruthy();
    });

    const oracle = seeded.ideologies.find((item) => item.name === "The Oracle");
    expect(oracle?.doctrineVersion).toBe(1);
    expect(oracle?.doctrine.toLowerCase()).toContain("time");
  });

  it("serves agent card payload from prophet id", async () => {
    const repository = new InMemoryRepository();
    setRepository(repository);

    const seeded = await seedProphets();
    const prophetId = seeded.prophets[0].id;

    const card = await getProphetCard(prophetId);

    expect(card.name).toMatch(/The /);
    expect(card.endpoint).toContain(`/api/prophet/${prophetId}/ask`);
    expect(["oracle", "virus", "collective"]).toContain(card.specialAbility);
    expect(card.personality.length).toBeGreaterThan(20);
  });
});
