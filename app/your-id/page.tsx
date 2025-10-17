'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import archetypeRules from "@/arctyps rules.json";
import fpBank from "@/lib/data/field_presence_bank_v1_1.json";

// Helper function to convert hex to rgba
const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || hex.length < 7) return `rgba(76, 175, 239, ${alpha})`; // Default color if hex is invalid
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Tiny star renderer
const Stars = ({ count }:{ count:number }) => (
  <div className="flex gap-1">
    {Array.from({length:5}).map((_,i)=> (
      <span key={i} className={i < count ? 'text-yellow-300' : 'text-white/20'}>★</span>
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

// Pull cards from the provided bank
const fpCards: any[] = ((fpBank as any)?.sections || []).find((s: any) => s?.id === 'field_presence')?.cards || [];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.365 2.446a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.365-2.446a1 1 0 00-1.175 0l-3.365 2.446c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.07 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
      </svg>
    ))}
  </div>
);

function YourIdContent() {
  const searchParams = useSearchParams();
  const rid = searchParams.get('rid');
  const [accentColor, setAccentColor] = useState('');
  const [archetypeName, setArchetypeName] = useState<string>('');
  const [domainMeans, setDomainMeans] = useState<Record<DomainKey, number> | null>(null);
  const [facetBuckets, setFacetBuckets] = useState<Record<DomainKey, Record<string,'High'|'Medium'|'Low'>> | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  // Debug logging for card selection and data
  console.log('Override Page Debug - Available Cards:', {
    totalCards: fpCards.length,
    cardTitles: fpCards.map(c => c?.title || c?.id),
    cardIds: fpCards.map(c => c?.id)
  });
  
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

        // Extract domain means and facet buckets
        const dm = extractDomainMeansNormalized(data);
        const fb = extractFacetBuckets(data);
        setDomainMeans(dm);
        setFacetBuckets(fb);
        console.log('Override Page Debug - Extracted Means and Buckets:', { dm, fb });
        setIsReady(true);
      } catch {}
    })();
  }, [rid]);

  if (!isReady) return null;

  const glowColor = hexToRgba(accentColor || '#000000', 0.7);
  const cardBgColor = hexToRgba(accentColor || '#000000', 0.1);

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="text-center mb-8">
        {archetypeName && (
          <img 
            src={`/${archetypeName.toLowerCase()}.png`} 
            alt={`${archetypeName} emblem`} 
            className="h-48 w-48 mx-auto object-contain"
          />
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fpCards.map((card: any, index: number) => {
          // Debug each card's calculation logic
          console.log(`Override Card ${index + 1} Debug:`, {
            cardTitle: card?.title || card?.id,
            cardId: card?.id,
            bigFiveMap: card?.big_five_map,
            content: card?.content,
            hasFacetBuckets: !!facetBuckets,
            hasDomainMeans: !!domainMeans
          });
          
          return (
            <div
              key={index}
              className="rounded-lg p-6 border border-white/10 relative overflow-hidden"
              style={{ backgroundColor: cardBgColor, boxShadow: `0 0 20px ${glowColor}, 0 0 40px ${glowColor}`, paddingBottom: 8 }}
            >
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold" style={{ color: accentColor }}>{card?.title || card?.id}</h2>
              </div>
              {(() => {
                const avg = facetBuckets ? computeCardAvg(card, {__type:'facetBuckets', map: facetBuckets}) : computeCardAvg(card, domainMeans);
                const stars = starsForAvg(avg);
                console.log(`Override Card ${index + 1} - Stars Calculation:`, {
                  cardTitle: card?.title || card?.id,
                  average: avg,
                  stars: stars,
                  calculationMethod: facetBuckets ? 'facetBuckets' : 'domainMeans'
                });
                return (
                  <div className="mb-2">
                    <Stars count={stars} />
                  </div>
                );
              })()}
            {(() => {
              const level = scoreCardLevel(card, facetBuckets ? {__type:'facetBuckets', map: facetBuckets} : domainMeans);
              const txt = card?.content?.[level];
              console.log(`Override Card ${index + 1} - Content Selection:`, {
                cardTitle: card?.title || card?.id,
                level: level,
                contentText: txt,
                availableLevels: Object.keys(card?.content || {})
              });
              return txt ? (
                <p className="text-white/90 mb-3">{txt}</p>
              ) : null;
            })()}
            {(() => {
              const maps: any[] = Array.isArray(card?.big_five_map) ? card.big_five_map : [];
              const facets: Array<{ facet:string; dir:string }> = [];
              
              console.log(`Override Card ${index + 1} - Facet Mapping:`, {
                cardTitle: card?.title || card?.id,
                maps: maps,
                facetBuckets: facetBuckets
              });
              
              for (const m of maps){
                const dir = String(m?.direction || 'direct');
                const domainKey = domainToKey[m?.domain || ''] as DomainKey;
                console.log(`Override Card ${index + 1} - Map:`, {
                  cardTitle: card?.title || card?.id,
                  domain: m?.domain,
                  domainKey: domainKey,
                  direction: dir,
                  facets: m?.facets,
                  facetBucketsForDomain: facetBuckets?.[domainKey]
                });
                
                (Array.isArray(m?.facets) ? m.facets : []).forEach((f: string)=> {
                  const canon = FACET_SYNONYMS[domainKey]?.[normFacetLabel(f)] || f;
                  const bucket = facetBuckets?.[domainKey]?.[canon];
                  console.log(`Override Card ${index + 1} - Facet:`, {
                    cardTitle: card?.title || card?.id,
                    originalFacet: f,
                    canonicalFacet: canon,
                    bucket: bucket,
                    domain: domainKey,
                    direction: dir
                  });
                  facets.push({ facet: f, dir });
                });
              }
              
              const dirToArrow = (d:string)=> d==='inverse' ? '↓' : d==='support' ? '→' : '↑';
              const dirToColor = (d:string)=> d==='inverse' ? 'text-red-400' : d==='support' ? 'text-yellow-300' : 'text-green-400';
              return (
                <div className="mt-2 flex flex-wrap gap-2 overflow-hidden" style={{maxHeight:'3.2rem'}}>
                  {facets.map((it, i)=> (
                    <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 text-white/90 text-xs max-w-[180px] truncate">
                      <span className={`${dirToColor(it.dir)} leading-none`}>{dirToArrow(it.dir)}</span>
                      <span className="truncate">{it.facet}</span>
                    </span>
                  ))}
                </div>
              );
            })()}
          </div>
          );
        })}
      </div>
      <div className="text-center mt-8">
        <Link href={`/who?rid=${rid}`} className="text-indigo-400 hover:text-indigo-300">&larr; Back to Who Page</Link>
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
