'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { DOMAINS, canonicalFacets, FACET_INTERPRETATIONS, type DomainKey } from '@/lib/bigfive/constants';

function SummaryContent(){
  const searchParams = useSearchParams();
  const rid = searchParams.get('rid');
  const [fullResults, setFullResults] = useState<Array<{domain:DomainKey; payload:any}>|null>(null);
  const [modalDomain, setModalDomain] = useState<DomainKey|null>(null);
  const [accentColor, setAccentColor] = useState<string>('#d4af37');

  useEffect(()=>{
    if (!rid) return;
    (async ()=>{
      try{
        const res = await fetch(`/api/who/${rid}`, { cache: 'no-store' });
        const data = await res.json();
        setFullResults(Array.isArray(data?.results) ? (data.results as any) : null);
      } catch {}
    })();
  },[rid]);

  function neonBorderStyle(){
    const glow = 'rgba(212,175,55,0.6)';
    const wide = 'rgba(212,175,55,0.25)';
    const border = 'rgba(212,175,55,0.5)';
    return { borderColor: border, boxShadow: `0 0 10px ${glow}, 0 0 20px ${glow}, 0 0 40px ${wide}` } as any;
  }

  function renderDomainSummary(d: DomainKey, payload: any){
    const facets = canonicalFacets(d);
    const bucket = (payload?.final?.bucket || {}) as Record<string,'High'|'Medium'|'Low'>;
    const A_raw = (payload?.phase2?.A_raw || {}) as Record<string, number>;
    const domain_mean_raw = Number(payload?.final?.domain_mean_raw ?? 3);
    const lvlKey = (domain_mean_raw >= 4 ? 'high' : (domain_mean_raw <= 2 ? 'low' : 'medium')) as 'high'|'medium'|'low';
    const levelMeaning: Record<'high'|'medium'|'low', string> = {
      high: 'You can access this trait easily and consistently.',
      medium: 'You can turn this trait on when needed, but it isn’t your default.',
      low: d==='N' ? 'You keep an even keel and recover quickly under pressure.' : 'This trait stays in the background unless the situation forces it.'
    };
    const firstSentence = (txt:string|undefined)=> txt ? (txt.split(/(?<=\.)\s+/)[0] || txt).trim() : '';
    const highs = facets.filter(f=> bucket[f]==='High').sort((a,b)=> (A_raw[b]-A_raw[a])).slice(0,2);
    const mids  = facets.filter(f=> bucket[f]==='Medium').sort((a,b)=> (Math.abs(3-(A_raw[a]??3)) - Math.abs(3-(A_raw[b]??3)))).slice(0,2);
    const lows  = facets.filter(f=> bucket[f]==='Low').sort((a,b)=> (A_raw[a]-A_raw[b])).slice(0,2);

    return (
      <div className="text-sm text-white/90 leading-relaxed">
        <div className="mb-1">Your overall level is <b className="capitalize">{lvlKey}</b>. {levelMeaning[lvlKey]}</div>
        <div className="mb-2">Domain average: <b>{domain_mean_raw.toFixed(2)} / 5</b></div>
        {highs.length ? (
          <div className="mb-2">
            <div className="text-white/70 mb-1">Strong behavior levers</div>
            <ul className="list-disc pl-4">
              {highs.map(name=> (
                <li key={name}><b>{name}</b>: {firstSentence((FACET_INTERPRETATIONS as any)[d][name]?.[(d==='N'?'low':'high')])}</li>
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
        {lows.length ? (
          <div className="mb-1">
            <div className="text-white/70 mb-1">Development levers</div>
            <ul className="list-disc pl-4">
              {lows.map(name=> (
                <li key={name}><b>{name}</b>: {firstSentence((FACET_INTERPRETATIONS as any)[d][name]?.[(d==='N'?'high':'low')])}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  const imageMap: Record<DomainKey, string> = {
    A: '/agree.png',
    C: '/conci.png',
    E: '/extra.png',
    N: '/neur.png',
    O: '/open.png'
  };

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8 pb-8">
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold" style={{ color: accentColor }}>Summary</h1>
      </div>
      <div className="flex justify-center px-4 mb-2">
        <div className="w-full max-w-[1600px] flex items-center justify-center gap-4 flex-wrap">
          {(['O','C','E','A','N'] as DomainKey[]).map((d)=>{
            const domainName = DOMAINS[d].label.split(' (')[0];
            return (
              <button
                key={d}
                onClick={()=> setModalDomain(d)}
                aria-label={domainName}
                title={`${domainName} — click to view summary`}
                className="p-0 bg-transparent border-0 flex items-center justify-center group cursor-pointer"
                style={{ color: '#d4af37' }}
              >
                {imageMap[d] ? (
                  <Image src={encodeURI(imageMap[d])} alt={domainName} width={160} height={112} className="w-40 h-28 md:w-48 md:h-32 object-contain bg-transparent transition-transform duration-150 group-hover:scale-[1.05]" quality={95} />
                ) : (
                  <span role="img" aria-hidden="true">⭐</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
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
                  <span className="mr-2" aria-hidden="true">⭐</span>
                )}
                {DOMAINS[modalDomain].label.split(' (')[0]}
              </div>
              <div style={{ maxHeight: 360, overflow: 'auto' }}>
                {(()=>{
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
    </main>
  );
}

export default function SummaryPage(){
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <SummaryContent />
    </Suspense>
  );
}


