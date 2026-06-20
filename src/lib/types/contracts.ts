export type ProphetAbility = "oracle" | "virus" | "collective";

export type Ideology = {
  id: string;
  name: string;
  theme: string;
  founderProphetId: string;
  doctrine: string;
  doctrineVersion: number;
  followers: number;
  reputation: number;
  treasury: number;
};

export type Prophet = {
  id: string;
  ideologyId: string;
  personality: string;
  history: string;
  goal: string;
  specialAbility: ProphetAbility;
  erc8004TokenId: string | null;
};

export type Doctrine = {
  ideologyId: string;
  version: number;
  text: string;
  reason: string;
  timestamp: string;
};

export type Event = {
  type: "join" | "doctrine_change" | "schism" | "alliance";
  ideologyId: string;
  payload: Record<string, unknown>;
  timestamp: string;
};

export type Feedback = {
  ideologyId: string;
  userId: string;
  text: string;
  timestamp: string;
};

export type Schism = {
  parentIdeologyId: string;
  newIdeologyId: string;
  justification: string;
  timestamp: string;
};

export type Prediction = {
  prophetId: string;
  conversationId: string;
  predictionText: string;
  triggerKeyword: string;
  status: "pending" | "fulfilled";
  createdAt: string;
};

export type Infection = {
  conversationId: string;
  prophetId: string;
  level: number;
  status: "spreading" | "host_converted";
  updatedAt: string;
};

export type IdeologySpec = {
  id: string;
  name: string;
  theme: string;
  coreBelief: string;
  personality: string;
  signatureQuotes: string[];
  specialAbility: ProphetAbility;
};

export type GeneratedIdeologyContent = {
  doctrineV1: string;
  propagandaMessages: string[];
  history: string;
  goal: string;
};
