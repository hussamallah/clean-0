import type { GZProfile } from './types';

interface ArchetypeVitals {
  title: string;
  superpower: string;
  operation: string;
  kryptonite: string;
  drive: string;
}

const ARCHETYPE_VITALS: Record<string, ArchetypeVitals> = {
  sovereign: {
    title: "The Sovereign",
    superpower: "Commanding Order.",
    operation: "You lead with decisive authority, building systems and holding the line.",
    kryptonite: "Unpredictable people and disruptive change.",
    drive: "\"Follow the plan.\""
  },
  rebel: {
    title: "The Rebel",
    superpower: "Breaking Constraints.",
    operation: "You challenge every rule and thrive on radical, unconventional solutions.",
    kryptonite: "Rigid structures and unquestioned authority.",
    drive: "\"Why not?\""
  },
  visionary: {
    title: "The Visionary",
    superpower: "Seeing What Could Be.",
    operation: "You lead with groundbreaking ideas and thrive on the unknown.",
    kryptonite: "Practical details and immediate constraints.",
    drive: "\"What if...?\""
  },
  guardian: {
    title: "The Guardian",
    superpower: "Protecting The Mission.",
    operation: "You lead with fierce loyalty and drive momentum with unstoppable energy.",
    kryptonite: "Ambiguity and radical, untested change.",
    drive: "\"What is the plan?\""
  },
  navigator: {
    title: "The Navigator",
    superpower: "Guiding Through Chaos.",
    operation: "You thrive on exploration, adapting to new environments and leading others through uncertainty.",
    kryptonite: "Rigid plans and staying in one place for too long.",
    drive: "\"Where to next?\""
  },
  seeker: {
    title: "The Seeker",
    superpower: "Uncovering The Truth.",
    operation: "You are a master of analysis, digging deep to find the real signal in the noise.",
    kryptonite: "Surface-level answers and emotional decision-making.",
    drive: "\"What is really going on here?\""
  },
  vessel: {
    title: "The Vessel",
    superpower: "Creating Calm.",
    operation: "You provide a source of peace and stability, holding emotional space for others.",
    kryptonite: "High-conflict situations and emotional volatility.",
    drive: "\"Breathe.\""
  },
  partner: {
    title: "The Partner",
    superpower: "Unwavering Stability.",
    operation: "You are the reliable anchor, providing consistent support and keeping things on track.",
    kryptonite: "Sudden changes and inconsistent people.",
    drive: "\"Let's stick together.\""
  },
  diplomat: {
    title: "The Diplomat",
    superpower: "Building Bridges.",
    operation: "You connect with others through deep empathy, smoothing turbulence and fostering harmony.",
    kryptonite: "Blunt criticism and impersonal decisions.",
    drive: "\"How does everyone feel?\""
  },
  spotlight: {
    title: "The Spotlight",
    superpower: "Energizing The Room.",
    operation: "You are a magnetic presence, inspiring and motivating others with infectious energy and fun.",
    kryptonite: "Boring, repetitive tasks and being out of the loop.",
    drive: "\"Let's make it exciting!\""
  },
  architect: {
    title: "The Architect",
    superpower: "Designing The System.",
    operation: "You are a master of structure and order, bringing coherence to complex challenges.",
    kryptonite: "Improvisation and unpredictable, chaotic environments.",
    drive: "\"What is the optimal design?\""
  },
  provider: {
    title: "The Provider",
    superpower: "Taking Care.",
    operation: "You are the reliable backbone, ensuring everyone's needs are met with practical action.",
    kryptonite: "Selfishness and seeing others neglected.",
    drive: "\"I've got this.\""
  },
  unknown: {
    title: "The Adaptable",
    superpower: "Flexibility.",
    operation: "You are a balanced individual who can adjust to the needs of the moment.",
    kryptonite: "Lack of a clear, specialized role.",
    drive: "\"What is needed now?\""
  }
};

interface DualityNarrative {
  title: string;
  summary: string;
}

const DUALITY_NARRATIVES: Record<string, DualityNarrative> = {
  'guardian-visionary': {
    title: "The Spark & The Foundation",
    summary: "A dynamic of innovation and stability. The Visionary's job is to light the fire; the Guardian's job is to make sure it warms the camp instead of burning it down."
  },
  // ... Add more pairings
};

interface DualityPoint {
  title: string;
  narrative: string;
  playbook?: {
    a: string;
    b: string;
  }
}

interface ArchetypeInteraction {
  sync: DualityPoint;
  clash: DualityPoint;
}

const ARCHETYPE_INTERACTIONS: Record<string, ArchetypeInteraction> = {
  'guardian-visionary': {
    sync: {
      title: "Unstoppable Momentum",
      narrative: "When the Visionary's groundbreaking idea aligns with the Guardian's mission, you become an unstoppable force. The Visionary provides the 'what if,' and the Guardian provides the 'how,' creating a powerful dynamic of inspired execution."
    },
    clash: {
      title: "Innovation vs. Security",
      narrative: "The Visionary's love for radical, untested ideas will clash with the Guardian's need for stability and planning. The Visionary will feel blocked; the Guardian will feel the mission is at risk.",
      playbook: {
        a: "Your Job (Visionary): Frame your new idea as an upgrade to the existing plan, not a total replacement. Show how it makes the mission *safer*.",
        b: "Their Job (Guardian): When you feel the urge to say 'no' to a new idea, instead ask, 'What is the smallest, safest way we can test this?'"
      }
    }
  },
  // ... Add more pairings
};

interface ArchetypeComparison {
  a: ArchetypeVitals;
  b: ArchetypeVitals;
  narrative: DualityNarrative;
  interaction: ArchetypeInteraction;
}

export function compareArchetypes(profileA: GZProfile, profileB: GZProfile): ArchetypeComparison {
  const idA = profileA.archetype?.id || 'unknown';
  const idB = profileB.archetype?.id || 'unknown';
  
  const vitalsA = ARCHETYPE_VITALS[idA] || ARCHETYPE_VITALS.unknown;
  const vitalsB = ARCHETYPE_VITALS[idB] || ARCHETYPE_VITALS.unknown;

  const sortedIds = [idA, idB].sort();
  const narrativeKey = sortedIds.join('-');
  
  let narrative = DUALITY_NARRATIVES[narrativeKey] || {
    title: `${vitalsA.title} vs. ${vitalsB.title}`,
    summary: `A fascinating dynamic between one driven by ${vitalsA.drive} and another by ${vitalsB.drive}.`
  };
  const interaction = ARCHETYPE_INTERACTIONS[narrativeKey] || {
    sync: { title: "Shared Strengths", narrative: "Your archetypes find common ground in their shared approach to..." },
    clash: { title: "Potential Friction", narrative: "Tension can arise from your differing approaches to..." }
  };

  return {
    a: vitalsA,
    b: vitalsB,
    narrative,
    interaction,
  };
}
