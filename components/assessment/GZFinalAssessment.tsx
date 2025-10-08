"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import bank from "@/gz-final/bankv1.json";
import { DOMAINS, canonicalFacets } from "@/lib/bigfive/constants";
import { getFacetScoreLevel, toPercentFromRaw } from "@/lib/bigfive/format";

type DomainKey = keyof typeof DOMAINS; // 'O'|'C'|'E'|'A'|'N'

function toCanonicalFacet(domain: DomainKey, facet: string): string {
  if (domain === 'O' && facet === 'Values Openness') return 'Liberalism';
  return facet;
}

export default function GZFinalAssessment(){
  // Linear 30-facet flow state
  const domainOrder = useMemo<DomainKey[]>(()=> (bank as any).domain_order as any, []);
  type FacetItem = { domain: DomainKey; facet: string; binId: string; binQ: string; likId: string; likQ: string };
  const facetList = useMemo<FacetItem[]>(()=>{
    const items: FacetItem[] = [];
    for (const d of domainOrder){
      // New linear bank format support
      const facetsSpec = (bank as any).domains?.[d]?.facets as Array<{id:string; facet:string; binary_question:string; likert_question:string}> | undefined;
      if (Array.isArray(facetsSpec) && facetsSpec.length){
        for (const s of facetsSpec){
          items.push({ domain: d, facet: s.facet, binId: `${s.id}.bin`, binQ: s.binary_question, likId: `${s.id}.lik`, likQ: s.likert_question });
        }
        continue;
      }
      // Fallback to legacy bank structure if present
      const order: string[] = ((bank as any).facet_order?.[d] as string[]) || canonicalFacets(d);
      const bin = (bank as any).domains?.[d]?.picked_binary as Array<{id:string; facet:string; q:string}> | undefined;
      const lik = (bank as any).domains?.[d]?.picked_likert as Array<{id:string; facet:string; q:string}> | undefined;
      for (const f of order){
        const binItem = bin?.find(it=> it.facet === f);
        const likItem = lik?.find(it=> it.facet === f);
        if (binItem && likItem){
          items.push({ domain: d, facet: f, binId: binItem.id, binQ: binItem.q, likId: likItem.id, likQ: likItem.q });
        }
      }
    }
    return items;
  }, [domainOrder]);

  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<'bin'|'likert'|'personalize'|'done'>('bin');
  const [finalScores, setFinalScores] = useState<Record<DomainKey, Record<string, number>>>(()=> ({ O:{}, C:{}, E:{}, A:{}, N:{} } as any));
  const personalization = useRef<DomainKey | null>(null);
  // no error/bank blocking; we rely on bank for flow

  async function finalizeAndSave(){
    // Build legacy-compatible results array expected by results/who pages
    const results: Array<{ domain: DomainKey; payload: any }> = [];
    for (const d of domainOrder){
      const facets = canonicalFacets(d);
      const A_raw: Record<string, number> = {};
      for (const f of facets){ A_raw[f] = Math.max(1, Math.min(5, finalScores[d]?.[f] ?? 3)); }
      const A_pct: Record<string, number> = Object.fromEntries(facets.map(f=> [f, toPercentFromRaw(A_raw[f])])) as any;
      const bucket: Record<string, 'High'|'Medium'|'Low'> = Object.fromEntries(facets.map(f=> {
        const lvl = getFacetScoreLevel(A_raw[f]);
        return [f, (lvl==='high'?'High':lvl==='low'?'Low':'Medium') as 'High'|'Medium'|'Low'];
      })) as any;
      const order = facets.slice().sort((a,b)=>{
        const rank = { High:3, Medium:2, Low:1 } as const;
        if (rank[bucket[a]] !== rank[bucket[b]]) return rank[bucket[a]] - rank[bucket[b]];
        if (A_raw[b] !== A_raw[a]) return A_raw[b] - A_raw[a];
        return facets.indexOf(a) - facets.indexOf(b);
      });
      const domain_mean_raw = Math.round((facets.reduce((s,f)=> s + (A_raw[f]||3), 0)/facets.length)*100)/100;
      const domain_mean_pct = Math.round((toPercentFromRaw(domain_mean_raw))*10)/10;

      const payload = {
        version: (bank as any).version,
        domain: d,
        phase1: { p: Object.fromEntries(facets.map(f=> [f,0])), m: Object.fromEntries(facets.map(f=> [f,0])), t: Object.fromEntries(facets.map(f=> [f,0])), P: Object.fromEntries(facets.map(f=> [f,0])) },
        phase2: { answers: [], A_raw },
        phase3: { asked: [] },
        final: { A_pct, bucket, order, domain_mean_raw, domain_mean_pct },
        audit: { personalization: personalization.current }
      };
      results.push({ domain: d, payload });
    }
    try{
      const res = await fetch('/api/runs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ results }) });
      if (res.ok){
        const data = await res.json();
        const rid = data?.rid;
        if (typeof rid === 'string' && rid.length){
          window.location.href = `/who?rid=${rid}`;
          return;
        }
      }
      // fallback: store in local only and route to results
      try { localStorage.setItem('gz_full_results', JSON.stringify(results)); } catch {}
      window.location.href = '/results';
    } catch {
      try { localStorage.setItem('gz_full_results', JSON.stringify(results)); } catch {}
      window.location.href = '/results';
    }
  }

  // Render
  const total = facetList.length;
  const current = facetList[idx];

  if (!current && step !== 'personalize' && step !== 'done') return <div className="card">Loading…</div>;

  if (step === 'bin' && current){
    const d = current.domain;
    return (
      <div className="card">
        <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2>{DOMAINS[d].label} — {toCanonicalFacet(d, current.facet)}</h2>
            <p className="muted">Answer Yes/No based on the last year.</p>
          </div>
          <div className="pill">{idx+1}/{total}</div>
        </div>
        <div className="card" style={{borderStyle:'dashed' as any, marginTop:12}}>{current.binQ}</div>
        <div className="row mt16">
          <button className="rate btn" onClick={()=>{
            // Yes → Final Score = 5, go next facet
            setFinalScores(prev=> ({ ...prev, [d]: { ...(prev[d]||{}), [toCanonicalFacet(d, current.facet)]: 5 } } as any));
            if (idx+1 < total){ setIdx(idx+1); setStep('bin'); } else { setStep('personalize'); }
          }}>Yes</button>
          <button className="rate btn" onClick={()=> setStep('likert')}>No</button>
        </div>
      </div>
    );
  }

  if (step === 'likert' && current){
    const d = current.domain;
    const ratings = [1,2,3,4,5] as const;
    return (
      <div className="card">
        <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2>{DOMAINS[d].label} — {toCanonicalFacet(d, current.facet)}</h2>
            <p className="muted">1..5 (Strongly disagree → Strongly agree)</p>
          </div>
          <div className="pill">{idx+1}/{total}</div>
        </div>
        <div className="card" style={{borderStyle:'dashed' as any, marginTop:12}}>{current.likQ}</div>
        <div className="row mt16">
          {ratings.map(v=> (
            <button key={v} className="rate btn" onClick={()=>{
              // No → Likert reverse-scored mapping per spec
              // Likert 1→4, 2→3, 3→2, 4→2, 5→1
              const map: Record<number, number> = { 1:4, 2:3, 3:2, 4:2, 5:1 };
              const final = map[v as number] ?? 2;
              setFinalScores(prev=> ({ ...prev, [d]: { ...(prev[d]||{}), [toCanonicalFacet(d, current.facet)]: final } } as any));
              if (idx+1 < total){ setIdx(idx+1); setStep('bin'); } else { setStep('personalize'); }
            }}>{v}</button>
          ))}
        </div>
        <div className="row mt16" style={{justifyContent:'flex-start'}}>
          <button className="ghost" onClick={()=> setStep('bin')}>Back</button>
        </div>
      </div>
    );
  }

  if (step === 'personalize'){
    const opts: Array<{ key: DomainKey; label: string; hint: string }> = [
      { key:'C', label:'Being organized and dependable', hint:'Conscientiousness' },
      { key:'O', label:'Being creative and curious', hint:'Openness' },
      { key:'E', label:'Being energetic and expressive', hint:'Extraversion' },
      { key:'A', label:'Being collaborative and fair', hint:'Agreeableness' },
      { key:'N', label:'Staying steady under stress', hint:'Stability' }
    ];
    return (
      <div className="card">
        <h2>One more thing (optional)</h2>
        <p>Of the following, which area is most important to you?</p>
        <div className="facet-grid mt8">
          {opts.map(o=> (
            <button key={o.key} className="btn-chip" onClick={()=>{ personalization.current = o.key; setStep('done'); }}>
              <b>{o.label}</b>
              <small className="facet-description">{o.hint}</small>
            </button>
          ))}
        </div>
        <div className="row mt16" style={{justifyContent:'space-between'}}>
          <button className="ghost" onClick={()=> setStep('bin')}>Back</button>
          <button className="primary" onClick={()=> { personalization.current = personalization.current || null; setStep('done'); }}>Skip</button>
        </div>
      </div>
    );
  }

  // done
  return (
    <div className="card">
      <h2>All set</h2>
      <p>We will save your run and take you to your insights.</p>
      <div className="row mt16" style={{justifyContent:'flex-end'}}>
        <button className="primary" onClick={finalizeAndSave}>Continue →</button>
      </div>
    </div>
  );
}


