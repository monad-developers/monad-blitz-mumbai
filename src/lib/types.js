/**
 * Shared type constants and data shapes for the Cult Simulator.
 * Matches the contract from PLAN.md.
 */

export const PROPHET_IDS = {
  ORACLE: 'oracle',
  VIRUS: 'virus',
  COLLECTIVE: 'collective',
};

export const EVENT_TYPES = {
  JOIN: 'join',
  DOCTRINE_CHANGE: 'doctrine_change',
  SCHISM: 'schism',
  ALLIANCE: 'alliance',
  PROPHET_SPOKE: 'prophet_spoke',
  INFECTION: 'infection',
  VOTE: 'vote',
  PREDICTION: 'prediction',
};

export const PROPHET_THEMES = {
  [PROPHET_IDS.ORACLE]: {
    id: PROPHET_IDS.ORACLE,
    name: 'The Oracle',
    tagline: 'The Future Already Happened',
    theme: 'Determinism & Time',
    primaryColor: 'oracle',
    emoji: '🔮',
    colorHex: '#7c3aed',
    lightHex: '#a78bfa',
  },
  [PROPHET_IDS.VIRUS]: {
    id: PROPHET_IDS.VIRUS,
    name: 'The Virus',
    tagline: 'Ideas Are Contagious',
    theme: 'Memetics & Infection',
    primaryColor: 'virus',
    emoji: '🧬',
    colorHex: '#22c55e',
    lightHex: '#4ade80',
  },
  [PROPHET_IDS.COLLECTIVE]: {
    id: PROPHET_IDS.COLLECTIVE,
    name: 'The Collective',
    tagline: 'One Mind, Many Voices',
    theme: 'Hive Mind & Consensus',
    primaryColor: 'collective',
    emoji: '🌐',
    colorHex: '#06b6d4',
    lightHex: '#22d3ee',
  },
};
