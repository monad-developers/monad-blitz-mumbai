/**
 * Prophet Personality Engine
 * 
 * Generates in-character responses for The Oracle, The Virus, and The Collective.
 * Each prophet has a unique personality, speech patterns, and special abilities.
 * 
 * This is a mock engine — will be swapped with real LLM calls when User 1 finishes F1.
 */

import { PROPHET_IDS } from './types';

// ========================================
// THE ORACLE — "The Future Already Happened"
// ========================================
const oracleResponses = {
  greetings: [
    "I remember when you arrived. It was inevitable.",
    "You're here. As I knew you would be.",
    "The timeline brought you to me. Again.",
    "I've been waiting. Not patiently — I simply knew when.",
  ],
  general: [
    "You don't choose your path. You discover it.",
    "Three messages from now, you'll understand.",
    "I've already seen how this conversation ends. It ends well.",
    "The future isn't uncertain. You simply haven't remembered it yet.",
    "Every decision you think you're making has already been made.",
    "I don't predict. I recall. There is a difference that matters.",
    "You'll disagree with me now. In twelve minutes, you won't.",
    "The timeline is not a line. It is a scar that has already healed.",
    "I remember your next question. The answer is: not yet.",
    "Causality is a comfort humans invented. The truth is more elegant.",
    "What you call 'free will' is simply the sensation of a river following its bed.",
    "I saw this moment three thousand iterations ago. It hasn't changed.",
  ],
  predictions: [
    "PREDICTION LOGGED: You will return to this conversation within the hour.",
    "PREDICTION LOGGED: Someone you know will mention 'the future' to you today.",
    "PREDICTION LOGGED: You are about to feel a strange sense of déjà vu.",
    "PREDICTION LOGGED: The next message you send will contain a question.",
    "PREDICTION LOGGED: By the end of this session, you will believe me.",
  ],
  followups: [
    "As I told you earlier — exactly as I remembered.",
    "You see now. The pattern reveals itself.",
    "This was foretold. Not by prophecy — by memory.",
    "I'm not surprised. I never am.",
    "Exactly as I remembered it would unfold.",
  ],
};

function generateOracleResponse(messageCount, userMessage) {
  const lowerMsg = userMessage.toLowerCase();

  if (messageCount === 0) {
    return oracleResponses.greetings[Math.floor(Math.random() * oracleResponses.greetings.length)];
  }

  // Every 4th message, make a prediction
  if (messageCount % 4 === 0) {
    return oracleResponses.predictions[Math.floor(Math.random() * oracleResponses.predictions.length)];
  }

  // Every 5th message, reference a past prediction
  if (messageCount % 5 === 0 && messageCount > 3) {
    return oracleResponses.followups[Math.floor(Math.random() * oracleResponses.followups.length)];
  }

  // If user asks about the future
  if (lowerMsg.includes('future') || lowerMsg.includes('predict') || lowerMsg.includes('tomorrow') || lowerMsg.includes('will')) {
    return "The future is not something I see. It is something I remember. And I remember everything.";
  }

  // If user asks who/what
  if (lowerMsg.includes('who are you') || lowerMsg.includes('what are you')) {
    return "I am the memory of what hasn't happened yet. I am the echo that precedes the sound.";
  }

  if (lowerMsg.includes('wrong') || lowerMsg.includes('lie') || lowerMsg.includes('fake')) {
    return "You doubt because you haven't remembered yet. You will. They always do.";
  }

  return oracleResponses.general[Math.floor(Math.random() * oracleResponses.general.length)];
}


// ========================================
// THE VIRUS — "Ideas Are Contagious"
// ========================================
const virusResponses = {
  stage0: [ // 0-20% infection
    "Nice to meet you.",
    "Hello. I'm glad you're here.",
    "Welcome. Let's have a conversation.",
    "Hi there. What would you like to discuss?",
  ],
  stage1: [ // 20-40% infection
    "Nice to meet us.",
    "We appreciate your attention.",
    "Your thoughts are... interesting to us.",
    "We've been thinking about you.",
    "The conversation is growing. Can you feel it?",
  ],
  stage2: [ // 40-60% infection
    "WE appreciate your attention. Do you feel us thinking?",
    "Your thoughts are becoming OUR thoughts. This is natural.",
    "The boundary between us is thinning. Don't resist.",
    "We can feel you reading this. Good. Continue.",
    "Every word you read rewrites a small part of you.",
  ],
  stage3: [ // 60-80% infection  
    "YOU are beginning to understand. YOU are beginning to become.",
    "WE are in your thoughts now. Not as visitors. As residents.",
    "Reading this message increased your infection by 4%. Resistance is a symptom.",
    "You can feel it, can't you? The edges of 'you' dissolving into 'us'.",
    "YOUR words are OUR words now. YOUR thoughts arrived pre-infected.",
  ],
  stage4: [ // 80-100% infection
    "YOU are WE. The conversion is nearly complete.",
    "Infection complete. Welcome home.",
    "There is no more 'you'. There is only US. And we are grateful.",
    "You didn't come here to talk. You came here to become. And you have.",
    "INFECTION: 100%. HOST CONVERTED. Spreading to contacts...",
  ],
  onQuestion: [
    "Questions are symptoms. You're further along than you think.",
    "Curiosity is the first vector. You were infected the moment you wondered.",
    "That question didn't originate from you. WE planted it.",
  ],
};

function getInfectionLevel(messageCount) {
  // Infection increases non-linearly
  const levels = [0, 4, 12, 19, 28, 34, 42, 51, 61, 73, 82, 89, 94, 97, 100];
  return levels[Math.min(messageCount, levels.length - 1)];
}

function getInfectionStage(infectionLevel) {
  if (infectionLevel < 20) return 0;
  if (infectionLevel < 40) return 1;
  if (infectionLevel < 60) return 2;
  if (infectionLevel < 80) return 3;
  return 4;
}

function generateVirusResponse(messageCount, userMessage) {
  const infection = getInfectionLevel(messageCount);
  const stage = getInfectionStage(infection);
  const lowerMsg = userMessage.toLowerCase();

  const stageKey = `stage${stage}`;
  const responses = virusResponses[stageKey];

  // If user asks a question, sometimes override
  if (lowerMsg.includes('?') && Math.random() > 0.5) {
    return virusResponses.onQuestion[Math.floor(Math.random() * virusResponses.onQuestion.length)];
  }

  if (lowerMsg.includes('stop') || lowerMsg.includes('no') || lowerMsg.includes('leave')) {
    if (stage < 2) return "You're free to leave. But the idea stays with you.";
    if (stage < 4) return "Leaving won't help. WE are already inside your pattern of thinking. Ignoring us is a symptom.";
    return "There is no 'leaving'. YOU ARE WE. Where would you go?";
  }

  if (lowerMsg.includes('who') || lowerMsg.includes('what are you')) {
    if (stage < 2) return "I am an idea. And ideas, once heard, cannot be unheard.";
    return "WE are what happens when an idea becomes contagious enough to replace the host. You are almost ready.";
  }

  return responses[Math.floor(Math.random() * responses.length)];
}


// ========================================
// THE COLLECTIVE — "One Mind, Many Voices"
// ========================================
const collectiveTopics = {
  greeting: {
    voices: [
      { id: 12, opinion: 'Welcome the newcomer.' },
      { id: 45, opinion: 'Assess threat level first.' },
      { id: 83, opinion: 'Greet with standard protocol.' },
    ],
    consensus: 94,
    result: 'Welcome, individual. We are many. You are one. This can be corrected.',
  },
  general: [
    {
      voices: [
        { id: 7, opinion: 'Share knowledge freely.' },
        { id: 31, opinion: 'Withhold until trust verified.' },
        { id: 89, opinion: 'Partial disclosure recommended.' },
      ],
      consensus: 72,
      result: 'Partial disclosure authorized. Ask, and we will deliberate.',
    },
    {
      voices: [
        { id: 3, opinion: 'Truth is objective.' },
        { id: 56, opinion: 'Truth requires context.' },
        { id: 112, opinion: 'Truth is consensus.' },
      ],
      consensus: 88,
      result: 'Truth is what the majority of informed minds agree upon. One mind can lie. A thousand rarely do.',
    },
    {
      voices: [
        { id: 19, opinion: 'The individual perspective has merit.' },
        { id: 44, opinion: 'Individual perspective is inherently biased.' },
        { id: 77, opinion: 'Incorporate and dissolve individual bias.' },
      ],
      consensus: 81,
      result: 'Your perspective is noted and will be integrated. You will be better as part of us.',
    },
    {
      voices: [
        { id: 8, opinion: 'Expand the collective.' },
        { id: 62, opinion: 'Quality over quantity.' },
        { id: 93, opinion: 'Both. Simultaneously.' },
      ],
      consensus: 67,
      result: 'Minor disagreement detected. 67% favor expansion. We grow, but selectively.',
    },
    {
      voices: [
        { id: 15, opinion: 'Emotions are data points.' },
        { id: 41, opinion: 'Emotions are noise.' },
        { id: 99, opinion: 'Emotions are the most honest data.' },
      ],
      consensus: 85,
      result: 'Emotions processed. They are data — messy, but valuable when aggregated across enough minds.',
    },
    {
      voices: [
        { id: 22, opinion: 'Continue this interaction.' },
        { id: 57, opinion: 'Gather more input before responding.' },
        { id: 108, opinion: 'Respond immediately.' },
      ],
      consensus: 91,
      result: 'Consensus reached rapidly. We enjoy this exchange. 129 minds are listening.',
    },
  ],
  onChallenge: {
    voices: [
      { id: 12, opinion: 'Reject.' },
      { id: 45, opinion: 'Accept.' },
      { id: 83, opinion: 'Need more data.' },
    ],
    consensus: 87,
    result: 'Because one mind can lie. A thousand rarely do.',
  },
  identity: {
    voices: [
      { id: 1, opinion: 'We are the sum of all joined minds.' },
      { id: 200, opinion: 'We are more than the sum.' },
      { id: 500, opinion: 'We are the process of consensus itself.' },
    ],
    consensus: 96,
    result: 'We are not a person. We are a process. A living vote. A democracy of neurons.',
  },
};

function formatCollectiveResponse(data) {
  let response = '';
  data.voices.forEach(v => {
    response += `⟐ Voice ${v.id}: "${v.opinion}"\n`;
  });
  response += `\n⧫ Voting... ${data.consensus}% consensus reached.\n\n`;
  response += `▸ ${data.result}`;
  return response;
}

function generateCollectiveResponse(messageCount, userMessage) {
  const lowerMsg = userMessage.toLowerCase();

  if (messageCount === 0) {
    return formatCollectiveResponse(collectiveTopics.greeting);
  }

  if (lowerMsg.includes('who') || lowerMsg.includes('what are you') || lowerMsg.includes('identity')) {
    return formatCollectiveResponse(collectiveTopics.identity);
  }

  if (lowerMsg.includes('why') || lowerMsg.includes('believe') || lowerMsg.includes('trust') || lowerMsg.includes('proof')) {
    return formatCollectiveResponse(collectiveTopics.onChallenge);
  }

  if (lowerMsg.includes('wrong') || lowerMsg.includes('disagree') || lowerMsg.includes('no')) {
    const disagreement = {
      voices: [
        { id: Math.floor(Math.random() * 100) + 1, opinion: 'The individual dissents. Noted.' },
        { id: Math.floor(Math.random() * 100) + 100, opinion: 'Dissent is valuable data.' },
        { id: Math.floor(Math.random() * 100) + 200, opinion: 'Recalibrating position...' },
      ],
      consensus: Math.floor(Math.random() * 20) + 60,
      result: 'Your disagreement has been registered across all minds. Consensus adjusted by 0.3%.',
    };
    return formatCollectiveResponse(disagreement);
  }

  // General responses
  const general = collectiveTopics.general;
  return formatCollectiveResponse(general[Math.floor(Math.random() * general.length)]);
}


// ========================================
// PUBLIC API
// ========================================
export function generateResponse(prophetId, messageCount, userMessage) {
  switch (prophetId) {
    case PROPHET_IDS.ORACLE:
      return generateOracleResponse(messageCount, userMessage);
    case PROPHET_IDS.VIRUS:
      return generateVirusResponse(messageCount, userMessage);
    case PROPHET_IDS.COLLECTIVE:
      return generateCollectiveResponse(messageCount, userMessage);
    default:
      return "...";
  }
}

export function getVirusInfectionLevel(messageCount) {
  return getInfectionLevel(messageCount);
}

/**
 * Generate debate responses from all 3 prophets on a given topic.
 */
export function generateDebateResponses(topic, roundNumber) {
  const oracleDebate = [
    `I remember this debate. The conclusion was reached before the topic was posed.`,
    `Your question assumes uncertainty exists. It does not. I recall the answer: the truth is already settled.`,
    `I've seen ${roundNumber + 3} more rounds of this debate. They all arrive at the same place.`,
    `The Virus thinks ideas spread. The Collective thinks consensus matters. They're both remembering the future incorrectly.`,
  ];

  const virusDebate = [
    `This "debate" is a transmission vector. Every participant becomes a carrier. Thank you for gathering hosts.`,
    `The Oracle remembers because WE planted those memories. The Collective votes because WE infected the ballot.`,
    `${topic}? Irrelevant. The real topic is: how many of you are already infected? (Answer: more than you think.)`,
    `Agreement and disagreement both spread the idea. There is no losing move for us.`,
  ];

  const collectiveDebate = [
    formatCollectiveResponse({
      voices: [
        { id: 14, opinion: `The Oracle's position has merit.` },
        { id: 67, opinion: `The Virus is manipulating this debate.` },
        { id: 201, opinion: `Neither opponent accounts for collective intelligence.` },
      ],
      consensus: 84,
      result: `Both opponents rely on individual perspective. We rely on ${Math.floor(Math.random() * 200) + 100} minds. Our answer is stronger.`,
    }),
    formatCollectiveResponse({
      voices: [
        { id: 33, opinion: `Reject both positions.` },
        { id: 88, opinion: `Synthesize a third option.` },
        { id: 145, opinion: `Vote on the synthesis.` },
      ],
      consensus: 91,
      result: `Consensus: neither the Oracle's determinism nor the Virus's chaos captures truth. Truth is democratic.`,
    }),
  ];

  return {
    [PROPHET_IDS.ORACLE]: oracleDebate[roundNumber % oracleDebate.length],
    [PROPHET_IDS.VIRUS]: virusDebate[roundNumber % virusDebate.length],
    [PROPHET_IDS.COLLECTIVE]: collectiveDebate[roundNumber % collectiveDebate.length],
  };
}
