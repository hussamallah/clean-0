import { sha256Hex } from "@/lib/crypto/sha256hex";

export type DomainKey = 'O'|'C'|'E'|'A'|'N';

export type FacetInput = { name: string; score: number; idx: number };

export type FacetsByDomain = Record<DomainKey, FacetInput[]>;

export type DomainMeans = Record<DomainKey, number>; // raw 1..5

export type WowPick = {
  name: string;
  score: number;
  domain_mean: number;
  pattern: 'high_domain_low_facet'|'low_domain_high_facet'|'extreme_high'|'extreme_low'|'contrast'|'neutral';
  reason: { contrast: number; visibility: number; extreme: boolean };
};

export type WowOutput = Record<DomainKey, WowPick[]>;

const K_PER_DOMAIN = 2;
const EPS_CONTRAST = 0.25;
const W_CONTRAST = 100;
const W_EXTREME  = 20;

const VISIBILITY: Record<DomainKey, Record<string, number>> = {
  O:{Intellect:10, Adventurousness:10, Artistic:5, Openness:5, Emotionality:5, Liberalism:5},
  C:{Orderliness:10, 'Self-Discipline':10, Achievement:10, 'Self-Efficacy':10, Cautiousness:5, Dutifulness:5},
  E:{Assertiveness:10, Activity:10, Gregariousness:10, 'Excitement-Seeking':5, Cheerfulness:5, Friendliness:5},
  A:{Altruism:10, Trust:10, Cooperation:5, Morality:5, Modesty:5, Sympathy:5},
  N:{Anxiety:10, Depression:10, 'Self-Consciousness':10, Vulnerability:10, Anger:5, Immoderation:5}
};

function patternFor(score:number, mean:number, contrast:number){
  if (mean >= 4.0 && score <= 2) return 'high_domain_low_facet' as const;
  if (mean <= 2.5 && score >= 4) return 'low_domain_high_facet' as const;
  if (score === 5) return 'extreme_high' as const;
  if (score === 1) return 'extreme_low' as const;
  if (contrast >= 0.75) return 'contrast' as const;
  return 'neutral' as const;
}

export async function selectWowFacets(facets: FacetsByDomain, mean: DomainMeans, runId: string): Promise<WowOutput> {
  const out: Partial<WowOutput> = {};
  for (const D of ['O','C','E','A','N'] as DomainKey[]) {
    const list = Array.isArray(facets[D]) ? facets[D] : [];
    const cand: Array<{
      facet: FacetInput;
      contrast: number;
      composite: number;
      pattern: WowPick['pattern'];
    }> = [];

    for (const f of list) {
      const contrast = Math.abs(f.score - mean[D]);
      const extreme = (f.score === 5 || f.score === 1) ? 1 : 0;
      const vscore = VISIBILITY[D][f.name] || 0;
      const composite = (W_CONTRAST * contrast) + (W_EXTREME * extreme) + vscore;
      const pattern = patternFor(f.score, mean[D], contrast);
      cand.push({ facet: f, contrast, composite, pattern });
    }

    // deterministic tiebreak sort
    const hashes = new Map<string,string>();
    const h = async (name:string)=>{
      const key = `${runId}|${D}|${name}`;
      if (!hashes.has(key)) hashes.set(key, await sha256Hex(key));
      return hashes.get(key)!;
    };

    // Because hashing is async, we precompute all hashes first
    await Promise.all(cand.map(c=> h(c.facet.name)));

    cand.sort((a,b)=>{
      if (b.composite !== a.composite) return b.composite - a.composite;
      const va = VISIBILITY[D][a.facet.name] || 0;
      const vb = VISIBILITY[D][b.facet.name] || 0;
      if (vb !== va) return vb - va;
      const da = Math.abs(a.facet.score - 3);
      const db = Math.abs(b.facet.score - 3);
      if (db !== da) return db - da;
      if (a.facet.idx !== b.facet.idx) return a.facet.idx - b.facet.idx;
      const ha = hashes.get(`${runId}|${D}|${a.facet.name}`)!;
      const hb = hashes.get(`${runId}|${D}|${b.facet.name}`)!;
      return ha < hb ? -1 : ha > hb ? 1 : 0;
    });

    const picks: typeof cand = [];
    for (const c of cand){
      if (c.contrast >= EPS_CONTRAST || c.facet.score === 1 || c.facet.score === 5) picks.push(c);
      if (picks.length === K_PER_DOMAIN) break;
    }
    const finalPicks = picks.length ? picks : cand.slice(0,1);

    out[D] = finalPicks.map(p=> ({
      name: p.facet.name,
      score: p.facet.score,
      domain_mean: mean[D],
      pattern: p.pattern,
      reason: {
        contrast: Math.round(p.contrast * 100) / 100,
        visibility: VISIBILITY[D][p.facet.name] || 0,
        extreme: (p.facet.score === 1 || p.facet.score === 5)
      }
    }));
  }
  return out as WowOutput;
}


