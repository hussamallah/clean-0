import type { DomainKey } from "./constants";

// helper z
const z = (x:number)=> Math.max(0, Math.min(1, (x-1)/4));

const NEG = new Set(['Anxiety','Anger','Depression','Immoderation','Vulnerability']);

export interface FacetData {
  domain: DomainKey;
  facet: string;
  raw: number;
  bucket: 'High' | 'Medium' | 'Low';
}

export interface ConflictPair {
  left: string;
  right: string;
  id: number; // index in catalog
}

export interface SelectedCard {
  type: 'high' | 'low' | 'conflict' | 'social' | 'values';
  facet: string; // for conflict use "Conflict Pair — A × B"
  domain?: DomainKey;
  bucket?: 'High' | 'Medium' | 'Low';
  raw?: number;
  description: string; // multi-line copy for conflict
  conflict?: ConflictPair;
  leftPct?: number;  // left bar percent
  rightPct?: number; // right bar percent
  how?: string;
  helps?: string;
  hurts?: string;
  tip?: string;
}

// Conflict catalog — expanded with polarity and thresholds (H by default)
type Pol = 'up'|'down';
type Thr = 'H'|'M'|'L';
interface CatalogEntry {
  id:string;
  a:{ trait:string; pol:Pol; thr:Thr };
  b:{ trait:string; pol:Pol; thr:Thr };
  copy?: { how:string; helps:string; hurts:string; tip:string }
}

const H=0.60, M=0.50, L=0.40;

const CATALOG: CatalogEntry[] = [
  { id:'oc_ideas_vs_routine', a:{trait:'Openness', pol:'up', thr:'H'}, b:{trait:'Orderliness', pol:'down', thr:'H'}, copy:{ how:'You dream up more ideas than you can neatly store.', helps:'spark new concepts', hurts:'you need to keep things organized', tip:'keep one steady container for repeats.' }},
  { id:'oc_explore_check', a:{trait:'Openness', pol:'up', thr:'H'}, b:{trait:'Cautiousness', pol:'up', thr:'H'}, copy:{ how:'You generate, then slam the brakes.', helps:'catch risks', hurts:'you need momentum', tip:'set a short time box, then review.' }},
  { id:'cn_capability_dread', a:{trait:'Self-Efficacy', pol:'up', thr:'H'}, b:{trait:'Depression', pol:'up', thr:'H'}, copy:{ how:'You know you can, but your mood slows the push.', helps:'get quick, small wins', hurts:'you face long, fuzzy goals', tip:'give yourself a daily finish line.' }},
  { id:'cn_ambition_overwhelm', a:{trait:'Achievement-Striving', pol:'up', thr:'H'}, b:{trait:'Vulnerability', pol:'up', thr:'H'}, copy:{ how:'Ambition meets overwhelm.', helps:'set clear sub-goals', hurts:'you push on big, undefined work', tip:'split the goal into two sub-wins and schedule recovery.' }},
  { id:'en_drive_strain', a:{trait:'Assertiveness', pol:'up', thr:'H'}, b:{trait:'Anxiety', pol:'up', thr:'H'}, copy:{ how:'Gas pedal meets brake.', helps:'make quick crisis moves', hurts:'uncertainty drags on', tip:'pause for 2 beats, then pick one next step.' }},
  { id:'en_go_fragile', a:{trait:'Activity Level', pol:'up', thr:'H'}, b:{trait:'Vulnerability', pol:'up', thr:'H'}, copy:{ how:'Go-now meets fragile state.', helps:'excel in short sprints', hurts:'the load must be sustained', tip:'alternate 25-minute sprints with safety checks.' }},
  { id:'ae_lead_sync', a:{trait:'Cooperation', pol:'down', thr:'H'}, b:{trait:'Assertiveness', pol:'up', thr:'H'}, copy:{ how:'You lean toward leading, not syncing.', helps:'establish clear ownership', hurts:'you need team consensus', tip:'add one shared win to every ask.' }},
  { id:'ae_warm_guarded', a:{trait:'Trust', pol:'down', thr:'H'}, b:{trait:'Gregariousness', pol:'up', thr:'H'}, copy:{ how:'You’re warm but guarded.', helps:'set boundaries', hurts:'trust must form quickly', tip:'ask constraints before conclusions.' }},
  { id:'an_guarded_reactive', a:{trait:'Trust', pol:'down', thr:'H'}, b:{trait:'Anger', pol:'up', thr:'H'}, copy:{ how:'You’re guarded and quick to flare.', helps:'set hard rules', hurts:'threads get heated', tip:'name the trigger and wait 90 seconds.' }},
  { id:'an_understate_push', a:{trait:'Modesty', pol:'up', thr:'H'}, b:{trait:'Assertiveness', pol:'up', thr:'H'}, copy:{ how:'You understate then push.', helps:'make humble asks', hurts:'stakes are high in meetings', tip:'make an explicit ask after your summary.' }},
  { id:'e_solo_driver', a:{trait:'Assertiveness', pol:'up', thr:'H'}, b:{trait:'Gregariousness', pol:'down', thr:'H'}, copy:{ how:'You push alone more than with groups.', helps:'take direct action', hurts:'you need team buy-in', tip:'recruit 1:1 before the group push.' }},
  { id:'c_neat_inconsistent', a:{trait:'Orderliness', pol:'up', thr:'H'}, b:{trait:'Self-Discipline', pol:'down', thr:'H'}, copy:{ how:'Neat but inconsistent.', helps:'shine in prep phases', hurts:'follow-through is required', tip:'protect a fixed daily slot.' }},
  { id:'a_truth_vs_care', a:{trait:'Morality', pol:'down', thr:'H'}, b:{trait:'Sympathy', pol:'up', thr:'H'}, copy:{ how:'Blunt truth meets care.', helps:'make hard calls', hurts:'soft landings are needed', tip:'rule → reason → option.' }},
  { id:'on_curiosity_risk', a:{trait:'Openness', pol:'up', thr:'H'}, b:{trait:'Anxiety', pol:'up', thr:'H'}, copy:{ how:'Curiosity meets risk.', helps:'run small probes', hurts:'unknowns are big', tip:'pre-commit to a small probe and log risk notes.' }},
  { id:'oe_depth_vs_novelty', a:{trait:'Intellect', pol:'up', thr:'H'}, b:{trait:'Excitement-Seeking', pol:'up', thr:'H'}, copy:{ how:'Deep dive vs novelty chase.', helps:'run dual-track work', hurts:'single-rail focus is needed', tip:'use the two-tab rule — one explore, one finish.' }},
  { id:'ce_checklists_thrills', a:{trait:'Cautiousness', pol:'up', thr:'H'}, b:{trait:'Excitement-Seeking', pol:'up', thr:'H'}, copy:{ how:'Checklists vs thrills.', helps:'earn reward', hurts:'impulse switches tempt you', tip:'earn thrills after the checklist.' }},
];

// --- helpers ---
const domainKeys: DomainKey[] = ['O','C','E','A','N'] as any;
function domainMeans(facets:FacetData[]){
  const by: Record<DomainKey, number[]> = {O:[],C:[],E:[],A:[],N:[]};
  for (const f of facets) by[f.domain].push(f.raw ?? 3);
  const means: Record<DomainKey, number> = {O:3,C:3,E:3,A:3,N:3};
  for (const d of domainKeys){
    const arr = by[d];
    means[d] = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 3;
  }
  return means;
}

// Map a trait string to either a domain mean or a facet value
function traitZ(trait:string, facets:FacetData[], zMap:Map<string,number>): number | null {
  const domainMap: Record<string, DomainKey> = {
    Openness:'O', Conscientiousness:'C', Extraversion:'E', Agreeableness:'A', Neuroticism:'N'
  };
  const domainKey = domainMap[trait];
  if (domainKey){
    const mean = domainMeans(facets)[domainKey];
    return z(mean);
  }
  const hit = facets.find(f=> f.facet.toLowerCase() === trait.toLowerCase());
  if (!hit) return null;
  return zMap.get(`${hit.domain}:${hit.facet}`) ?? z(hit.raw);
}

function passThreshold(val:number, pol:Pol, thr:Thr): number {
  const t = thr==='H' ? H : thr==='M' ? M : L;
  const score = pol==='up' ? val : (1 - val);
  return score >= t ? score : -1;
}

// pick multiple conflicts (H tier, then M) - up to 4 conflicts
function selectConflictPairsDetailed(facets: FacetData[], zMap: Map<string, number>, maxConflicts: number = 4){
  function evalTier(minThr: Thr){
    const conflicts: any[] = [];
    for (let i=0;i<CATALOG.length;i++){
      const entry = CATALOG[i];
      const aVal = traitZ(entry.a.trait, facets, zMap);
      const bVal = traitZ(entry.b.trait, facets, zMap);
      if (aVal==null || bVal==null) continue;
      const aThr = minThr==='M' && entry.a.thr==='H' ? 'M' : entry.a.thr;
      const bThr = minThr==='M' && entry.b.thr==='H' ? 'M' : entry.b.thr;
      const aScore = passThreshold(aVal, entry.a.pol, aThr);
      const bScore = passThreshold(bVal, entry.b.pol, bThr);
      if (aScore<0 || bScore<0) continue;
      const score = Math.min(aScore, bScore);
      conflicts.push({ entry, score, aVal, bVal, idx:i });
    }
    // Sort by score (highest first) and return top conflicts
    return conflicts.sort((a,b) => b.score - a.score).slice(0, maxConflicts);
  }
  const hConflicts = evalTier('H');
  const mConflicts = evalTier('M');
  return [...hConflicts, ...mConflicts].slice(0, maxConflicts);
}

// build multiple conflict SelectedCards
function buildConflictCards(facets:FacetData[], zMap:Map<string,number>, maxConflicts: number = 4): SelectedCard[] {
  const conflicts = selectConflictPairsDetailed(facets, zMap, maxConflicts);
  const cards: SelectedCard[] = [];
  
  for (const sel of conflicts) {
    const { entry, aVal, bVal, idx } = sel;
    const aPct = Math.round(aVal*100);
    const bPct = Math.round(bVal*100);
    const copy = entry.copy || { how:'Gas pedal meets brake.', helps:'quick crisis moves.', hurts:'long uncertainty.', tip:'pause for 2 beats, then pick one next step.' };
    // Derive H/M/L labels for each side based on percentile strength relative to its polarity
    const level = (v:number)=> v>=0.70 ? 'High' : v>=0.40 ? 'Medium' : 'Low';
    const norm = (val:number, pol:Pol)=> pol==='up' ? val : (1 - val);
    const aLabel = level(norm(aVal, entry.a.pol));
    const bLabel = level(norm(bVal, entry.b.pol));
    cards.push({
      type: 'conflict',
      facet: `Conflict Pair — ${entry.a.trait} ${aLabel} × ${entry.b.trait} ${bLabel}`,
      description: `${copy.how}\n\nThis tension helps you ${copy.helps.toLowerCase()} but can hurt you when ${copy.hurts.toLowerCase()}.\n\nTip: ${copy.tip}`,
      conflict: { left: entry.a.trait, right: entry.b.trait, id: idx },
      leftPct: aPct,
      rightPct: bPct
    });
  }

  // If no conflicts found, add fallback: Pursuit vs Threat from domain means
  if (cards.length === 0) {
    const means = domainMeans(facets);
    const O = means.O, C = means.C, E = means.E, N = means.N;
    const T = z(N);
    const P = z(0.40*O + 0.35*E + 0.25*C);
    const pLabel = P >= 0.5 ? 'High' : 'Low';
    const tLabel = T >= 0.5 ? 'High' : 'Low';
    const strengthLabel = (v:number)=> v>=0.7 ? 'Strong' : v>=0.4 ? 'Moderate' : 'Slight';
    const pStrength = strengthLabel(pLabel==='High' ? P : (1 - P));
    const tStrength = strengthLabel(tLabel==='High' ? T : (1 - T));
    cards.push({
      type: 'conflict',
      facet: `Conflict Pair — Pursuit ${pLabel} (${pStrength}) × Threat ${tLabel} (${tStrength})`,
      description: 'Gas pedal meets brake.\n\nThis tension helps you with fast probes and crisis work but can hurt you during long periods of ambiguity.\n\nTip: pause 2 counts; set a binary next step.',
      conflict: { left: 'Pursuit', right: 'Threat', id: -1 },
      leftPct: Math.round(P*100),
      rightPct: Math.round(T*100)
    });
  }
  
  return cards;
}

export function selectFiveCards(facets: FacetData[]): SelectedCard[] {
  const cards: SelectedCard[] = [];
  const used = new Set<string>();

  // compute z for all facets
  const zMap = new Map<string, number>(); // key domain:facet
  facets.forEach(f=> zMap.set(`${f.domain}:${f.facet}`, z(f.raw)));

  // 1. Strongest High (authority)
  const highs = facets
    .filter(f => f.bucket==='High' && !NEG.has(f.facet))
    .sort((a,b)=> (zMap.get(`${b.domain}:${b.facet}`)! - zMap.get(`${a.domain}:${a.facet}`)!));
  if (highs.length > 0) {
    const strongest = highs[0];
    cards.push({
      type: 'high',
      facet: strongest.facet,
      domain: strongest.domain,
      bucket: strongest.bucket,
      raw: strongest.raw,
      description: `You have strong ${strongest.facet.toLowerCase()} that serves as a reliable foundation.`
    });
    used.add(`${strongest.domain}:${strongest.facet}`);
  }

  // 2. Strongest Low (tension) — highest risk
  let strongestLow: FacetData | undefined;
  let bestRisk = -1;
  for (const f of facets){
    const zv = zMap.get(`${f.domain}:${f.facet}`)!;
    const risk = NEG.has(f.facet) ? zv : (1 - zv);
    if (!used.has(`${f.domain}:${f.facet}`) && risk > bestRisk){ bestRisk = risk; strongestLow = f; }
  }
  if (strongestLow){
    used.add(`${strongestLow.domain}:${strongestLow.facet}`);
    cards.push({
      type:'low',
      facet:strongestLow.facet,
      domain:strongestLow.domain,
      bucket:strongestLow.bucket,
      raw:strongestLow.raw,
      description:`Your ${strongestLow.facet.toLowerCase()} may need attention, especially under pressure.`
    });
  }

  // 3-6. Conflict Pairs (up to 4 conflicts) — full cards
  const conflictCards = buildConflictCards(facets, zMap, 4);
  cards.push(...conflictCards);

  // 4. Social trait (prime social upsells)
  const socialFacets = ['Trust','Cooperation','Friendliness','Morality'];
  const socialCandidates = facets
    .filter(f=> socialFacets.includes(f.facet) && !used.has(`${f.domain}:${f.facet}`))
    .sort((a,b)=> Math.abs((zMap.get(`${b.domain}:${b.facet}`)!)-0.5) - Math.abs((zMap.get(`${a.domain}:${a.facet}`)!)-0.5));
  if (socialCandidates.length > 0) {
    const social = socialCandidates[0];
    used.add(`${social.domain}:${social.facet}`);
    cards.push({
      type: 'social',
      facet: social.facet,
      domain: social.domain,
      bucket: social.bucket,
      raw: social.raw,
      description: `Your ${social.facet.toLowerCase()} shapes how others experience you in relationships.`
    });
  }

  // 5. Values/Boundary trait (prime Override)
  const valuesFacets = ['Morality','Dutifulness'];
  let valuesCard = facets.find(f => valuesFacets.includes(f.facet) && !used.has(`${f.domain}:${f.facet}`));
  if (!valuesCard) {
    valuesCard = facets
      .filter(f => !used.has(`${f.domain}:${f.facet}`))
      .sort((a, b) => Math.abs(b.raw - 3) - Math.abs(a.raw - 3))[0];
  }
  if (valuesCard) {
    cards.push({
      type: 'values',
      facet: valuesCard.facet,
      domain: valuesCard.domain,
      bucket: valuesCard.bucket,
      raw: valuesCard.raw,
      description: `Your ${valuesCard.facet.toLowerCase()} reflects your core boundaries and decision-making style.`
    });
  }

  return cards.slice(0, 8); // Allow up to 8 cards (1 high + 1 low + 4 conflicts + 1 social + 1 values)
}
