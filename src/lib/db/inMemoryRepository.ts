import type {
  Doctrine,
  Event,
  Feedback,
  Ideology,
  Infection,
  Prediction,
  Prophet,
  Schism,
} from "../types/contracts";
import type { DataRepository, IdeologyMetrics } from "./repository";

export class InMemoryRepository implements DataRepository {
  ideologies = new Map<string, Ideology>();
  prophets = new Map<string, Prophet>();
  doctrines: Doctrine[] = [];
  events: Event[] = [];
  schisms: Schism[] = [];
  predictions: Prediction[] = [];
  infections = new Map<string, Infection>();
  feedbacks: Feedback[] = [];

  async upsertIdeology(ideology: Ideology): Promise<void> {
    this.ideologies.set(ideology.id, ideology);
  }

  async upsertProphet(prophet: Prophet): Promise<void> {
    this.prophets.set(prophet.id, prophet);
  }

  async insertDoctrineVersion(doctrine: Doctrine): Promise<void> {
    this.doctrines.push(doctrine);
  }

  async insertEvent(event: Event): Promise<void> {
    this.events.push(event);
  }

  async listIdeologies(): Promise<Ideology[]> {
    return Array.from(this.ideologies.values());
  }

  async listProphetsByIdeology(ideologyId: string): Promise<Prophet[]> {
    return Array.from(this.prophets.values()).filter(
      (prophet) => prophet.ideologyId === ideologyId,
    );
  }

  async getIdeologyMetrics(ideologyId: string): Promise<IdeologyMetrics> {
    const ideology = this.ideologies.get(ideologyId);
    if (!ideology) {
      throw new Error(`Ideology not found: ${ideologyId}`);
    }

    const criticismTexts = this.feedbacks
      .filter((feedback) => feedback.ideologyId === ideologyId)
      .map((feedback) => feedback.text);

    const recentEvents = this.events.filter((event) => event.ideologyId === ideologyId);

    return {
      ideology,
      followerGrowth: Math.max(0, Math.round(ideology.followers * 0.02)),
      criticismTexts,
      recentEvents,
    };
  }

  async updateIdeologyDoctrine(
    ideologyId: string,
    doctrine: string,
    doctrineVersion: number,
  ): Promise<void> {
    const ideology = this.ideologies.get(ideologyId);
    if (!ideology) {
      throw new Error(`Ideology not found: ${ideologyId}`);
    }

    this.ideologies.set(ideologyId, {
      ...ideology,
      doctrine,
      doctrineVersion,
    });
  }

  async updateIdeologyFollowers(
    ideologyId: string,
    followers: number,
  ): Promise<void> {
    const ideology = this.ideologies.get(ideologyId);
    if (!ideology) {
      throw new Error(`Ideology not found: ${ideologyId}`);
    }

    this.ideologies.set(ideologyId, {
      ...ideology,
      followers,
    });
  }

  async insertSchism(schism: Schism): Promise<void> {
    this.schisms.push(schism);
  }

  async upsertPrediction(prediction: Prediction): Promise<void> {
    const index = this.predictions.findIndex(
      (item) =>
        item.prophetId === prediction.prophetId &&
        item.conversationId === prediction.conversationId &&
        item.triggerKeyword === prediction.triggerKeyword,
    );

    if (index >= 0) {
      this.predictions[index] = prediction;
      return;
    }

    this.predictions.push(prediction);
  }

  async listPendingPredictions(
    prophetId: string,
    conversationId: string,
  ): Promise<Prediction[]> {
    return this.predictions.filter(
      (item) =>
        item.prophetId === prophetId &&
        item.conversationId === conversationId &&
        item.status === "pending",
    );
  }

  async markPredictionFulfilled(
    prophetId: string,
    conversationId: string,
    triggerKeyword: string,
  ): Promise<void> {
    this.predictions = this.predictions.map((item) => {
      if (
        item.prophetId === prophetId &&
        item.conversationId === conversationId &&
        item.triggerKeyword === triggerKeyword
      ) {
        return { ...item, status: "fulfilled" as const };
      }
      return item;
    });
  }

  async getInfection(
    conversationId: string,
    prophetId: string,
  ): Promise<Infection | null> {
    return this.infections.get(`${conversationId}:${prophetId}`) ?? null;
  }

  async upsertInfection(infection: Infection): Promise<void> {
    this.infections.set(`${infection.conversationId}:${infection.prophetId}`, infection);
  }

  async listFeedbackByIdeology(ideologyId: string): Promise<Feedback[]> {
    return this.feedbacks.filter((feedback) => feedback.ideologyId === ideologyId);
  }
}
