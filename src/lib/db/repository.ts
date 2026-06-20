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

export type IdeologyMetrics = {
  ideology: Ideology;
  followerGrowth: number;
  criticismTexts: string[];
  recentEvents: Event[];
};

export interface DataRepository {
  upsertIdeology(ideology: Ideology): Promise<void>;
  upsertProphet(prophet: Prophet): Promise<void>;
  insertDoctrineVersion(doctrine: Doctrine): Promise<void>;
  insertEvent(event: Event): Promise<void>;
  listIdeologies(): Promise<Ideology[]>;
  listProphetsByIdeology(ideologyId: string): Promise<Prophet[]>;
  getIdeologyMetrics(ideologyId: string): Promise<IdeologyMetrics>;
  updateIdeologyDoctrine(
    ideologyId: string,
    doctrine: string,
    doctrineVersion: number,
  ): Promise<void>;
  updateIdeologyFollowers(ideologyId: string, followers: number): Promise<void>;
  insertSchism(schism: Schism): Promise<void>;
  upsertPrediction(prediction: Prediction): Promise<void>;
  listPendingPredictions(
    prophetId: string,
    conversationId: string,
  ): Promise<Prediction[]>;
  markPredictionFulfilled(
    prophetId: string,
    conversationId: string,
    triggerKeyword: string,
  ): Promise<void>;
  getInfection(
    conversationId: string,
    prophetId: string,
  ): Promise<Infection | null>;
  upsertInfection(infection: Infection): Promise<void>;
  listFeedbackByIdeology(ideologyId: string): Promise<Feedback[]>;
}
