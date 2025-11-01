"use client";
import { useMemo, useState, useEffect } from "react";
import { DOMAINS, FACET_DESCRIPTIONS, FACET_INTERPRETATIONS, DOMAIN_DESCRIPTIONS, canonicalFacets } from "@/lib/bigfive/constants";
import oneSentence from "@/one-sentence-summary.json";
import { stableStringify, getFacetScoreLevel, getScoreLevel } from "@/lib/bigfive/format";

type DomainKey = keyof typeof DOMAINS;

export default function DetailedResults({ data, suiteHash, verifyStatus, onVerify }:{ data: Array<{domain:DomainKey; payload:any}>, suiteHash: string | null, verifyStatus:'idle'|'ok'|'fail', onVerify: ()=>void }){
  const [hoveredDomain, setHoveredDomain] = useState<DomainKey | null>(null);

  if (!data) return <div className="text-center p-8">Loading results...</div>;
  const order: DomainKey[] = ['O','C','E','A','N'];
  const byDomain = useMemo(()=>{
    const m = new Map<DomainKey, any>();
    for (const r of data){ m.set(r.domain, r.payload); }
    return m;
  }, [data]);

  const scrollToDomain = (domain: DomainKey) => {
    const element = document.getElementById(`domain-${domain}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      <div className="mb-6">
        <p className="text-center text-white/70 text-sm mb-4">
          Click any trait below to jump to its detailed results
        </p>
        <div className="flex flex-wrap justify-center items-center gap-3 my-4">
          {order.map(d => {
            const isHovered = hoveredDomain === d;
            return (
              <button 
                key={d} 
                onClick={()=> scrollToDomain(d)}
                onMouseEnter={()=> setHoveredDomain(d)}
                onMouseLeave={()=> setHoveredDomain(null)}
                style={{
                  background: isHovered ? '#d4af37' : '#1a1a1a',
                  color: isHovered ? '#000' : '#fff',
                  border: isHovered ? '2px solid #d4af37' : '2px solid rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  boxShadow: isHovered ? '0 0 12px rgba(212, 175, 55, 0.5)' : 'none',
                  transform: isHovered ? 'translateY(-2px)' : 'none',
                }}
              >
                {DOMAINS[d].label.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>
      
      {order.map(d => {
        const payload = byDomain.get(d);
        if (!payload) return null;
        const domainName = DOMAINS[d].label.split(' (')[0];
        
        return (
          <div key={d} id={`domain-${d}`} style={{ scrollMarginTop: '80px' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '700',
              marginTop: '32px',
              marginBottom: '16px',
              color: '#fff',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              {domainName}
            </h2>
            <div className="card mt16">
              <ResultsPanel payload={payload} />
            </div>
          </div>
        );
      })}
      
    </div>
  );
}

export function ResultsPanel({ payload }:{ payload:any }){
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
              style={{cursor:'pointer', borderColor: isHovered ? '#2a3240' : undefined}}
              onMouseEnter={()=> setHover(h=> ({...h, [f]: true}))}
              onMouseLeave={()=> setHover(h=> ({...h, [f]: false}))}
              onClick={()=> setOpen(o=> ({...o, [f]: !o[f]}))}
            >
              <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}} aria-expanded={isOpen}>
                <div>
                  <b>{f}</b>
                  <span className="muted" style={{marginLeft:6}}>{isOpen ? '▾' : '▸'}</span>
                </div>
                <div className={`badge ${cls}`}>{b}</div>
              </div>
              <div className="row mt8" style={{alignItems:'center', gap:6}}>
                <div aria-label={`Rating ${stars} out of 5`}>
                  {full.map((_,i)=>(<span key={`fs-${i}`} style={{color:'#f1c40f', fontSize:16}}>★</span>))}
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


