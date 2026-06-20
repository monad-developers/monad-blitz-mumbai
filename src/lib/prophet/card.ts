import { getRepository } from "../db";
import type { Prophet } from "../types/contracts";

export async function getProphetCard(prophetId: string): Promise<{
  name: string;
  doctrine: string;
  personality: string;
  specialAbility: Prophet["specialAbility"];
  endpoint: string;
}> {
  const repository = getRepository();
  const ideologies = await repository.listIdeologies();

  for (const ideology of ideologies) {
    const prophets = await repository.listProphetsByIdeology(ideology.id);
    const prophet = prophets.find((item) => item.id === prophetId);
    if (!prophet) {
      continue;
    }

    return {
      name: ideology.name,
      doctrine: ideology.doctrine,
      personality: prophet.personality,
      specialAbility: prophet.specialAbility,
      endpoint: `/api/prophet/${prophet.id}/ask`,
    };
  }

  throw new Error(`Prophet not found: ${prophetId}`);
}
