export type OverrideItem = { id: string; why: string };
export type RoutineItem = { name: string; spec: string };

export const OVERRIDES = {
  BOUNDARY_PROTOCOL: {
    id: 'Boundary Protocol',
    why: 'Run a short weekly check-in where each person names one thing they needed more space on and one thing they appreciated — keeps voice balance before imbalance accumulates.',
  },
  STRESS_RESET: {
    id: 'Stress Reset',
    why: 'Agree on a physical signal (e.g. a phrase or hand gesture) that pauses a charged conversation for 10 minutes. Decide while calm, not mid-escalation.',
  },
  NOVELTY_DIAL: {
    id: 'Novelty Dial',
    why: 'Alternate who chooses the plan: the higher-Openness person picks one month, the lower-Openness person the next. Respects both needs without constant negotiation.',
  },
  TRUST_VERIFY: {
    id: 'Trust-Verify Pact',
    why: 'When one person is skeptical and the other is trusting, agree upfront on which decisions require joint sign-off vs. independent action to avoid feeling surveilled or naive.',
  },
  CONFLICT_PROTOCOL: {
    id: 'Conflict Protocol',
    why: 'High-A vs low-A pairs need a named escalation path: (1) flag it, (2) 24 h pause, (3) structured discussion. Avoids silent resentment from the accommodator and blindsiding the assertive partner.',
  },
  ENERGY_CONTRACT: {
    id: 'Energy Contract',
    why: "Write down your social battery needs once (e.g. '2 evenings in per week'). Review monthly. Eliminates the recurring negotiation that exhausts both sides.",
  },
  EMOTION_BRIDGE: {
    id: 'Emotion Bridge',
    why: "When one partner shuts down and the other escalates, use a 3-step bridge: name the feeling, state the need, ask the same of the other. Practiced when calm so it works under stress.",
  },
} as const;

export const ROUTINES = {
  CADENCE_CONTRACT: {
    name: 'Cadence Contract',
    spec: '15-minute weekly sync — progress, blockers, what each person needs. Non-negotiable slot. Prevents misalignment from compounding.',
  },
  DECISION_SLA: {
    name: 'Decision SLA',
    spec: 'Any unresolved decision gets a 48-hour window. If no agreement, the person with higher stake decides and documents the reasoning. Stops loops.',
  },
  ASYNC_FIRST: {
    name: 'Async-First Rule',
    spec: 'Default to written updates before live discussion. Favours the lower-extraversion partner and produces clearer thinking from the higher-extraversion partner.',
  },
  RECHARGE_CALENDAR: {
    name: 'Recharge Calendar',
    spec: "Block 'solo recharge' time on a shared calendar so the introverted partner isn't over-scheduled and the extraverted partner doesn't book over it inadvertently.",
  },
  PLAN_SWAP: {
    name: 'Plan-Swap Month',
    spec: 'Alternate who sets the agenda each month. The structured partner gets predictability half the time; the spontaneous partner gets freedom the other half.',
  },
  CREATIVE_BLOCK: {
    name: 'Creative Block',
    spec: 'Dedicate one recurring slot to exploration with no output goal — a museum, a podcast, a question. Satisfies the high-Openness partner without requiring the lower-Openness partner to live in novelty.',
  },
} as const;

export const SCENARIO_TEXT = {
  SC_DEADLINE: 'Guard against missed deadlines and scope creep with clear ownership logs. The structured partner leads execution; the flexible partner handles pivots.',
  SC_PACE: 'Protect against pace fatigue by agreeing on a weekly social quota. The extraverted partner gets enough stimulation; the introverted partner avoids burnout.',
  SC_MONEY: 'Money decisions are a Conscientiousness flashpoint. Agree on a shared budget baseline with individual discretionary amounts — avoids both rigidity and irresponsibility.',
  SC_CONFLICT: "When Agreeableness gaps show up in conflict, the accommodating partner may say yes and resent it. Agree that 'let me think about it' is always a valid answer.",
  SC_STRESS: "During high-stress periods the high-Neuroticism partner needs space to process verbally; the low-Neuroticism partner needs to resist dismissing the concern. Pre-agree on what 'I need to vent' means vs. 'I need advice'.",
  SC_CHANGE: "Change and novelty hit differently: the high-Openness partner sees opportunity, the low-Openness partner sees risk. Before any major change, run a 'what stays the same' audit together.",
  SC_TRUST: 'Trust gaps surface under pressure. If one partner is skeptical about a third party (colleague, friend), name it early rather than letting it simmer.',
} as const;
