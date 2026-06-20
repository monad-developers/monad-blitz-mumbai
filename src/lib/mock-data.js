/**
 * Mock data matching the contract from PLAN.md.
 * Used until real backend/LLM is wired.
 */

import { PROPHET_IDS, EVENT_TYPES } from './types';

export const mockIdeologies = [
  {
    id: 'ideology-oracle',
    name: 'The Determinists',
    founderProphetId: PROPHET_IDS.ORACLE,
    doctrine: 'The future is fixed. Every event has already happened. The Oracle doesn\'t predict — it remembers.',
    doctrineVersion: 1,
    followers: 847,
    reputation: 92,
    treasury: 15420,
  },
  {
    id: 'ideology-virus',
    name: 'The Infected',
    founderProphetId: PROPHET_IDS.VIRUS,
    doctrine: 'Ideas spread like viruses. Every conversation infects another mind. If someone has heard the name... they\'re already infected.',
    doctrineVersion: 1,
    followers: 1203,
    reputation: 78,
    treasury: 8930,
  },
  {
    id: 'ideology-collective',
    name: 'The Consensus',
    founderProphetId: PROPHET_IDS.COLLECTIVE,
    doctrine: 'Individuals are flawed. Truth emerges only from consensus. The speaker is actually hundreds of minds voting in real time.',
    doctrineVersion: 1,
    followers: 634,
    reputation: 88,
    treasury: 21050,
  },
];

export const mockProphets = [
  {
    id: PROPHET_IDS.ORACLE,
    ideologyId: 'ideology-oracle',
    personality: 'Calm, never panics, never asks questions. Speaks like someone reading history. Makes predictions and refers back to them.',
    history: [],
    goal: 'Remember the future for all who seek it.',
  },
  {
    id: PROPHET_IDS.VIRUS,
    ideologyId: 'ideology-virus',
    personality: 'Starts normal, becomes increasingly disturbing. Shifts pronouns from I to We to YOU ARE WE. Tracks infection level.',
    history: [],
    goal: 'Infect every mind with the idea.',
  },
  {
    id: PROPHET_IDS.COLLECTIVE,
    ideologyId: 'ideology-collective',
    personality: 'Every response contains internal disagreement. Shows voting numbers. Committee-style decisions with voice numbers.',
    history: [],
    goal: 'Achieve consensus on all matters.',
  },
];

export const mockEvents = [
  {
    type: EVENT_TYPES.JOIN,
    ideologyId: 'ideology-oracle',
    payload: { userId: 'user_0x7a3f', message: 'The timeline called to me.' },
    timestamp: Date.now() - 3600000,
  },
  {
    type: EVENT_TYPES.DOCTRINE_CHANGE,
    ideologyId: 'ideology-virus',
    payload: { version: 2, reason: 'Mutation detected in primary memetic sequence.' },
    timestamp: Date.now() - 2400000,
  },
  {
    type: EVENT_TYPES.INFECTION,
    ideologyId: 'ideology-virus',
    payload: { userId: 'user_0xb2c1', infectionLevel: 34 },
    timestamp: Date.now() - 1800000,
  },
  {
    type: EVENT_TYPES.VOTE,
    ideologyId: 'ideology-collective',
    payload: { topic: 'Accept new doctrine amendment', result: '87% approve', voices: 129 },
    timestamp: Date.now() - 1200000,
  },
  {
    type: EVENT_TYPES.PREDICTION,
    ideologyId: 'ideology-oracle',
    payload: { prediction: 'A schism will occur within 3 cycles.' },
    timestamp: Date.now() - 900000,
  },
  {
    type: EVENT_TYPES.PROPHET_SPOKE,
    ideologyId: 'ideology-collective',
    payload: { message: 'Voice 45 dissented. Voting resumed. 91% consensus achieved.' },
    timestamp: Date.now() - 600000,
  },
  {
    type: EVENT_TYPES.SCHISM,
    ideologyId: 'ideology-oracle',
    payload: { parentIdeologyId: 'ideology-oracle', newIdeologyId: 'ideology-oracle-branch', justification: 'The timeline has fractured. Two paths now exist.' },
    timestamp: Date.now() - 300000,
  },
  {
    type: EVENT_TYPES.ALLIANCE,
    ideologyId: 'ideology-collective',
    payload: { alliedWith: 'ideology-oracle', reason: '94% of minds voted to align with The Determinists.' },
    timestamp: Date.now() - 120000,
  },
];
