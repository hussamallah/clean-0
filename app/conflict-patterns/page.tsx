'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { canonicalFacets, DOMAINS, FACET_INTERPRETATIONS, type DomainKey } from '@/lib/bigfive/constants';
import { selectFiveCards } from '@/lib/bigfive/fiveCardSelector';

const Stars = ({ count }:{ count:number }) => (
  <div className="flex gap-1">
    {Array.from({length:5}).map((_,i)=> (
      <span key={i} className={i < count ? 'text-brand' : 'text-ink-soft/40'}>★</span>
    ))}
  </div>
);

function ConflictContent(){
  const search = useSearchParams();
  const rid = search.get('rid');
  const [fullResults, setFullResults] = useState<Array<{domain:DomainKey; payload:any}>|null>(null);
  const [accentColor, setAccentColor] = useState('#C48A2A');

  function neonBorderStyle(){
    const glow = 'rgba(196,138,42,0.25)';
    const wide = 'rgba(196,138,42,0.12)';
    const border = 'rgba(196,138,42,0.35)';
    return { borderColor: border, boxShadow: `0 0 10px ${glow}, 0 0 20px ${glow}, 0 0 40px ${wide}` } as any;
  }

  useEffect(()=>{
    (async ()=>{
      try{
        if (!rid) return;
        const res = await fetch(`/api/who/${rid}`, { cache: 'no-store' });
        const data = await res.json();
        setFullResults(Array.isArray(data?.results) ? (data.results as any) : null);
      } catch {}
    })();
  },[rid]);

  if (!rid) return <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Missing rid</div>;
  if (!fullResults) return <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Loading…</div>;

  const facets: Array<{domain:DomainKey; facet:string; raw:number; bucket:'High'|'Medium'|'Low'}> = [];
  for (const d of ['O','C','E','A','N'] as DomainKey[]){
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

  return (
    <main className="min-h-screen bg-canvas text-ink p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-2xl font-semibold text-brand-deep">War Room</h1>
        <p className="text-sm text-ink-muted mt-1">Conflict patterns & internal friction</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {cards.map((card:any, i:number)=>{
            const avgPct = card.leftPct && card.rightPct ? (card.leftPct + card.rightPct)/2 : 50;
            const stars = avgPct >= 80 ? 5 : avgPct >= 60 ? 4 : avgPct >= 40 ? 3 : avgPct >= 20 ? 2 : 1;
            return (
              <div key={i} className="rounded-lg border border-line bg-surface p-4 shadow-soft" style={neonBorderStyle()}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-ink">{card.facet}</h3>
                  <Stars count={stars} />
                </div>
                {typeof card.explanation === 'string' ? (
                  <p className="text-ink text-sm mb-2">{card.explanation}</p>
                ) : null}
                {typeof card.friction === 'string' ? (
                  <p className="text-ink-muted text-xs mb-3">{card.friction}</p>
                ) : null}
                {typeof card.how_can_both_be_true === 'string' ? (
                  <div className="rounded-md border border-line bg-surface-muted p-3">
                    <div className="text-xs text-ink-muted mb-1">How can both be true?</div>
                    <p className="text-ink text-sm">{card.how_can_both_be_true}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-ink-muted">These are your top conflict patterns. They represent the core tensions that shape your behavior, especially under pressure.</p>
        </div>

      </div>
    </main>
  );
}

export default function ConflictPatternsPage(){
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Loading…</div>}>
      <ConflictContent />
    </Suspense>
  );
}

