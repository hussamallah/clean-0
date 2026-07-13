"use client";
import { useMemo, useState, useEffect } from "react";
import { DOMAINS, FACET_DESCRIPTIONS, FACET_INTERPRETATIONS, DOMAIN_DESCRIPTIONS, canonicalFacets } from "@/lib/bigfive/constants";
import oneSentence from "@/one-sentence-summary.json";
import { stableStringify, getFacetScoreLevel, getScoreLevel } from "@/lib/bigfive/format";

type DomainKey = keyof typeof DOMAINS;

const DOMAIN_META: Record<DomainKey, { color: string; icon: React.ReactNode; number: string }> = {
  O: { 
    color: '#fbbf24', 
    number: '01',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  C: { 
    color: '#3b82f6', 
    number: '02',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    )
  },
  E: { 
    color: '#a855f7', 
    number: '03',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  A: { 
    color: '#10b981', 
    number: '04',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  N: { 
    color: '#ef4444', 
    number: '05',
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    )
  }
};

export default function DetailedResults({ data, suiteHash, verifyStatus, onVerify }:{ data: Array<{domain:DomainKey; payload:any}>, suiteHash: string | null, verifyStatus:'idle'|'ok'|'fail', onVerify: ()=>void }){
  const [selectedDomain, setSelectedDomain] = useState<DomainKey | null>(null);

  if (!data) return <div className="text-center p-8">Loading results...</div>;
  const order: DomainKey[] = ['O','C','E','A','N'];
  const byDomain = useMemo(()=>{
    const m = new Map<DomainKey, any>();
    for (const r of data){ m.set(r.domain, r.payload); }
    return m;
  }, [data]);

  const handleDomainSelect = (domain: DomainKey) => {
    // If the clicked domain is already selected, unselect it (toggle off)
    if (selectedDomain === domain) {
      setSelectedDomain(null);
    } else {
    setSelectedDomain(domain);
    setTimeout(() => {
      const element = document.getElementById('detail-panel');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="relative mb-16 flex min-h-[400px] flex-col transition-all duration-500">
        {selectedDomain ? (
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setSelectedDomain(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-soft hover:bg-surface-muted"
            >
              ← Back to all traits
            </button>
          </div>
        ) : (
          <div className="mb-8 text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">Traits</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Select a domain</h2>
            <p className="mt-2 text-sm text-ink-muted">Explore facet scores for each Big Five area.</p>
          </div>
        )}

        <div
          className={`transition-all duration-500 ${
            selectedDomain
              ? 'flex flex-col items-center pt-0'
              : 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
          }`}
        >
          {order.map((d) => {
            const payload = byDomain.get(d);
            if (!payload) return null;
            if (selectedDomain && selectedDomain !== d) return null;

            return (
              <DomainCard
                key={d}
                d={d}
                payload={payload}
                isActive={selectedDomain === d}
                onClick={() => handleDomainSelect(d)}
              />
            );
          })}
        </div>

        {selectedDomain ? (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setSelectedDomain(null)}
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-soft hover:bg-surface-muted"
            >
              ← Back to all traits
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DomainCard({ d, payload, isActive, onClick }: { d: DomainKey, payload: any, isActive: boolean, onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  const [expandedFacets, setExpandedFacets] = useState<Record<string, boolean>>({});
  
  const meta = DOMAIN_META[d];
  const domainName = DOMAINS[d].label.split(' (')[0];
  const domain_mean_raw = payload.final.domain_mean_raw;
  const percentage = (domain_mean_raw / 5) * 100;
  const lvlKeyFull = (getScoreLevel as any)(domain_mean_raw) as 'high'|'neutral'|'low';
  const shortDesc = DOMAIN_DESCRIPTIONS[d].shortDescription;
  const personalizedDesc = DOMAIN_DESCRIPTIONS[d].results[lvlKeyFull];
  
  const facets = canonicalFacets(d);
  const facetScores = facets.map(f => ({
    name: f,
    score: (payload.phase2.A_raw as any)[f],
    stars: Math.round((payload.phase2.A_raw as any)[f])
  }));

  const isExpanded = isActive;

  const toggleFacet = (e: React.MouseEvent, facetName: string) => {
    e.stopPropagation();
    setExpandedFacets(prev => ({
      ...prev,
      [facetName]: !prev[facetName]
    }));
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-expanded={isExpanded}
      className={`group relative cursor-pointer overflow-hidden rounded-panel border bg-surface p-6 shadow-soft transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${isExpanded ? 'w-full max-w-2xl' : 'w-full'}`}
      style={{
        borderTopWidth: 3,
        borderTopColor: meta.color,
      }}
    >
      <div className="relative z-10 mb-4">
        <div className="mb-2 transition-colors duration-300" style={{ color: isExpanded || isHovered ? meta.color : '#8A929C' }}>
          {meta.icon}
        </div>
        
        <h3 
          className={`mb-2 font-display font-semibold tracking-tight text-ink transition-all duration-300 ${
            domainName.length > 10 ? 'text-lg' : 'text-xl'
          }`}
        >
          {domainName}
        </h3>

        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div 
            className="h-1.5 rounded-full transition-all duration-700 ease-out"
              style={{ 
                width: `${percentage}%`, 
                backgroundColor: meta.color,
              }}
            />
          </div>

        <div 
          className={`mt-4 text-sm font-medium text-ink-muted transition-all duration-300 ${
            isExpanded ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'
          }`}
        >
          {shortDesc}
        </div>
        </div>
        
      <div 
        className={`relative z-10 grid transition-[grid-template-rows] duration-500 ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div 
            className={`transition-all duration-500 ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <p className="mb-6 border-l-2 pl-4 text-sm leading-relaxed text-ink-muted" style={{ borderColor: `${meta.color}80` }}>
              {personalizedDesc}
          </p>
          
            <ul className="space-y-3 border-t border-line pt-6">
               {facetScores.map(f => {
                 const facetScoreLevel = getFacetScoreLevel(f.score);
                 const interp = (FACET_INTERPRETATIONS as any)[d][f.name][facetScoreLevel];
                 const isFacetExpanded = !!expandedFacets[f.name];
                 
                 const lvlCap = (facetScoreLevel.charAt(0).toUpperCase() + facetScoreLevel.slice(1)) as 'High'|'Medium'|'Low';
                 const summaryText = (oneSentence as any)?.[domainName]?.[f.name]?.[lvlCap] as string | undefined;

                 return (
                  <li key={f.name}>
                    <button
                      type="button"
                      onClick={(e) => toggleFacet(e, f.name)}
                      className="flex w-full cursor-pointer flex-col gap-2 rounded-xl border border-line bg-canvas p-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                      aria-expanded={isFacetExpanded}
                    >
                     <div className="flex w-full items-center justify-between">
                       <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                         {f.name}
                         <span className="text-ink-soft" aria-hidden>{isFacetExpanded ? '▾' : '▸'}</span>
                       </span>
                       <div className="flex gap-0.5" aria-label={`${f.stars} out of 5`}>
                         {Array.from({length: 5}).map((_, i) => (
                             <span 
                               key={i} 
                               style={{ color: i < f.stars ? meta.color : '#E2E6EB' }}
                               className="text-sm"
                               aria-hidden
                             >
                               ★
                             </span>
                         ))}
                       </div>
                     </div>
                     
                     <div className="mt-1 text-sm leading-relaxed text-ink">
                       {isFacetExpanded ? (
                         <div>
                           <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink-soft">Detailed analysis</span>
                           <span className="text-ink-muted">{typeof interp === 'string' ? interp : interp?.long || interp?.short || ''}</span>
                         </div>
                       ) : (
                         <span className="text-ink-muted">
                             {summaryText || 'Open for detailed analysis'}
                         </span>
                       )}
                     </div>
                    </button>
                  </li>
                 );
               })}
            </ul>
          </div>
        </div>
      </div>

      {!isExpanded ? (
        <div className="mt-4 text-center text-xs font-medium text-ink-soft">
          Tap to open
        </div>
      ) : null}
    </div>
  );
}

export function ResultsPanel({ payload, domainColor }:{ payload:any, domainColor?: string }){
  const d = payload.domain as DomainKey;
  const final = payload.final;
  const A_pct = final.A_pct;
  const bucket = final.bucket;
  const order = final.order as string[];
  const domain_mean_raw = final.domain_mean_raw as number;
  const domain_mean_pct = final.domain_mean_pct as number;
  const facets = canonicalFacets(d);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [hover, setHover] = useState<Record<string, boolean>>({});
  
  // No auto-expansion; all facet cards start collapsed for consistency
  function oxford(list: string[]): string {
    if (list.length === 0) return '';
    if (list.length === 1) return list[0];
    if (list.length === 2) return `${list[0]} and ${list[1]}`;
    return `${list.slice(0,-1).join(', ')}, and ${list[list.length-1]}`;
  }
  function firstSentence(text: string): string {
    const idx = text.indexOf('.');
    if (idx === -1) return text;
    return text.slice(0, idx + 1);
  }
  function firstNSentences(text: string, n: number): string {
    const parts = text.split(/(?<=\.)\s+/).filter(Boolean);
    return parts.slice(0, Math.max(1, Math.min(n, parts.length))).join(' ');
  }
  function buildSummary(): JSX.Element {
    const domainName = DOMAINS[d].label.split(' (')[0];
    const lvlKey = (getScoreLevel as any)(domain_mean_raw).replace('neutral','medium') as 'high'|'medium'|'low';
    const levelMeaning: Record<'high'|'medium'|'low', string> = {
      high: 'You can access this trait easily and consistently.',
      medium: 'You can turn this trait on when needed, but it isn’t your default.',
      low: 'This trait stays in the background unless the situation forces it.'
    };
    const highs = facets.filter(f => (bucket as any)[f] === 'High').sort((a,b)=> (payload.phase2.A_raw[b]-payload.phase2.A_raw[a])).slice(0,2);
    const mids = facets.filter(f => (bucket as any)[f] === 'Medium').sort((a,b)=> (Math.abs(3 - payload.phase2.A_raw[a]) - Math.abs(3 - payload.phase2.A_raw[b]))).slice(0,2);
    const lows = facets.filter(f => (bucket as any)[f] === 'Low').sort((a,b)=> (payload.phase2.A_raw[a]-payload.phase2.A_raw[b])).slice(0,2);
    const exampleHigh = highs[0];
    const exampleLow = lows[0];
    return (
      <div>
        <h3>{domainName} — Summary</h3>
        <p style={{marginTop:6}}>Your overall level is <b>{lvlKey.charAt(0).toUpperCase()+lvlKey.slice(1)}</b>. {levelMeaning[lvlKey]}</p>
        <p>Domain average: <b>{domain_mean_raw.toFixed(2)} / 5</b> (average of your behavior ratings).</p>
        {highs.length ? (
          <div style={{marginTop:10}}>
            <div style={{fontWeight:600}}>Strong behavior levers</div>
            <ul style={{margin:'4px 0 0', paddingLeft:18}}>
              {highs.map(name => (
                <li key={name}><b>{name}</b>: {firstSentence((FACET_INTERPRETATIONS as any)[d][name].high)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {mids.length ? (
          <div style={{marginTop:12}}>
            <div style={{fontWeight:600}}>Workable levers</div>
            <ul style={{margin:'4px 0 0', paddingLeft:18}}>
              {mids.map(name => (
                <li key={name}><b>{name}</b>: {firstSentence((FACET_INTERPRETATIONS as any)[d][name].medium)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {lows.length ? (
          <div style={{marginTop:12}}>
            <div style={{fontWeight:600}}>Development levers</div>
            <ul style={{margin:'4px 0 0', paddingLeft:18}}>
              {lows.map(name => (
                <li key={name}><b>{name}</b>: {firstSentence((FACET_INTERPRETATIONS as any)[d][name].low)}</li>
              ))}
            </ul>
          </div>
        ) : null}
        
      </div>
    );
  }
  return (
    <div>
      <div className="grid cols-2 mt16">
        {order.map(f=>{
          const b = (bucket as any)[f] as 'High'|'Medium'|'Low';
          const cls = b.toLowerCase();
          const pctVal = (A_pct as any)[f];
          const facetRaw = (payload.phase2.A_raw as any)[f];
          const facetScoreLevel = getFacetScoreLevel(facetRaw);
          const desc = (FACET_DESCRIPTIONS as any)[d][f] || "";
          const interp = (FACET_INTERPRETATIONS as any)[d][f][facetScoreLevel] || "";
          const isOpen = !!open[f];
          const stars = Math.round(facetRaw);
          const full = Array.from({length: Math.max(0, Math.min(5, stars))});
          const empty = Array.from({length: Math.max(0, 5 - Math.max(0, Math.min(5, stars)))});
          const isHovered = !!hover[f];
          return (
            <div
              key={f}
              className="card"
              title="Click to expand"
              style={{
                cursor:'pointer', 
                borderColor: isHovered ? domainColor : undefined,
                boxShadow: isHovered ? `0 0 20px ${domainColor}20` : undefined,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={()=> setHover(h=> ({...h, [f]: true}))}
              onMouseLeave={()=> setHover(h=> ({...h, [f]: false}))}
              onClick={()=> setOpen(o=> ({...o, [f]: !o[f]}))}
            >
              <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}} aria-expanded={isOpen}>
                <div>
                  <b style={{ color: isHovered ? domainColor : '#fff', transition: 'color 0.3s ease' }}>{f}</b>
                  <span className="muted" style={{marginLeft:6}}>{isOpen ? '▾' : '▸'}</span>
                </div>
                <div className={`badge ${cls}`}>{b}</div>
              </div>
              <div className="row mt8" style={{alignItems:'center', gap:6}}>
                <div aria-label={`Rating ${stars} out of 5`}>
                  {full.map((_,i)=>(<span key={`fs-${i}`} style={{color: domainColor || '#f1c40f', fontSize:16}}>★</span>))}
                  {empty.map((_,i)=>(<span key={`es-${i}`} style={{color:'#2a2f38', fontSize:16}}>☆</span>))}
                </div>
              </div>
              {(() => {
                if (isOpen) return null; // hide one-sentence/measure summary when expanded
                const domainName = DOMAINS[d].label.split(' (')[0];
                const lvlCap = (facetScoreLevel.charAt(0).toUpperCase()+facetScoreLevel.slice(1)) as 'High'|'Medium'|'Low';
                const summaryText = (oneSentence as any)?.[domainName]?.[f]?.[lvlCap] as string | undefined;
                if (summaryText) {
                  return (
                    <div style={{marginTop:8}}>
                      <div style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 8,
                        padding: '10px 12px',
                        color: '#e6f0ff',
                        fontSize: 13,
                        lineHeight: 1.5
                      }}>
                        <span style={{marginRight:6}}>💡</span>{summaryText}
                      </div>
                    </div>
                  );
                }
                return desc ? (
                  <div style={{marginTop:8}}>
                    <div style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      color: '#c9d6ea',
                      fontSize: 12,
                      lineHeight: 1.4
                    }}>
                      <strong style={{color:'#e2ebff'}}>What this measures:</strong> {desc}
                    </div>
                  </div>
                ) : null;
              })()}
              {!isOpen ? (
                <div style={{
                  marginTop: 12,
                  fontSize: 15,
                  color: '#f1c40f',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  Press to reveal
                </div>
              ) : null}
              {(() => {
                if (!isOpen) return null;
                let displayInterp = interp as string | undefined;
                // Specific copy override: Openness → Artistic Interests → High
                if (d === 'O' && f === 'Artistic Interests' && facetScoreLevel === 'high') {
                  displayInterp = 'You have a deep appreciation for beauty in all its forms. You actively seek out artistic experiences and find great meaning in art, music, literature, and natural beauty. These experiences often move you deeply.';
                }
                return displayInterp ? (
                  <div style={{marginTop:6,fontSize:12,color:'#d6e5ff',lineHeight:1.4,fontStyle:'italic'}}>
                    <strong>Detailed Results:</strong> {displayInterp}
                  </div>
                ) : null;
              })()}
            </div>
          );
        })}
      </div>
      

      
    </div>
  );
}


