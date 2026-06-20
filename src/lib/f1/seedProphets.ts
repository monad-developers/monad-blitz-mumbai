import { ENV } from "../config/env";
import { getRepository } from "../db";
import { generateIdeology } from "../ideologies/generateIdeology";
import { IDEOLOGY_SPECS } from "../ideologies/specs";
import { mintProphetIdentity } from "../identity/erc8004";
import type { Ideology, Prophet } from "../types/contracts";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

export async function seedProphets(): Promise<{
  ideologies: Ideology[];
  prophets: Prophet[];
}> {
  const repository = getRepository();
  const createdIdeologies: Ideology[] = [];
  const createdProphets: Prophet[] = [];

  for (const spec of IDEOLOGY_SPECS) {
    const generated = await generateIdeology(spec);
    const prophetId = createId("prophet");
    const ideologyId = createId("ideology");

    const tokenUri = `${ENV.appBaseUrl}/api/prophet/${prophetId}/card?ideologyId=${ideologyId}`;
    const mint = await mintProphetIdentity({
      prophetId,
      name: spec.name,
      tokenUri,
    });

    const prophet: Prophet = {
      id: prophetId,
      ideologyId,
      personality: spec.personality,
      history: generated.history,
      goal: generated.goal,
      specialAbility: spec.specialAbility,
      erc8004TokenId: mint.tokenId,
    };

    const ideology: Ideology = {
      id: ideologyId,
      name: spec.name,
      theme: spec.theme,
      founderProphetId: prophetId,
      doctrine: generated.doctrineV1,
      doctrineVersion: 1,
      followers: 1,
      reputation: 50,
      treasury: 0,
    };

    await repository.upsertIdeology(ideology);
    await repository.upsertProphet(prophet);
    await repository.insertDoctrineVersion({
      ideologyId,
      version: 1,
      text: generated.doctrineV1,
      reason: "genesis",
      timestamp: nowIso(),
    });
    await repository.insertEvent({
      type: "join",
      ideologyId,
      payload: {
        action: "seed_created",
        propagandaMessages: generated.propagandaMessages,
        tokenId: mint.tokenId,
      },
      timestamp: nowIso(),
    });

    createdIdeologies.push(ideology);
    createdProphets.push(prophet);
  }

  return { ideologies: createdIdeologies, prophets: createdProphets };
}
