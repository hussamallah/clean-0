import { canonicalFacets, DomainKey, ANCHORS } from "./constants";

export type Phase1 = {
  p: Record<string, number>;
  m: Record<string, number>;
  t: Record<string, number>;
  P: Record<string, number>;
};

export function computeNet(p: Record<string,number>, m: Record<string,number>, facets: string[]): Record<string, number> {
  return Object.fromEntries(facets.map(f => [f, (p[f]||0) - (m[f]||0)]));
}

export function computeAmbiguity(p: Record<string,number>, m: Record<string,number>, facets: string[]): Record<string, number> {
  const S = Object.fromEntries(facets.map(f => [f, 2*(p[f]||0) - 2*(m[f]||0)]));
  const AmbScore = Object.fromEntries(facets.map(f => {
    let amb = 2 - Math.abs(S[f] as number);
    if ((p[f]||0)===0) amb += 0.5;
    if ((m[f]||0)===1) amb += 0.5;
    return [f, amb];
  }));
  return AmbScore as Record<string, number>;
}

export function shortlistResolver(p: Record<string,number>, m: Record<string,number>, domain: DomainKey): string[] {
  const facets = canonicalFacets(domain);
  const AmbScore = computeAmbiguity(p, m, facets);
  let shortlist: string[] = [];
  shortlist = shortlist.concat(facets.filter(f=> (p[f]||0)===1 && (m[f]||0)===1));
  shortlist = shortlist.concat(facets.filter(f=> (p[f]||0)===0 && (m[f]||0)===0));
  const remaining = facets.filter(f=>!shortlist.includes(f))
    .sort((a,b)=> (AmbScore[b]-AmbScore[a]) || facets.indexOf(a)-facets.indexOf(b));
  shortlist = Array.from(new Set(shortlist.concat(remaining)));
  if (shortlist.length > 4) shortlist = shortlist.slice(0,4);
  if (shortlist.length < 2){
    for (const f of facets){
      if (!shortlist.includes(f)) shortlist.push(f);
      if (shortlist.length >= 2) break;
    }
  }
  return shortlist;
}

export function computePrior(p: Record<string,number>, t: Record<string,number>, m: Record<string,number>, facets: string[]): Record<string, number> {
  return Object.fromEntries(facets.map(f => [f, 2*(p[f]||0) + 1*(t[f]||0) - 2*(m[f]||0)]));
}

// ---------------------------------------------------------------------------
// Updated threshold constants (raw scale 1–5)
// Low/Medium cutline and Medium/High cutline expressed in raw units
export const LOW_CUT = 2.36;
export const HIGH_CUT = 3.64;

// ---------------------------------------------------------------------------
// 1) Bandwidth – ensure every facet receives at least one anchor statement and
//    distribute extra items deterministically based on prior magnitude.
//    Domain total will sit between 6–12 inclusive.
export function anchorsBudget(P: Record<string, number>, facets: string[], domain?: DomainKey): Record<string, number> {
  // Start with baseline of 1 item per facet (guarantees no default 3.0 values)
  const budget: Record<string, number> = Object.fromEntries(facets.map(f => [f, 1]));

  // Priority magnitude (positive only)
  const pri: number[] = facets.map(f => Math.max(0, P[f] || 0));
  const priSum = pri.reduce((a, b) => a + b, 0);

  // Determine target item count for the domain (cap 6–12)
  const base = 6; // baseline – one per facet (6 facets)
  const target = Math.min(12, Math.max(6, base + priSum));
  let remaining = target - base;

  // Deterministic round-robin by descending priority then facet name
  const order = [...facets].sort((a, b) => {
    const diff = pri[facets.indexOf(b)] - pri[facets.indexOf(a)];
    return diff !== 0 ? diff : a.localeCompare(b);
  });

  while (remaining > 0) {
    for (const f of order) {
      if (remaining === 0) break;
      if (pri[facets.indexOf(f)] > 0) {
        budget[f] += 1;
        remaining -= 1;
      }
    }
    if (priSum === 0) break; // safeguard against infinite loop
  }

  // Cap each facet's budget to the actual number of available statements
  const cappedBudget: Record<string, number> = {};
  for (const f of facets) {
    const availableStatements = domain ? ((ANCHORS as any)[domain]?.[f]?.length || 0) : 2; // default to 2 if no domain
    cappedBudget[f] = Math.min(budget[f], availableStatements);
  }

  return cappedBudget;
}

// Helper – minimal distance of raw score to either cutline
function distToCut(raw: number): number {
  return Math.min(Math.abs(raw - LOW_CUT), Math.abs(raw - HIGH_CUT));
}

// ---------------------------------------------------------------------------
// 2) Phase-3 confirmers – pick facets near cutlines OR with prior conflict.
export function triggersForConfirmers(
  A_raw: Record<string, number>,
  P: Record<string, number>,
  domain: DomainKey
): string[] {
  const facets = canonicalFacets(domain);
  return facets.filter(f => {
    const a = A_raw[f];
    if (a == null) return false;
    const conflict = (a >= 4.0 && (P[f] || 0) <= 0) || (a <= 2.0 && (P[f] || 0) >= 1);
    return distToCut(a) < 0.06 || conflict;
  });
}

// ---------------------------------------------------------------------------
// 3) Updated bucketing aligned to exact cutlines.
export function baseBucket(raw: number, _prior?: number): 'High' | 'Medium' | 'Low' {
  if (raw < LOW_CUT) return 'Low';
  if (raw >= HIGH_CUT) return 'High';
  return 'Medium';
}

// ---------------------------------------------------------------------------
// 4) Apply confirmation answers (Yes/No/Maybe) only to boundary cases.
export function applyConfirmersBucket(
  bucket: Record<string, 'High' | 'Medium' | 'Low'>,
  A_raw: Record<string, number>,
  _P: Record<string, number>, // prior not used in new logic but parameter kept for API compatibility
  asked: Array<{ facet: string; answer: 'Yes' | 'No' | 'Maybe' }>
): Record<string, 'High' | 'Medium' | 'Low'> {
  const out = { ...bucket };

  // Aggregate counts per facet
  const counts: Record<string, { yes: number; no: number }> = {};
  for (const { facet, answer } of asked) {
    if (!counts[facet]) counts[facet] = { yes: 0, no: 0 };
    if (answer === 'Yes') counts[facet].yes += 1;
    if (answer === 'No') counts[facet].no += 1;
  }

  for (const [facet, { yes, no }] of Object.entries(counts)) {
    const raw = A_raw[facet];
    if (raw == null) continue;
    if (distToCut(raw) > 0.06) continue; // only adjust boundary cases

    if (yes > no) {
      out[facet] = raw >= 3 ? 'High' : 'Medium';
    } else if (no > yes) {
      out[facet] = raw <= 3 ? 'Low' : 'Medium';
    }
    // ties → no change
  }

  return out;
}

export function orderFacets(facets: string[], bucket: Record<string,'High'|'Medium'|'Low'>, A_raw: Record<string, number>, P: Record<string, number>): string[] {
  const rank = { High: 3, Medium: 2, Low: 1 } as const;
  return facets.slice().sort((a,b)=>{
    if (rank[bucket[a]] !== rank[bucket[b]]) return rank[bucket[a]] - rank[bucket[b]];
    if (A_raw[b] !== A_raw[a]) return A_raw[b] - A_raw[a];
    if (P[b] !== P[a]) return P[b] - P[a];
    return facets.indexOf(a) - facets.indexOf(b);
  });
}


