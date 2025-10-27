'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import CTAButton from '@/components/CTAButton';
import archetypeRules from "@/arctyps rules.json";
import archetypeAtlas from "@/lib/data/archetype_atlas.json";
// Field presence bank removed for domain cards UI
import { DOMAINS, canonicalFacets, FACET_INTERPRETATIONS } from "@/lib/bigfive/constants";
import { getScoreLevel } from "@/lib/bigfive/format";
import { selectFiveCards } from "@/lib/bigfive/fiveCardSelector";
import ExistentialCircuits from "@/components/who/ExistentialCircuits";
import bigFiveImpacts from "@/BigFiveImpacts.json";
import { selectWowFacets, type FacetsByDomain as WowFacetsByDomain } from "@/lib/bigfive/wowFacets";
import wowBank from "@/wow.json";
import oneSentenceSummaries from "@/one-sentence-summary.json";
import ResultsNav from '@/components/ResultsNav';
import IdentityMirror from "@/components/who/IdentityMirror";
import PaidContentPreviewModal from '@/components/PaidContentPreviewModal';


// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || hex.length < 7) return `rgba(76, 175, 239, ${alpha})`; // Default color if hex is invalid
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Tiny star renderer (inline)
const Stars = ({ count }:{ count:number }) => (
  <div className="flex gap-1">
    {Array.from({length:5}).map((_,i)=> (
      <span key={i} className={i < count ? 'text-yellow-300' : 'text-white/20'}>★</span>
    ))}
  </div>
);
// Stacked stars renderer (one star per line)
const StackedStars = ({ count }:{ count:number }) => (
  <div className="flex flex-col gap-1">
    {Array.from({length:5}).map((_,i)=> (
      <div key={i} className={i < count ? 'text-yellow-300' : 'text-white/20'}>★</div>
    ))}
  </div>
);

// Domain tag helper
type DomainKey = 'O'|'C'|'E'|'A'|'N';
const domainToKey: Record<string, DomainKey> = {
  Openness: 'O',
  Conscientiousness: 'C',
  Extraversion: 'E',
  Agreeableness: 'A',
  Neuroticism: 'N'
};

// Synonym map from bank labels to canonical facet keys used in results payloads
const FACET_SYNONYMS: Record<DomainKey, Record<string,string>> = {
  A: {
    'trust':'Trust',
    'compliance':'Cooperation',
    'cooperation':'Cooperation',
    'altruism':'Altruism',
    'tender-mindedness':'Sympathy',
    'sympathy':'Sympathy',
    'straightforwardness':'Morality',
    'morality':'Morality',
    'modesty':'Modesty'
  },
  E: {
    'warmth':'Friendliness',
    'friendliness':'Friendliness',
    'gregariousness':'Gregariousness',
    'assertiveness':'Assertiveness',
    'activity':'Activity Level',
    'activity level':'Activity Level',
    'excitement-seeking':'Excitement-Seeking',
    'positive emotions':'Cheerfulness',
    'cheerfulness':'Cheerfulness'
  },
  O: {
    'feelings':'Emotionality',
    'emotionality':'Emotionality',
    'fantasy':'Imagination',
    'imagination':'Imagination',
    'aesthetics':'Artistic Interests',
    'artistic interests':'Artistic Interests',
    'values':'Liberalism',
    'liberalism':'Liberalism',
    'actions':'Adventurousness',
    'adventurousness':'Adventurousness',
    'ideas':'Intellect',
    'intellect':'Intellect'
  },
  C: {
    'competence':'Self-Efficacy',
    'self-efficacy':'Self-Efficacy',
    'order':'Orderliness',
    'orderliness':'Orderliness',
    'dutifulness':'Dutifulness',
    'achievement':'Achievement',
    'self-discipline':'Self-Discipline',
    'deliberation':'Cautiousness',
    'cautiousness':'Cautiousness'
  },
  N: {
    'anxiety':'Anxiety',
    'angry hostility':'Anger',
    'anger':'Anger',
    'depression':'Depression',
    'self-consciousness':'Self-Consciousness',
    'impulsiveness':'Immoderation',
    'immoderation':'Immoderation',
    'vulnerability':'Vulnerability'
  }
};

function normFacetLabel(s:string){
  return String(s||'').toLowerCase().trim();
}

// Extract facet buckets per domain from results
function extractFacetBuckets(payload:any): Record<DomainKey, Record<string,'High'|'Medium'|'Low'>> | null {
  const results: any[] = Array.isArray(payload?.results) ? payload.results : [];
  const out: Partial<Record<DomainKey, Record<string,'High'|'Medium'|'Low'>>> = {};
  for (const r of results){
    const d = r?.domain as DomainKey;
    if (!['O','C','E','A','N'].includes(String(d))) continue;
    const bucket = r?.payload?.final?.bucket;
    if (bucket && typeof bucket === 'object'){
      out[d] = bucket as any;
    }
  }

  if (Object.keys(out).length) return out as Record<DomainKey, Record<string,'High'|'Medium'|'Low'>>;

  // Fallback: derive buckets from phase2 raw facet scores (1..5 -> 0..1 -> H/M/L)
  const derived: Partial<Record<DomainKey, Record<string,'High'|'Medium'|'Low'>>> = {};
  for (const r of results){
    const d = r?.domain as DomainKey;
    if (!['O','C','E','A','N'].includes(String(d))) continue;
    const raw = r?.payload?.phase2?.A_raw;
    if (raw && typeof raw === 'object'){
      const map: Record<string,'High'|'Medium'|'Low'> = {};
      for (const [facet, val] of Object.entries(raw)){
        const num = Number(val);
        const norm = isFinite(num) ? Math.max(0, Math.min(1, (num - 1) / 4)) : 0.5; // 1..5 -> 0..1
        const bucket: 'High'|'Medium'|'Low' = norm >= 0.67 ? 'High' : (norm < 0.34 ? 'Low' : 'Medium');
        map[facet] = bucket;
      }
      derived[d] = map;
    }
  }
  return Object.keys(derived).length ? derived as Record<DomainKey, Record<string,'High'|'Medium'|'Low'>> : null;
}

// Extract normalized domain means (0..1). Prefers final facet buckets; falls back to phase2 raw if present.
function extractDomainMeansNormalized(payload:any): Record<DomainKey, number> {
  const results: any[] = Array.isArray(payload?.results) ? payload.results : [];
  const out: Record<DomainKey, number> = { O: 0.5, C: 0.5, E: 0.5, A: 0.5, N: 0.5 };

  const bucketToNum = (b:any)=> b==='High' ? 1 : b==='Medium' ? 0.5 : b==='Low' ? 0 : 0.5;

  for (const r of results){
    const d = r?.domain as DomainKey;
    if (!['O','C','E','A','N'].includes(String(d))) continue;

    // 1) Prefer final facet buckets
    const bucket = r?.payload?.final?.bucket;
    if (bucket && typeof bucket === 'object'){
      const vals = Object.values(bucket).map(bucketToNum);
      if (vals.length){
        out[d] = vals.reduce((a:number,b:number)=> a+b, 0) / vals.length;
        continue;
      }
    }

    // 2) Fallback to phase2 raw facet scores (assume 1..5 scale -> normalize to 0..1)
    const raw = r?.payload?.phase2?.A_raw;
    if (raw && typeof raw === 'object'){
      const vals = Object.values(raw).map((x:any)=>{
        const num = Number(x);
        if (!isFinite(num)) return 0.5;
        const norm = (num - 1) / 4; // map 1..5 to 0..1
        return Math.max(0, Math.min(1, norm));
      });
      if (vals.length){
        out[d] = vals.reduce((a:number,b:number)=> a+b, 0) / vals.length;
      }
    }
  }

  return out;
}

function bucketToValue(b:'High'|'Medium'|'Low'): number { return b==='High'?1: b==='Medium'?0.5: 0; }

function computeCardAvgFacets(card:any, facetBuckets: Record<DomainKey, Record<string,'High'|'Medium'|'Low'>> | null): number {
  if (!facetBuckets) return 0.5;
  const maps: any[] = Array.isArray(card?.big_five_map) ? card.big_five_map : [];
  let totalWeight = 0;
  let sum = 0;
  
  console.log('Override Card Debug - computeCardAvgFacets:', {
    cardTitle: card?.title || card?.id,
    facetBuckets: facetBuckets,
    maps: maps
  });
  
  for (const m of maps){
    const dk = domainToKey[m?.domain || ''] as DomainKey;
    const dir = String(m?.direction || 'direct');
    const facs: string[] = Array.isArray(m?.facets) ? m.facets : [];
    for (const f of facs){
      const canon = FACET_SYNONYMS[dk]?.[normFacetLabel(f)] || f; // fall back to original label
      const b = facetBuckets[dk]?.[canon];
      if (!b) continue;
      let v = bucketToValue(b);
      if (dir === 'inverse') v = 1 - v; // invert
      const w = dir === 'support' ? 0.5 : 1.0; // support has lower weight
      sum += v * w;
      totalWeight += w;
      
      console.log('Override Card Facet Calculation:', {
        cardTitle: card?.title || card?.id,
        domain: m?.domain,
        facet: f,
        canonical: canon,
        bucket: b,
        bucketValue: bucketToValue(b),
        direction: dir,
        finalValue: v,
        weight: w,
        contribution: v * w
      });
    }
  }
  
  const result = totalWeight>0 ? (sum / totalWeight) : 0.5;
  console.log('Override Card Final Average:', {
    cardTitle: card?.title || card?.id,
    sum: sum,
    totalWeight: totalWeight,
    average: result
  });
  
  return result;
}

function computeCardAvg(card: any, dmOrFacet: any): number {
  // Prefer facet-based scoring if buckets available
  if (dmOrFacet && dmOrFacet.__type === 'facetBuckets'){ return computeCardAvgFacets(card, dmOrFacet.map); }
  // Fallback: previous domain-mean approach
  const dm = dmOrFacet as Record<DomainKey, number> | null;
  if (!dm) return 0.5;
  const maps: any[] = Array.isArray(card?.big_five_map) ? card.big_five_map : [];
  let totalWeight = 0; let score = 0;
  for (const m of maps){
    const key = domainToKey[m?.domain || ''] as DomainKey;
    const val = dm[key]; if (typeof val !== 'number') continue;
    const dir = String(m?.direction || 'direct');
    const weight = 1.0;
    const dirScore = dir === 'inverse' ? (1 - val) : val;
    score += dirScore * weight; totalWeight += weight;
  }
  return totalWeight>0 ? score/totalWeight : 0.5;
}

function scoreCardLevel(card: any, dmOrFacet: any): 'high'|'medium'|'low' {
  const avg = computeCardAvg(card, dmOrFacet);
  if (avg >= 0.67) return 'high';
  if (avg < 0.34) return 'low';
  return 'medium';
}

function starsForAvg(avg: number): number {
  let stars;
  if (avg >= 0.67) stars = 5;
  else if (avg < 0.34) stars = avg < 0.17 ? 1 : 2;
  else stars = avg < 0.5 ? 3 : 4;
  
  console.log('Override Card Stars Calculation:', {
    average: avg,
    stars: stars,
    threshold: avg >= 0.67 ? '5 stars (>=0.67)' : avg < 0.34 ? (avg < 0.17 ? '1 star (<0.17)' : '2 stars (0.17-0.34)') : (avg < 0.5 ? '3 stars (0.34-0.5)' : '4 stars (0.5-0.67)')
  });
  
  return stars;
}

// Removed field presence cards; cards now represent the five domains

// Removed unused SVG star component; using simple Stars renderer

function YourIdContent() {
  const searchParams = useSearchParams();
  const rid = searchParams.get('rid');
  const [accentColor, setAccentColor] = useState('');
  const [archetypeName, setArchetypeName] = useState<string>('');
  const [domainMeans, setDomainMeans] = useState<Record<DomainKey, number> | null>(null);
  const [facetBuckets, setFacetBuckets] = useState<Record<DomainKey, Record<string,'High'|'Medium'|'Low'>> | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [fullResults, setFullResults] = useState<Array<{domain:DomainKey; payload:any}> | null>(null);
  const [whoData, setWhoData] = useState<any|null>(null);
  const [panels, setPanels] = useState<any|null>(null);
  const [modalDomain, setModalDomain] = useState<DomainKey|null>(null);
  const [headerOpen, setHeaderOpen] = useState<boolean>(false);
  const [archetypeDescription, setArchetypeDescription] = useState<{title: string; text: string}[]>([]);
  const [wowByDomain, setWowByDomain] = useState<null | Record<DomainKey, Array<{name:string; score:number; domain_mean:number; pattern:string; reason:{contrast:number; visibility:number; extreme:boolean}}>>>(null);
  const [shareStatus, setShareStatus] = useState<'idle'|'copied'|'error'>('idle');
  const [previewModal, setPreviewModal] = useState<any | null>(null);

  const emojiMap: Record<DomainKey, string> = { O:'🎨', C:'✅', E:'⚡', A:'🤝', N:'🛡️' };
  const GOLD = '#d4af37';
  const imageMap: Record<DomainKey, string> = {
    A: '/agree.png',
    C: '/conci.png',
    E: '/extra.png',
    N: '/neur.png',
    O: '/open.png'
  };

  useEffect(()=>{ import("@/lib/data/who_panels.json").then(m=> setPanels((m as any).default || m)); }, []);

  // Map canonical facet labels to the visibility keys used by wow selector
  function toVisibilityKey(d: DomainKey, name: string): string {
    const map: Partial<Record<DomainKey, Record<string,string>>> = {
      O: { 'Artistic Interests':'Artistic' },
      E: { 'Activity Level':'Activity', 'Positive Emotions':'Cheerfulness' },
      A: { 'Straightforwardness':'Morality', 'Compliance':'Cooperation', 'Tender-Mindedness':'Sympathy' },
      C: { 'Competence':'Self-Efficacy', 'Deliberation':'Cautiousness', 'Order':'Orderliness' },
      N: { 'Angry Hostility':'Anger', 'Impulsiveness':'Immoderation' }
    };
    const table = map[d] || {};
    return table[name] || name;
  }

  // Map wow selector facet name -> wow.json bank facet key (lowercase, specific hyphens)
  function wowNameToBankKey(d: DomainKey, name: string): string {
    const n = String(name || '').toLowerCase();
    const m: Partial<Record<DomainKey, Record<string,string>>> = {
      E: { 'activity':'activity level' },
      O: {},
      C: {},
      A: {},
      N: {}
    };
    const table = m[d] || {};
    return table[n] || n;
  }

  function domainProper(d: DomainKey): string {
    // Use DOMAINS labels like "Openness (O)" -> "Openness"
    return DOMAINS[d].label.split(' ')[0];
  }

  function lineForPick(d: DomainKey, pick: { name:string; pattern:string }): string | null {
    try{
      const dom = domainProper(d);
      const facetKey = wowNameToBankKey(d, pick.name);
      const domObj = (wowBank as any)[dom];
      const facetObj = domObj?.[facetKey];
      const text = facetObj?.[pick.pattern] || facetObj?.neutral;
      return typeof text === 'string' ? text : null;
    } catch { return null; }
  }

  function buildIdentityNarrativeFromWow(stanceLine?: string | null): string[] {
    if (!wowByDomain) return [];
    const picksOrdered: Array<{ d:DomainKey; p:any; priority:number }> = [];
    for (const d of ['O','C','E','A','N'] as DomainKey[]) {
      const arr = (wowByDomain as any)[d] as Array<any> | undefined;
      if (!arr || !arr.length) continue;
      // rank by composite approximation
      const ranked = [...arr].map(p=> ({
        p,
        priority: (p.reason?.contrast ?? 0)*100 + (p.reason?.extreme ? 20 : 0) + (p.reason?.visibility ?? 0)
      })).sort((a,b)=> b.priority - a.priority);
      // take top one for each domain first
      if (ranked[0]) picksOrdered.push({ d, p: ranked[0].p, priority: ranked[0].priority });
      // store others for overflow
      for (let i=1;i<ranked.length;i++) picksOrdered.push({ d, p: ranked[i].p, priority: ranked[i].priority - i });
    }
    // global sort, but keep first-pass domain coverage near the top
    picksOrdered.sort((a,b)=> b.priority - a.priority);

    const sentences: string[] = [];
    for (const item of picksOrdered) {
      const s = lineForPick(item.d, { name: item.p.name, pattern: item.p.pattern });
      if (s) sentences.push(s);
      if (sentences.length >= 6) break;
    }
    if (stanceLine && sentences.length < 7) sentences.push(stanceLine);
    return [sentences.join(' ')];
  }

  // Identity narrative builder (mirrors Who page selection/compression)
  function buildIdentityNarrativeFromWhoNarrative(narr: string[] | undefined | null, stanceLine?: string | null): string[] {
    const MAX_SENTENCES = 7;
    const MAX_FROM_NARR = 5;
    const MAX_WORDS = 16;
    const MIN_WORDS = 6;
    const SOFTENERS = /\b(very|really|quite|somewhat|often|usually|maybe|perhaps|a bit|kind of|sort of)\b/gi;
    const FILLERS = /\b(that|just|actually|literally)\b/gi;
    const BOILERPLATE_DOMAIN = /^\s*Your\s+(Openness|Conscientiousness|Extraversion|Agreeableness|Neuroticism)\s+is\b/i;
    const TOKENS = [
      { rx:/\bopenness\b/i, facets:[/imagin/i,/creativ/i,/ideas?/i,/beauty|art|music|literature|nature/i] },
      { rx:/\bconscientiousness\b/i, facets:[/reliable|reliab/i,/execution|deliver|finish/i,/lanes?|scope|SOP/i] },
      { rx:/\bextraversion\b/i, facets:[/tempo|momentum|visible|energ/i,/lead|initiat/i] },
      { rx:/\bagreeableness\b/i, facets:[/goodwill|trust|warm/i,/convert|align|coalition/i] },
      { rx:/\bneuroticism\b/i, facets:[/signals?|worry|anxiety|overload|frustration/i,/buffers?|resets?|guardrails?/i] }
    ];

    function splitSentences(text:string): string[] {
      return (text||'')
        .replace(/\s+/g,' ')
        .split(/(?<=[.!?])\s+/)
        .map(s=>s.trim())
        .filter(Boolean);
    }
    function clampWords(s:string): string {
      const words = s
        .replace(SOFTENERS,'')
        .replace(FILLERS,'')
        .replace(/\s+/g,' ')
        .trim()
        .split(' ');
      if (words.length <= MAX_WORDS) return words.join(' ');
      return words.slice(0, MAX_WORDS).join(' ') + '.';
    }
    function scoreSentence(s:string): number {
      let score = 0;
      for (const t of TOKENS) {
        if (t.rx.test(s)) score += 1;
        for (const f of t.facets) if (f.test(s)) score += 3;
      }
      if (/\b(tight cycles?|buffers?|resets?|guardrails?|boundar(y|ies))\b/i.test(s)) score += 2;
      if (/\b(define|commit|ship|move|drop scope|restart|request)\b/i.test(s)) score += 1;
      if (/\b(composed\s+force|regain\s+control|reliable\s+execution|set\s+tempo|momentum\s+visible)\b/i.test(s)) score += 2;
      return score;
    }

    const n0 = Array.isArray(narr) ? narr.slice(0,5).join(' ') : '';
    const n1 = Array.isArray(narr) ? narr.slice(5,10).join(' ') : '';
    const n2 = Array.isArray(narr) ? narr.slice(10).join(' ') : '';
    let candidates = [...splitSentences(n0), ...splitSentences(n1), ...splitSentences(n2)];
    candidates = candidates.filter(s => {
      const w = s.trim().split(/\s+/).filter(Boolean).length;
      if (w < MIN_WORDS) return false;
      if (BOILERPLATE_DOMAIN.test(s)) return false;
      if (/^heat\.?$/i.test(s)) return false;
      return true;
    });

    const ranked = candidates
      .map((s,idx)=>({ s, idx, score: scoreSentence(s) }))
      .sort((a,b)=> b.score - a.score || a.idx - b.idx);

    const picked: string[] = [];
    const used = new Set<number>();
    for (const t of TOKENS) {
      let bestIdx = -1; let bestScore = -Infinity;
      ranked.forEach((r,i)=>{
        if (used.has(i)) return;
        if (t.rx.test(r.s) || t.facets.some(f=> f.test(r.s))) {
          if (r.score > bestScore) { bestScore = r.score; bestIdx = i; }
        }
      });
      if (bestIdx >= 0) { picked.push(ranked[bestIdx].s); used.add(bestIdx); }
      if (picked.length >= MAX_FROM_NARR) break;
    }
    for (let i=0; i<ranked.length && picked.length<MAX_FROM_NARR; i++){
      if (used.has(i)) continue;
      const s = ranked[i].s;
      if (/heat plus direction equals motion/i.test(s)) continue;
      picked.push(s);
      used.add(i);
    }

    const compressed = picked.map(clampWords);
    const finalSentences: string[] = [];
    for (const s of compressed) { if (finalSentences.length < 6) finalSentences.push(s); }
    if (stanceLine && finalSentences.length < MAX_SENTENCES) finalSentences.push(stanceLine);
    if (!finalSentences.length) finalSentences.push('You set direction and move work to done.');
    return [finalSentences.join(' ')];
  }

  function computeStanceLine(): string | null {
    try{
      const dm = whoData?.derived?.domainMeans as Record<DomainKey, number> | undefined;
      const states = whoData?.states as Record<DomainKey, Record<string,'High'|'Medium'|'Low'>> | undefined;
      if (!dm || !states || !panels) return null;
      const Ehigh = (dm.E ?? 0) >= 4.0, Elow = (dm.E ?? 0) <= 2.0;
      const Ahigh = (dm.A ?? 0) >= 4.0, Alow = (dm.A ?? 0) <= 2.0;
      let interpersonalKey: string;
      if (Ehigh && Ahigh) interpersonalKey = 'warm_energizing';
      else if (Ehigh && Alow) interpersonalKey = 'forceful_independent';
      else if (Elow && Ahigh) interpersonalKey = 'calm_considerate';
      else if (Elow && Alow) interpersonalKey = 'autonomous_direct';
      else interpersonalKey = 'adaptive_balanced';

      const tone = (whoData?.tone || 'neutral') as string;
      const withTone = (panel:any)=>{
        if (!panel) return panel;
        const v = panel.tones?.[tone];
        if (!v) return panel;
        return { ...panel, title: v.title ?? panel.title, lines: Array.isArray(v.lines) ? v.lines : panel.lines };
      };
      const p = withTone(panels?.interpersonal?.[interpersonalKey]);
      const label = String(p?.title || 'Adaptive');
      let l0 = String((p?.lines || [])[0] || '').replace(/\s+/g,' ').trim();
      // Merge smoothly into one sentence as Who page does
      l0 = l0.replace(/^[Yy]ou\s+/, 'you ');
      const stance = label ? label.toLowerCase() : 'adaptive';
      if (!l0) return `Your stance with people is ${stance}.`;
      return `Your stance with people is ${stance} and ${l0}`;
    } catch { return null; }
  }

  function computeHeaderProofLine(): string {
    try{
      const rid = (whoData?.audit?.runHash) || '';
      const hash = (whoData?.audit?.checksum) || rid;
      const weeklyFinishers =  (typeof window !== 'undefined' && hash)
        ? (function(seed:string){
            let h = 0 >>> 0; for (let i=0;i<seed.length;i++){ h = ((h*31) + seed.charCodeAt(i)) >>> 0; }
            const min=1000, max=2000, span = max-min+1; return min + (h % span);
          })(String(hash))
        : 0;
      return weeklyFinishers
        ? `This run is verified (hash ${hash}). This week, ${weeklyFinishers.toLocaleString()} people finished; you read yours now.`
        : `This run is verified.`;
    } catch { return `This run is verified.`; }
  }
  
  // Redesigned quick-scan ID card (scaffold)
  function renderRedesignedIdCard() {
    // 1) Core tension from top conflict card
    let coreLabel: string | null = null;
    let coreStars = 0;
    let conflictCard: any = null;
    if (fullResults) {
      const facets: Array<{domain:DomainKey; facet:string; raw:number; bucket:'High'|'Medium'|'Low'}> = [];
      for (const d of ['O','C','E','A','N'] as DomainKey[]) {
        const payload = (fullResults.find(r=> r.domain===d) || ({} as any)).payload;
        if (!payload) continue;
        const A_raw = (payload?.phase2?.A_raw || {}) as Record<string, number>;
        const bucket = (payload?.final?.bucket || {}) as Record<string,'High'|'Medium'|'Low'>;
        for (const f of canonicalFacets(d)){
          const raw = Number(A_raw?.[f] ?? 3);
          const b = (bucket?.[f] as any) as 'High'|'Medium'|'Low' || 'Medium';
          facets.push({ domain:d, facet:f, raw, bucket: b });
        }
      }
      const cards = selectFiveCards(facets).filter((c:any)=> c.type==='conflict');
      if (cards.length) {
        conflictCard = cards[0];
        const avgPct = conflictCard.leftPct && conflictCard.rightPct ? (conflictCard.leftPct + conflictCard.rightPct)/2 : 50;
        coreStars = avgPct >= 80 ? 5 : avgPct >= 60 ? 4 : avgPct >= 40 ? 3 : avgPct >= 20 ? 2 : 1;
        coreLabel = String(conflictCard.facet || '').replace(/\s*vs\.?\s*/i, ' ←→ ');
      }
    }

    // 2) Domain snapshot (grouped)
    function DomainSnapshot(){
      if (!domainMeans) return null;
      const level = (v:number)=> v>=0.67 ? 'HIGH' : (v<0.34 ? 'LOW' : 'MEDIUM');
      const highs: string[] = []; const meds: string[] = []; const lows: string[] = [];
      const label = (d:DomainKey)=> DOMAINS[d].label.split(' (')[0];
      (['O','C','E','A','N'] as DomainKey[]).forEach(d=>{
        const v = domainMeans[d] ?? 0.5;
        const lvl = level(v);
        if (lvl==='HIGH') highs.push(label(d));
        else if (lvl==='MEDIUM') meds.push(label(d));
        else lows.push(label(d));
      });
      return (
        <div className="text-sm">
          <div className="text-white/70 mb-1" style={{letterSpacing:0.5}}>DOMAIN SNAPSHOT</div>
          {highs.length ? (<div>🟢 <b>HIGH</b>: {highs.join(', ')}</div>) : null}
          {meds.length ? (<div>🟡 <b>MEDIUM</b>: {meds.join(', ')}</div>) : null}
          {lows.length ? (<div>🔴 <b>LOW</b>: {lows.join(', ')}</div>) : null}
        </div>
      );
    }

    // 3) Quick profile bullets (pulled from narrative + stance)
    function QuickProfile(){
      const narr: string[] = Array.isArray(whoData?.narrative) ? whoData!.narrative : [];
      const strengths = whoData?.listSentences?.strengths || [];
      const risks = whoData?.listSentences?.risks || [];
      const stance = computeStanceLine();
      const style = narr[0] || 'Adaptive leader who moves people';
      const strength = strengths[0] || 'Planning with precision';
      const struggle = risks[0] || 'Executing with confidence';
      const stanceLine = stance ? stance.replace(/^Your\s+stance\s+with\s+people\s+is\s*/i,'').replace(/\.$/,'') : 'Balanced skepticism — you believe but verify';
      return (
        <ul className="list-disc pl-4 text-white/90 text-sm space-y-1">
          <li><b>Your Style</b>: {style}</li>
          <li><b>Your Strength</b>: {strength}</li>
          <li><b>Your Struggle</b>: {struggle}</li>
          <li>
            <b>Your Stance</b>: {stanceLine}
            <a href={`/compatibility${rid ? `?ridA=${rid}` : ''}`} className="ml-2 text-blue-400 hover:underline text-xs">(See how this impacts your relationships)</a>
          </li>
        </ul>
      );
    }

    // A small component to render the conflict pattern preview
    const ConflictPatternPreview = ({ card }: { card: any }) => {
      if (!card) return <p className="text-white/70">Your conflict pattern data will be shown here.</p>;
      return (
        <div>
          <h4 className="font-bold text-lg text-yellow-300">{card.facet}</h4>
          {card.explanation && <p className="mt-2 text-white/90 text-sm">{card.explanation}</p>}
          {card.friction && <p className="mt-2 text-xs italic text-white/70">{card.friction}</p>}
        </div>
      );
    };

    // 4) Key insight (short pull-quote from narrative)
    function KeyInsight(){
      const narr: string[] = Array.isArray(whoData?.narrative) ? whoData!.narrative : [];
      const baseQuote = narr[3] || 'You present confidently while your inner critic takes notes. Range is your advantage; diffusion is your risk.';
      const enhancedQuote = baseQuote.replace(/Use\s+tight\s+cycles\s+to\s+regain\s+control/i,
        (m)=> `${m} (e.g., break overwhelming projects into 25-minute focused sprints)`
      );
      return (
        <blockquote className="text-white/90 text-sm italic border-l pl-3 border-white/20">
          “{enhancedQuote}”
        </blockquote>
      );
    }

    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-4" style={{ ...neonBorderStyle(), maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <div className="mb-3">
          <div className="text-sm text-white/70" style={{letterSpacing:.5}}>🎯 YOUR GROUND ZERO PROFILE</div>
          {archetypeName ? <div className="text-xl font-extrabold" style={{ color: accentColor }}>{archetypeName.toUpperCase()}</div> : null}
        </div>

        <div className="my-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-center">
          <h3 className="text-lg font-bold text-white mb-2">⚖️ Your Core Conflict Pattern</h3>
          <p className="text-sm text-yellow-200/90">
            This tension is key to your growth. See how it shows up in specific, repeatable ways.
          </p>
          <div className="mt-2">
            <button 
              onClick={() => setPreviewModal({
                title: 'Conflict Patterns',
                description: 'This report reveals how you act under pressure. Below is your #1 pattern, based on your results.',
                previewContent: <ConflictPatternPreview card={conflictCard} />,
                price: 3.00,
                purchaseUrl: `/conflict-patterns${rid ? `?rid=${rid}` : ''}`
              })}
              className="btn btn-gold" // Using the standard gold button style
            >
              Preview Your Conflict Patterns
            </button>
          </div>
        </div>

        <hr className="border-white/10 my-2" />

        {archetypeDescription.length > 0 && (
          <div className="my-4 p-3 rounded-lg" style={neonBorderStyle()}>
            <h3 className="text-lg font-bold text-white mb-2" style={{ color: accentColor }}>
              What is your archetype?
              <span className="text-xs font-normal text-white/60 ml-2">(lore only, not diagnostic)</span>
            </h3>
            <div className="text-white/90 text-sm space-y-2">
              {archetypeDescription.map((part, index) => (
                <p key={index}>
                  <b className="font-semibold text-white/80">{part.title}:</b> {part.text}
                </p>
              ))}
            </div>
          </div>
        )}

        <div className="mb-3">
          <div className="text-white/80 font-semibold mb-1">🎭 QUICK PROFILE</div>
          <div className="inline-block text-left"><QuickProfile /></div>
        </div>

        <hr className="border-white/10 my-2" />

        <DomainSnapshot />

        <hr className="border-white/10 my-2" />

        <div className="mb-3">
          <div className="text-white/80 font-semibold mb-1">🎯 KEY INSIGHT</div>
          <KeyInsight />
        </div>

        <ResultsNav currentPage="/your-id" />
      </div>
    );
  }
  
  // Debug logging for domain card data
  console.log('Override Page Debug - Domain Cards:', {
    hasFullResults: !!fullResults,
    domains: ['O','C','E','A','N'],
  });

  // Build full domain summary content (mirrors FullResults)
  function renderDomainSummary(d: DomainKey, payload: any){
    const facets = canonicalFacets(d);
    const bucket = (payload?.final?.bucket || {}) as Record<string,'High'|'Medium'|'Low'>;
    const A_raw = (payload?.phase2?.A_raw || {}) as Record<string, number>;
    const domain_mean_raw = Number(payload?.final?.domain_mean_raw ?? 3);
    const lvlKey = String(getScoreLevel(domain_mean_raw)).replace('neutral','medium') as 'high'|'medium'|'low';
    const levelMeaning: Record<'high'|'medium'|'low', string> = {
      high: 'You can access this trait easily and consistently.',
      medium: 'You can turn this trait on when needed, but it isn’t your default.',
      low: d==='N' ? 'You keep an even keel and recover quickly under pressure.' : 'This trait stays in the background unless the situation forces it.'
    };
    const highs = facets.filter(f=> bucket[f]==='High').sort((a,b)=> (A_raw[b]-A_raw[a])).slice(0,2);
    const mids  = facets.filter(f=> bucket[f]==='Medium').sort((a,b)=> (Math.abs(3-(A_raw[a]??3)) - Math.abs(3-(A_raw[b]??3)))).slice(0,2);
    const lows  = facets.filter(f=> bucket[f]==='Low').sort((a,b)=> (A_raw[a]-A_raw[b])).slice(0,2);
    const isN = d==='N';
    const strengths = isN ? lows : highs;
    const development = isN ? highs : lows;
    const firstSentence = (txt:string|undefined)=> txt ? (txt.split(/(?<=\.)\s+/)[0] || txt).trim() : '';
    return (
      <div className="text-sm text-white/90 leading-relaxed">
        <div className="mb-1">Your overall level is <b className="capitalize">{lvlKey}</b>. {levelMeaning[lvlKey]}</div>
        <div className="mb-2">Domain average: <b>{domain_mean_raw.toFixed(2)} / 5</b></div>
        {strengths.length ? (
          <div className="mb-2">
            <div className="text-white/70 mb-1">Strong behavior levers</div>
            <ul className="list-disc pl-4">
              {strengths.map(name=> (
                <li key={name}><b>{name}</b>: {firstSentence((FACET_INTERPRETATIONS as any)[d][name]?.[(isN?'low':'high')])}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {mids.length ? (
          <div className="mb-2">
            <div className="text-white/70 mb-1">Workable levers</div>
            <ul className="list-disc pl-4">
              {mids.map(name=> (
                <li key={name}><b>{name}</b>: {firstSentence((FACET_INTERPRETATIONS as any)[d][name]?.medium)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {development.length ? (
          <div className="mb-1">
            <div className="text-white/70 mb-1">Development levers</div>
            <ul className="list-disc pl-4">
              {development.map(name=> (
                <li key={name}><b>{name}</b>: {firstSentence((FACET_INTERPRETATIONS as any)[d][name]?.[(isN?'high':'low')])}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }
  // Neon border helper using accent color
  function neonBorderStyle(){
    const glow = hexToRgba(accentColor || '#4cafef', 0.6);
    const wide = hexToRgba(accentColor || '#4cafef', 0.25);
    const border = hexToRgba(accentColor || '#4cafef', 0.5);
    return { borderColor: border, boxShadow: `0 0 10px ${glow}, 0 0 20px ${glow}, 0 0 40px ${wide}` } as any;
  }
  function goldBorderStyle(){
    const glow = 'rgba(212,175,55,0.6)';
    const wide = 'rgba(212,175,55,0.25)';
    const border = 'rgba(212,175,55,0.5)';
    return { borderColor: border, boxShadow: `0 0 10px ${glow}, 0 0 20px ${glow}, 0 0 40px ${wide}` } as any;
  }

  async function loadHtml2Canvas(): Promise<any>{
    if (typeof window === 'undefined') return null;
    const w = window as any;
    if (w.html2canvas) return w.html2canvas;
    await new Promise<void>((resolve, reject)=>{
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      s.async = true;
      s.onload = ()=> resolve();
      s.onerror = ()=> reject(new Error('failed to load html2canvas'));
      document.head.appendChild(s);
    });
    return (window as any).html2canvas;
  }

  async function capturePageScreenshot(): Promise<File|null>{
    try{
      const html2canvas = await loadHtml2Canvas();
      if (!html2canvas) return null;
      const el = document.querySelector('main') as HTMLElement || document.body;
      const canvas = await html2canvas(el, { backgroundColor: '#000000' });
      const blob: Blob|null = await new Promise(resolve=> canvas.toBlob(resolve, 'image/png'));
      if (!blob) return null;
      return new File([blob], 'ground-zero-id.png', { type: 'image/png' });
    } catch { return null; }
  }
  
  console.log('Override Page Debug - Data State:', {
    rid: rid,
    archetypeName: archetypeName,
    domainMeans: domainMeans,
    facetBuckets: facetBuckets,
    hasFacetBuckets: !!facetBuckets
  });

  useEffect(() => {
    if (!rid) return;

    (async () => {
      try {
        const res = await fetch(`/api/who/${rid}`, { cache: 'no-store' });
        const data = await res.json();

        console.log('Override Page Debug - Raw API payload:', data);

        // Mirror who/page.tsx logic to resolve archetype name
        const whoObj = data?.who ?? {};
        const results = Array.isArray(data?.results) ? data.results : [];

        let archName: string | undefined;
        // 1) direct string
        if (typeof whoObj?.archetype === 'string') archName = String(whoObj.archetype);
        // 2) object with winner
        if (!archName && typeof whoObj?.archetype === 'object' && whoObj?.archetype?.winner) archName = String(whoObj.archetype.winner);
        // 3) fallback from results array (domain === 'ARCH')
        if (!archName) {
          const archPayload = results.find((r: any) => r?.domain === 'ARCH')?.payload;
          if (typeof archPayload === 'string') archName = archPayload;
          else if (archPayload?.winner) archName = String(archPayload.winner);
        }

        if (archName) {
          setArchetypeName(archName);
          // Match using gz (display) or id (slug)
          const match = (archetypeRules as any).archetypes.find((a: any) => {
            const gz = String(a?.gz || '').toLowerCase();
            const id = String(a?.id || '').toLowerCase();
            const target = String(archName).toLowerCase();
            return gz === target || id === target;
          });
          if (match?.color?.hex) setAccentColor(match.color.hex);
        }

        if (archName) {
          const atlas = (archetypeAtlas as any);
          // Format archName to match the keys in the atlas (e.g., "sovereign" -> "Sovereign")
          const formattedArchName = archName.charAt(0).toUpperCase() + archName.slice(1).toLowerCase();
          const archetypeData = atlas[formattedArchName];
          if (archetypeData) {
            const getFirstSentence = (text: string) => {
                if (!text) return '';
                const sentences = text.split(/(?<=[.!?])\s+/);
                return sentences[0] || '';
            };

            const descriptionParts = [
                { title: 'Psychological Profile', text: getFirstSentence(archetypeData.psychologicalProfile) },
                { title: 'Origin', text: getFirstSentence(archetypeData.origin) },
                { title: 'Inner Conflict', text: getFirstSentence(archetypeData.innerConflict) },
                { title: 'Field Presence', text: getFirstSentence(archetypeData.fieldPresence) }
            ];
            
            setArchetypeDescription(descriptionParts.filter(part => part.text));
          }
        }

        // Extract domain means and facet buckets
        const dm = extractDomainMeansNormalized(data);
        const fb = extractFacetBuckets(data);
        setDomainMeans(dm);
        setFacetBuckets(fb);
        setFullResults(results);
        setWhoData(data?.who || null);
        console.log('Override Page Debug - Extracted Means and Buckets:', { dm, fb });
        setIsReady(true);

        // Build wow facets for narrative highlights
        try {
          const meansRaw: Record<DomainKey, number> = { O:3, C:3, E:3, A:3, N:3 } as any;
          const byDomain: WowFacetsByDomain = { O:[], C:[], E:[], A:[], N:[] } as any;
          for (const d of ['O','C','E','A','N'] as DomainKey[]) {
            const entry = results.find((r:any)=> r.domain===d)?.payload;
            if (!entry) continue;
            const dmRaw = Number(entry?.final?.domain_mean_raw);
            if (Number.isFinite(dmRaw)) meansRaw[d] = dmRaw;
            const raw = (entry?.phase2?.A_raw || {}) as Record<string, number>;
            let idx = 0;
            for (const f of canonicalFacets(d)){
              const score = Number(raw?.[f] ?? 3);
              const visKey = toVisibilityKey(d, f);
              byDomain[d].push({ name: visKey, score, idx: idx++ });
            }
          }
          const runId = String((data?.who?.audit?.runHash) || (data?.who?.audit?.checksum) || rid || 'rid');
          const wow = await selectWowFacets(byDomain, meansRaw, runId);
          setWowByDomain(wow as any);
        } catch (e) {
          console.warn('Wow facets selection failed', e);
          setWowByDomain(null);
        }
      } catch {}
    })();
  }, [rid]);

  if (!isReady) return null;

  const glowColor = hexToRgba(accentColor || '#000000', 0.7);
  const cardBgColor = hexToRgba(accentColor || '#000000', 0.1);

  return (
    <main className="min-h-screen bg-black text-white p-2 md:p-4 pb-4" style={{ ['zoom' as any]: 1 }}>
      <div className="text-center mb-4" style={{ marginTop: -30 }}>
        {archetypeName && (
          <Image 
            src={`/${archetypeName.toLowerCase()}.png`} 
            alt={`${archetypeName} emblem`} 
            width={192}
            height={192}
            className="h-24 w-24 sm:h-36 sm:w-36 md:h-48 md:w-48 mx-auto object-contain"
            priority
          />
        )}
      </div>
      {/* Redesigned, scannable ID card */}
      <div className="mt-6" style={{ marginTop: -100 }}>
        {renderRedesignedIdCard()}
      </div>
      {/* Share (kept) */}
      <div className="mt-6">
        {/* Big Share button under the section */}
        <div className="mt-3 flex justify-center">
          <button
            onClick={async ()=>{
              try{
                const landingUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : '';
                const file = await capturePageScreenshot();
                if (file && (navigator as any)?.canShare && (navigator as any).canShare({ files:[file] })){
                  await (navigator as any).share({ title: 'Ground Zero', url: landingUrl, files: [file] });
                  setShareStatus('copied');
                  setTimeout(()=> setShareStatus('idle'), 1500);
                  return;
                }
                if ((navigator as any)?.share){
                  await (navigator as any).share({ title: 'Ground Zero', url: landingUrl });
                  setShareStatus('copied');
                  setTimeout(()=> setShareStatus('idle'), 1500);
                } else if (navigator?.clipboard && landingUrl){
                  await navigator.clipboard.writeText(landingUrl);
                  setShareStatus('copied');
                  setTimeout(()=> setShareStatus('idle'), 1500);
                }
              } catch {
                setShareStatus('error');
                setTimeout(()=> setShareStatus('idle'), 1500);
              }
            }}
            className="px-6 py-3 rounded-full font-semibold"
            style={{
              color: '#111',
              background: 'linear-gradient(90deg, #FFD36E, #E4B847)',
              border: '2px solid #d4af37',
              boxShadow: '0 0 16px rgba(212,175,55,0.5)'
            }}
          >{shareStatus==='copied' ? 'Link Copied' : shareStatus==='error' ? 'Share Failed' : 'Share Your ID'}</button>
        </div>
      </div>
      <div className="flex gap-6">
        <div className="hidden shrink-0 w-44">
          <div className="sticky top-24 z-40 flex flex-col gap-3">
            {(['O','C','E','A','N'] as DomainKey[]).map((d) => {
              const domainName = DOMAINS[d].label.split(' (')[0];
              return (
                <button
                  key={d}
                  onClick={()=> setModalDomain(d)}
                  aria-label={domainName}
                  title={`${domainName} — click to view summary`}
                  className="px-3 py-2 rounded-none border-0 bg-transparent flex flex-col items-center gap-1 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0 group cursor-pointer"
                  style={{}}
                >
                  {imageMap[d] ? (
                    <Image src={encodeURI(imageMap[d])} alt={domainName} width={128} height={96} className="w-32 h-24 md:w-40 md:h-28 object-contain bg-transparent transition-transform duration-150 group-hover:scale-[1.05]" quality={95} style={{ filter: 'drop-shadow(0 0 12px rgba(212,175,55,0.6)) drop-shadow(0 0 28px rgba(212,175,55,0.35))' }} />
                  ) : (
                    <span role="img" aria-hidden="true" className="text-xl md:text-2xl">{emojiMap[d]}</span>
                  )}
                  <span className="truncate" style={{ color: accentColor }}>{domainName}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1">

      {/* Modal for domain summary */}
      {modalDomain && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={()=> setModalDomain(null)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="rounded-xl border relative max-w-xl w-[92%]"
            style={{ background: '#0f141a', ...neonBorderStyle() }}
            onClick={(e)=> e.stopPropagation()}
          >
            <button
              onClick={()=> setModalDomain(null)}
              aria-label="Close"
              className="absolute top-2 right-2 px-2 py-1 text-white/70 hover:text-white"
            >×</button>
            <div className="p-6">
              <div className="mb-3 text-xl font-bold flex items-center" style={{ color: accentColor }}>
                {imageMap[modalDomain as DomainKey] ? (
                  <Image src={encodeURI(imageMap[modalDomain as DomainKey])} alt="" width={40} height={40} className="w-10 h-10 mr-3 object-cover" quality={95} />
                ) : (
                  <span className="mr-2" aria-hidden="true">{emojiMap[modalDomain as DomainKey]}</span>
                )}
                {DOMAINS[modalDomain].label.split(' (')[0]}
              </div>
              <div style={{ maxHeight: 360, overflow: 'auto' }}>
            {(() => {
                  const payload = (fullResults || []).find((r:any)=> r?.domain===modalDomain)?.payload;
                  return payload ? renderDomainSummary(modalDomain, payload) : (
                    <p className="text-white/70 text-sm">No data for this domain.</p>
                  );
            })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {previewModal && (
        <PaidContentPreviewModal
          {...previewModal}
          onClose={() => setPreviewModal(null)}
        />
      )}

      

      

      

      {/* Conflict Patterns (removed for ID page) */}
      {false ? (()=>{
        const facets: Array<{domain:DomainKey; facet:string; raw:number; bucket:'High'|'Medium'|'Low'}> = [];
        for (const d of ['O','C','E','A','N'] as DomainKey[]){
          const payload = (fullResults?.find(r=> r.domain===d) || ({} as any)).payload;
          if (!payload) continue;
          const A_raw = (payload?.phase2?.A_raw || {}) as Record<string, number>;
          const bucket = (payload?.final?.bucket || {}) as Record<string,'High'|'Medium'|'Low'>;
          for (const f of canonicalFacets(d)){
            const raw = Number(A_raw?.[f] ?? 3);
            const b = (bucket?.[f] as any) as 'High'|'Medium'|'Low' || 'Medium';
            facets.push({ domain:d, facet:f, raw, bucket: b });
          }
        }
        const cards = selectFiveCards(facets).filter((c:any)=> c.type==='conflict');
        if (!cards.length) return null;
        return (
          <div className="mt-10">
            <h2 className="text-xl font-bold mb-3" style={{ color: accentColor }}>Conflict Patterns</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cards.map((card:any, i:number)=>{
                const avgPct = card.leftPct && card.rightPct ? (card.leftPct + card.rightPct)/2 : 50;
                const stars = avgPct >= 80 ? 5 : avgPct >= 60 ? 4 : avgPct >= 40 ? 3 : avgPct >= 20 ? 2 : 1;
                const locked = false; // unlocking all conflict cards
                return (
                  <div key={i} className="relative rounded-lg border border-white/10 bg-white/5 p-4" style={neonBorderStyle()}>
                    <div className={locked ? "opacity-20 blur-2xl pointer-events-none select-none" : ""}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{card.facet}</h3>
                        <Stars count={stars} />
                      </div>
                      {typeof card.explanation === 'string' ? (
                        <p className="text-white/90 text-sm mb-2">{card.explanation}</p>
                      ) : null}
                      {typeof card.friction === 'string' ? (
                        <p className="text-white/80 text-xs mb-3">{card.friction}</p>
                      ) : null}
                      {typeof card.how_can_both_be_true === 'string' ? (
                        <div className="rounded-md border border-white/10 bg-black/30 p-3">
                          <div className="text-xs text-white/60 mb-1">How can both be true?</div>
                          <p className="text-white/90 text-sm">{card.how_can_both_be_true}</p>
                        </div>
                      ) : null}
                    </div>
                    {null}
                  </div>
                );
              })}
      </div>
            {/* Existential Circuits (removed for ID page) */}
            <div className="mt-8" id="existential-circuits" style={{ display:'none' }}>
              <div className="gz-theme container" style={{
                ['--bg-color' as any]: '#121212',
                ['--surface-color' as any]: '#1e1e1e',
                ['--primary-text-color' as any]: '#e0e0e0',
                ['--secondary-text-color' as any]: '#a0a0a0',
                ['--accent-color' as any]: accentColor || '#4cafef',
                ['--border-color' as any]: '#333',
                ['--progress-green' as any]: '#2ecc71',
                ['--progress-yellow' as any]: '#f1c40f',
                ['--progress-red' as any]: '#e74c3c',
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0'
              }}>
                <ExistentialCircuits domainMeans={whoData?.derived?.domainMeans} fullResults={fullResults as any} />
                {null}
                <div className="mt-6" style={{display:'flex', justifyContent:'center', gap:70, flexWrap:'wrap'}}>
                  <a href={`/results${rid?`?rid=${rid}`:''}`} className="btn btn-gold" style={{
                    border: '2px solid #d4af37',
                    boxShadow: '0 0 12px rgba(212, 175, 55, 0.5), 0 4px 16px rgba(0,0,0,0.3)',
                    padding: '10px 18px',
                    borderRadius: 8,
                    color: 'white'
                  }}>View Full Results →</a>
                  <a href={`/arctyps-duals${rid?`?rid=${rid}`:''}`} className="btn btn-gold" style={{
                    border: '2px solid #d4af37',
                    boxShadow: '0 0 12px rgba(212, 175, 55, 0.5), 0 4px 16px rgba(0,0,0,0.3)',
                    padding: '10px 18px',
                    borderRadius: 8,
                    color: 'white'
                  }}>Arctyps Duals →</a>
                </div>
              </div>
            </div>
      </div>
        );
      })() : null}
      
        </div>
      </div>
      
    </main>
  );
}

export default function YourIdPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <YourIdContent />
    </Suspense>
  );
}
