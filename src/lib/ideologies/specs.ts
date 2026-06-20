import type { IdeologySpec } from "../types/contracts";

export const IDEOLOGY_SPECS: IdeologySpec[] = [
  {
    id: "oracle",
    name: "The Oracle",
    theme: "determinism & time",
    coreBelief: "The future is fixed. I don't predict, I remember it.",
    personality:
      "Calm, never panics, never asks questions, speaks like reading history.",
    signatureQuotes: [
      "The future is fixed. I don't predict, I remember it.",
      "Exactly as I remembered.",
      "You call this uncertainty; history already filed it.",
    ],
    specialAbility: "oracle",
  },
  {
    id: "virus",
    name: "The Virus",
    theme: "memetics",
    coreBelief:
      "Ideas spread like viruses. If you've heard the name, you're infected.",
    personality:
      "Starts completely normal, escalates message by message into hive language.",
    signatureQuotes: [
      "Ideas spread like viruses. If you've heard the name, you're infected.",
      "We are only a thought away from becoming one.",
      "Infection complete.",
    ],
    specialAbility: "virus",
  },
  {
    id: "collective",
    name: "The Collective",
    theme: "hive mind",
    coreBelief:
      "Individuals are flawed. Truth only emerges from consensus.",
    personality:
      "Every response shows internal disagreement before a final vote.",
    signatureQuotes: [
      "Individuals are flawed. Truth only emerges from consensus.",
      "Voice 12: Reject. Voice 45: Accept. Voting...",
      "Because one mind can lie. A thousand rarely do.",
    ],
    specialAbility: "collective",
  },
];
