import { DOMAIN_WEIGHTS, SYNERGY_THRESHOLDS, OVERALL_SCORE_BANDS } from './compatibility_config';
import type { GZProfile } from './types';
import {
  OVERRIDES,
  ROUTINES,
  SCENARIO_TEXT,
  type OverrideItem,
  type RoutineItem,
} from './prescriptions';
import { DOMAIN_LABELS } from './compatibilityReportCopy';

const DOMAIN_ORDER = ['O', 'C', 'E', 'A', 'N'] as const;

const ARCHETYPE_PAIRS: Record<string, string> = {
  'architect|catalyst':
    "Architect builds the frame; Catalyst breaks stillness and forces motion. Powerful when Catalyst feeds raw energy into Architect's plan — friction when both try to own timing.",
  'architect|diplomat':
    'Architect drafts structure; Diplomat smooths the human seams. Decisions stick when Architect invites consultation and Diplomat names hard trade-offs.',
  'architect|rebel':
    'Rebel breaks the pattern; Architect builds the new one. Powerful when sequenced — friction when both act at once.',
  'architect|visionary':
    "Visionary pulls toward the far horizon; Architect engineers the path. Best when Visionary holds the why and Architect owns the how — clash when either dismisses the other's layer.",
  'architect|guardian':
    'Guardian shields the formation; Architect reinforces the scaffolding. Strong on reliability — watch for over-control when both default to protection.',
  'architect|sovereign':
    'Sovereign drives pace and authority; Architect systematises execution. Fast alignment when roles are explicit — tension when two command styles compete.',
  'catalyst|diplomat':
    'Catalyst sparks motion; Diplomat calms turbulence. The pairing works when speed includes consent — risk when spark reads as chaos to the smoother.',
  'catalyst|vessel':
    'Catalyst ignites; Vessel refines tempo. Complementary when Vessel channels heat into craft — friction when pace feels reckless versus stifling.',
  'catalyst|rebel':
    'Two disruptors — high voltage. Thrilling for innovation; exhausting if neither owns cleanup or follow-through.',
  'diplomat|rebel':
    'Rebel challenges consensus; Diplomat preserves connection. Healthy when Rebel names what Diplomat avoids — corrosive if Rebel equates harmony with weakness.',
  'diplomat|sovereign':
    'Sovereign brings decisive authority; Diplomat brings consensus and care. Decisions can happen fast — if Sovereign learns to consult, and Diplomat learns to say no.',
  'diplomat|partner':
    'Partner stabilises the lane; Diplomat tends the emotional air. Warm and loyal — define boundaries so neither over-merges.',
  'guardian|rebel':
    'Guardian holds the line; Rebel tests every fence. Protective chemistry — stalemate if Guardian reads every probe as threat.',
  'guardian|sentinel':
    "Sentinel watches the edge; Guardian shields the flock. Double vigilance — excellent for risk-heavy contexts; add lightness so vigilance doesn't become suspicion.",
  'navigator|seeker':
    'Navigator adjusts course in real time; Seeker drills toward truth. Strong for complex problems — align on when to optimise versus when to interrogate.',
  'navigator|visionary':
    "Navigator steers through change; Visionary sets the distant star. Powerful when Visionary trusts Navigator's course corrections.",
  'partner|provider':
    'Partner keeps wing-to-wing loyalty; Provider lifts the load. Deep mutual care — watch for silent over-giving and unspoken scorekeeping.',
  'partner|sovereign':
    "Sovereign leads outward; Partner stabilises inward. Clear roles shine — conflict if Sovereign's pace feels like neglect to Partner.",
  'rebel|sovereign':
    'Rebel resists hierarchy; Sovereign embodies it. Magnetic tension — sustainable with explicit autonomy zones for Rebel and clear domains for Sovereign.',
  'rebel|visionary':
    'Both refuse the default — Rebel breaks, Visionary invents. Electric for change; add one grounded voice for maintenance.',
  'seeker|visionary':
    'Seeker uncovers what is hidden; Visionary imagines what is not yet. Synergy in innovation — slow down for implementation details.',
  'sentinel|spotlight':
    'Sentinel holds the perimeter; Spotlight pulls the centre. Balance of safety and visibility — friction if Spotlight reads Sentinel as cagey.',
  'spotlight|vessel':
    'Spotlight energises the room; Vessel polishes delivery. Charisma plus grace — watch for competition for narrative versus presence.',
  'architect|navigator':
    'Navigator adapts live; Architect locks structure. Great for complex projects when Navigator owns pivots and Architect owns specs.',
  'catalyst|spotlight':
    "Two amplifiers — energy multiplies. Fun and mobilising; add rest contracts so intensity doesn't become burnout.",
  'diplomat|seeker':
    "Seeker probes uncomfortable truths; Diplomat softens edges. Insightful when Seeker trusts Diplomat's care — risky if truth feels buried.",
  'guardian|partner':
    "Double loyalty — protective and bonded. Exceptional cohesion; name independence needs so protection doesn't feel like surveillance.",
  'provider|sentinel':
    'Provider carries weight; Sentinel watches threats. Strong in crisis — both may forget to rest; schedule recovery explicitly.',
  'rebel|sentinel':
    'Rebel tests every rule; Sentinel enforces the watch. Productive tension for ethics — toxic if framed as betrayal versus duty.',
  'sovereign|visionary':
    'Visionary supplies direction; Sovereign supplies drive. High ceiling when aligned — power struggle if both claim the crown.',
};

export function calculateDomainCompatScore(aRaw: number, bRaw: number): number {
  const score = 100 - (Math.abs(aRaw - bRaw) / 4) * 100;
  return Math.max(0, Math.min(100, score));
}

export function getSynergyLabel(delta: number, domain: string): string {
  const absDelta = Math.abs(delta);
  if (domain === 'N' && absDelta >= 0.8 && absDelta <= 1.2) return 'Watch';
  if (absDelta <= SYNERGY_THRESHOLDS.align) return 'Align';
  if (absDelta <= SYNERGY_THRESHOLDS.complement) return 'Complement';
  return 'Tension';
}

function analyzeFacetPairs(a: GZProfile, b: GZProfile) {
  const HIGH = 4;
  const LOW = 2;
  const align_pairs: Array<{ facet: string; a: number; b: number }> = [];
  const conflict_pairs: Array<{ facet: string; a: number; b: number }> = [];
  const keys = new Set([...Object.keys(a.facets), ...Object.keys(b.facets)]);

  for (const facetKey of keys) {
    const aScore = a.facets[facetKey];
    const bScore = b.facets[facetKey];
    if (aScore === undefined || bScore === undefined) continue;
    const aHigh = aScore >= HIGH;
    const bHigh = bScore >= HIGH;
    const aLow = aScore <= LOW;
    const bLow = bScore <= LOW;
    if ((aHigh && bHigh) || (aLow && bLow)) {
      align_pairs.push({ facet: facetKey, a: aScore, b: bScore });
    } else if ((aHigh && bLow) || (aLow && bHigh)) {
      conflict_pairs.push({ facet: facetKey, a: aScore, b: bScore });
    }
  }

  align_pairs.sort((x, y) => Math.min(y.a, y.b) - Math.min(x.a, x.b));
  conflict_pairs.sort((x, y) => Math.abs(y.a - y.b) - Math.abs(x.a - x.b));

  return { align_pairs, conflict_pairs, top_levers: [] as string[] };
}

function calculateOverallScore(domainEntries: Record<string, { score_pct: number }>) {
  let weightedSum = 0;
  let totalWeight = 0;
  for (const [domain, entry] of Object.entries(domainEntries)) {
    const w = (DOMAIN_WEIGHTS as Record<string, number>)[domain] || 1;
    weightedSum += entry.score_pct * w;
    totalWeight += w;
  }
  const score = Math.round(weightedSum / totalWeight);
  let band = 'Caution';
  if (score >= OVERALL_SCORE_BANDS.strong) band = 'Strong';
  else if (score >= OVERALL_SCORE_BANDS.moderate) band = 'Moderate';
  return { score, band };
}

function buildRationale(domainEntries: Record<string, { score_pct: number; synergy: string }>) {
  const rationale: string[] = [];
  const sorted = Object.entries(domainEntries).sort((a, b) => b[1].score_pct - a[1].score_pct);
  const alignments = sorted.filter(([, v]) => v.synergy === 'Align' || v.synergy === 'Complement').slice(0, 2);
  for (const [domain, value] of alignments) {
    const label = DOMAIN_LABELS[domain] || domain;
    if (value.synergy === 'Align') rationale.push(`High ${label} alignment`);
    if (value.synergy === 'Complement') rationale.push(`Complementary ${label}`);
  }
  const topTension = [...sorted].reverse().find(([, v]) => v.synergy === 'Tension');
  const topWatch = sorted.find(([, v]) => v.synergy === 'Watch');
  if (topTension) {
    rationale.push(`Manage ${DOMAIN_LABELS[topTension[0]] || topTension[0]} mismatch`);
  } else if (topWatch) {
    rationale.push(`Watch ${DOMAIN_LABELS[topWatch[0]] || topWatch[0]} reactivity gap`);
  }
  return rationale;
}

function buildNarrative(compat: {
  overall: { score_pct: number; band: string };
  domains: Record<string, { score_pct: number; synergy: string }>;
  facets: { conflict_pairs: Array<{ facet: string }> };
}) {
  const strongest = Object.entries(compat.domains).sort((a, b) => b[1].score_pct - a[1].score_pct)[0];
  const strongestLabel = DOMAIN_LABELS[strongest?.[0] || ''] || 'core traits';
  const topTension = Object.entries(compat.domains)
    .filter(([, v]) => v.synergy === 'Tension')
    .sort((a, b) => a[1].score_pct - b[1].score_pct)[0];
  const watchDomain = Object.entries(compat.domains).find(([, v]) => v.synergy === 'Watch');

  const intro =
    compat.overall.band === 'Strong'
      ? `Your profiles show a strong natural alignment — ${compat.overall.score_pct}% overall — with the deepest bond rooted in shared ${strongestLabel}.`
      : compat.overall.band === 'Moderate'
        ? `Your profiles show moderate compatibility at ${compat.overall.score_pct}%, with meaningful common ground in ${strongestLabel} and clear room to grow through intentional communication.`
        : `Your profiles show ${compat.overall.score_pct}% overall compatibility. Real differences exist, and — named and managed — they can become complementary rather than corrosive.`;

  let tensionLine = ' With no major tension domains, your primary work is sustaining depth rather than managing conflict.';
  if (topTension) {
    const tl = DOMAIN_LABELS[topTension[0]] || topTension[0];
    tensionLine = ` The primary friction zone is ${tl} — your instincts here pull in opposite directions, and that gap is where the most deliberate investment lives.`;
  } else if (watchDomain) {
    const wl = DOMAIN_LABELS[watchDomain[0]] || 'emotional reactivity';
    tensionLine = ` Watch the ${wl} axis: the gap is small enough to bridge but wide enough to amplify under stress.`;
  }

  const facetLine = compat.facets.conflict_pairs.length
    ? ` At the trait level, ${compat.facets.conflict_pairs[0].facet.split(':')[1].toLowerCase()} shows the starkest contrast — one of you scores strongly high, the other strongly low — and this single gap shapes your day-to-day interaction patterns most visibly.`
    : ' At the trait level, no stark opposites were found; you operate from similar intensities across the board.';

  return intro + tensionLine + facetLine;
}

function generatePrescriptions(compat: {
  domains: Record<string, { synergy: string }>;
  facets: { conflict_pairs: Array<{ facet: string }> };
}) {
  const overrideSet = new Map<string, OverrideItem>();
  const routineSet = new Map<string, RoutineItem>();
  const work = new Set<string>();
  const relationship = new Set<string>();
  const d = compat.domains;
  const conflicts = compat.facets.conflict_pairs;

  const addOverride = (o: OverrideItem) => overrideSet.set(o.id, o);
  const addRoutine = (r: RoutineItem) => routineSet.set(r.name, r);

  if (d.E?.synergy === 'Tension') {
    addOverride(OVERRIDES.ENERGY_CONTRACT);
    addRoutine(ROUTINES.RECHARGE_CALENDAR);
    addRoutine(ROUTINES.ASYNC_FIRST);
    relationship.add(SCENARIO_TEXT.SC_PACE);
  }
  const n = d.N?.synergy;
  if (n === 'Tension' || n === 'Watch') {
    addOverride(OVERRIDES.STRESS_RESET);
    addOverride(OVERRIDES.EMOTION_BRIDGE);
    relationship.add(SCENARIO_TEXT.SC_STRESS);
  }
  if (d.C?.synergy === 'Tension') {
    addRoutine(ROUTINES.CADENCE_CONTRACT);
    addRoutine(ROUTINES.DECISION_SLA);
    addRoutine(ROUTINES.PLAN_SWAP);
    work.add(SCENARIO_TEXT.SC_DEADLINE);
    work.add(SCENARIO_TEXT.SC_MONEY);
  }
  if (d.A?.synergy === 'Tension') {
    addOverride(OVERRIDES.CONFLICT_PROTOCOL);
    relationship.add(SCENARIO_TEXT.SC_CONFLICT);
    relationship.add(SCENARIO_TEXT.SC_TRUST);
  }
  if (d.O?.synergy === 'Tension') {
    addOverride(OVERRIDES.NOVELTY_DIAL);
    addRoutine(ROUTINES.CREATIVE_BLOCK);
    relationship.add(SCENARIO_TEXT.SC_CHANGE);
  }

  if (conflicts.some((p) => p.facet.endsWith(':Modesty'))) addOverride(OVERRIDES.CONFLICT_PROTOCOL);
  if (conflicts.some((p) => p.facet.endsWith(':Trust'))) addOverride(OVERRIDES.TRUST_VERIFY);
  if (conflicts.some((p) => p.facet.endsWith(':Cooperation'))) addRoutine(ROUTINES.DECISION_SLA);
  if (conflicts.some((p) => p.facet.endsWith(':Assertiveness'))) addOverride(OVERRIDES.BOUNDARY_PROTOCOL);
  if (conflicts.some((p) => p.facet.endsWith(':Anxiety') || p.facet.endsWith(':Vulnerability'))) {
    addOverride(OVERRIDES.EMOTION_BRIDGE);
    relationship.add(SCENARIO_TEXT.SC_STRESS);
  }

  return {
    overrides: Array.from(overrideSet.values()),
    routines: Array.from(routineSet.values()),
    scenarios: {
      work: Array.from(work),
      relationship: Array.from(relationship),
    },
  };
}

function buildArchetypePairing(a: GZProfile, b: GZProfile): string {
  const sorted = [a.archetype.id.toLowerCase(), b.archetype.id.toLowerCase()].sort();
  const key = `${sorted[0]}|${sorted[1]}`;
  if (ARCHETYPE_PAIRS[key]) return ARCHETYPE_PAIRS[key];
  const title = (id: string) => id.charAt(0).toUpperCase() + id.slice(1);
  return `${title(sorted[0])} and ${title(sorted[1])} bring different instincts into the same relationship. Name the gap early — when each leads with their default move, the other may read it as pressure or withdrawal. Intention beats assumption.`;
}

export function computeCompatibility(a: GZProfile, b: GZProfile) {
  const domains: Record<string, any> = {};
  const domainScores: Record<string, { score_pct: number }> = {};

  for (const domain of DOMAIN_ORDER) {
    const aDomain = a.domains[domain as keyof typeof a.domains];
    const bDomain = b.domains[domain as keyof typeof b.domains];
    if (!aDomain || !bDomain) continue;
    const delta = bDomain.raw - aDomain.raw;
    const score_pct = calculateDomainCompatScore(aDomain.raw, bDomain.raw);
    const synergy = getSynergyLabel(delta, domain);
    domains[domain] = { a_raw: aDomain.raw, b_raw: bDomain.raw, delta, synergy, score_pct, notes: [] };
    domainScores[domain] = { score_pct };
  }

  const overallCalc = calculateOverallScore(domainScores);
  const facets = analyzeFacetPairs(a, b);
  const compat = {
    overall: {
      score_pct: overallCalc.score,
      band: overallCalc.band,
      rationale: buildRationale(domains),
    },
    domains,
    facets,
  };

  return {
    compat,
    prescriptions: generatePrescriptions(compat),
    narrative: buildNarrative(compat),
    archetypePairing: buildArchetypePairing(a, b),
  };
}

export function buildPairNarrative(meansA: Record<string, number>, meansB: Record<string, number>, notes: string[]) {
  const narratives: string[] = [];
  for (const domain of DOMAIN_ORDER) {
    const aScore = meansA[domain];
    const bScore = meansB[domain];
    if (aScore !== undefined && bScore !== undefined && Math.abs(aScore - bScore) > 1.5) {
      narratives.push(`${domain} shows significant difference (${aScore.toFixed(1)} vs ${bScore.toFixed(1)})`);
    }
  }
  if (notes?.length) narratives.push(...notes.slice(0, 2));
  return narratives.length ? `${narratives.join('. ')}.` : '';
}
