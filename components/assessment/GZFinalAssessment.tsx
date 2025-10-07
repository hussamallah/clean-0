"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import bank from "@/gz-final/bankv1.json";
import { GZEngine, type NextItem, type DomainKey as GZDomainKey, type Lik, type Bin } from "@/gz-final/gz_engine";
import { DOMAINS, canonicalFacets } from "@/lib/bigfive/constants";
import { getFacetScoreLevel, toPercentFromRaw } from "@/lib/bigfive/format";

type DomainKey = keyof typeof DOMAINS; // 'O'|'C'|'E'|'A'|'N'

function toCanonicalFacet(domain: DomainKey, facet: string): string {
  if (domain === 'O' && facet === 'Values Openness') return 'Liberalism';
  return facet;
}

export default function GZFinalAssessment(){
  const engineRef = useRef<GZEngine | null>(null);
  const [item, setItem] = useState<NextItem | null>(null);
  const [phase1Sel, setPhase1Sel] = useState<GZDomainKey[]>([]);
  const [progress, setProgress] = useState<{ answered:number; remaining:number; done:boolean; phase:string; currentDomain:GZDomainKey|null } | null>(null);
  // Capture answers locally per facet so we can build per-facet A_raw for results/who pages
  const answersRef = useRef<Record<DomainKey, { lik: Record<string, number[]>; bin: Record<string, number[]> }>>({
    O: { lik: {}, bin: {} },
    C: { lik: {}, bin: {} },
    E: { lik: {}, bin: {} },
    A: { lik: {}, bin: {} },
    N: { lik: {}, bin: {} },
  });

  // bootstrap engine once
  useEffect(()=>{
    const e = new GZEngine(bank as any, { domainOrder: (bank as any).domain_order });
    engineRef.current = e;
    setItem(e.getNextItem());
    setProgress(e.getProgress());
  },[]);

  const domainOrder = useMemo<DomainKey[]>(()=> (bank as any).domain_order as any, []);

  function submitPhase1(){
    const e = engineRef.current!;
    e.submitPhase1(phase1Sel);
    setItem(e.getNextItem());
    setProgress(e.getProgress());
  }

  function submitBinary(id: string, domain: DomainKey, facet: string, v: Bin){
    const e = engineRef.current!;
    try { e.submitBinary(id, v); } catch {}
    // record
    const f = toCanonicalFacet(domain, facet);
    const bin = answersRef.current[domain].bin;
    bin[f] = bin[f] ? bin[f].concat(v) : [v];
    setItem(e.getNextItem());
    setProgress(e.getProgress());
  }

  function submitLikert(id: string, domain: DomainKey, facet: string, v: Lik){
    const e = engineRef.current!;
    try { e.submitLikert(id, v); } catch {}
    // record
    const f = toCanonicalFacet(domain, facet);
    const lik = answersRef.current[domain].lik;
    lik[f] = lik[f] ? lik[f].concat(v) : [v];
    setItem(e.getNextItem());
    setProgress(e.getProgress());
  }

  async function finalizeAndSave(){
    // Build legacy-compatible results array expected by results/who pages
    const results: Array<{ domain: DomainKey; payload: any }> = [];
    for (const d of domainOrder){
      const facets = canonicalFacets(d);
      const packs = answersRef.current[d];
      const A_raw: Record<string, number> = {};
      for (const f of facets){
        const liks = packs.lik[f] || [];
        const bins = packs.bin[f] || [];
        if (liks.length){
          const avg = liks.reduce((a,c)=>a+c,0)/liks.length;
          A_raw[f] = Math.round(avg*100)/100;
        } else if (bins.length){
          // map binary → coarse 2 or 4 as a proxy; if multiple, average
          const mapped = bins.map(b => b===1 ? 4 : 2);
          const avg = mapped.reduce((a,c)=>a+c,0)/mapped.length;
          A_raw[f] = Math.round(avg*100)/100;
        } else {
          A_raw[f] = 3.00;
        }
      }
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
        audit: {}
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
    } catch {}
    // fallback: store in local only and route to results
    try{
      localStorage.setItem('gz_full_results', JSON.stringify(results));
    } catch {}
    window.location.href = '/results';
  }

  // Render
  if (!item) return <div className="card">Loading…</div>;

  if (item.kind === 'phase1'){
    return (
      <div className="card">
        <h2>Phase 1 — Choose 2–3 domains</h2>
        <p>{(bank as any).phase1_prompt || 'When it’s real and you must act, which 2 or 3 domains do you lean on?'}</p>
        <div className="facet-grid mt8">
          {domainOrder.map((d)=> (
            <button key={d} className={"btn-chip" + (phase1Sel.includes(d)?' selected':'')} onClick={()=>{
              setPhase1Sel((prev)=> prev.includes(d) ? prev.filter(x=>x!==d) : (prev.length<3 ? prev.concat(d) : prev));
            }}>
              <b>{DOMAINS[d].label.split(' (')[0]}</b>
              <small className="facet-description">{DOMAINS[d].label}</small>
            </button>
          ))}
        </div>
        <div className="row mt16" style={{justifyContent:'space-between'}}>
          <span />
          <button className="primary" disabled={phase1Sel.length<2 || phase1Sel.length>3} onClick={submitPhase1}>Start</button>
        </div>
      </div>
    );
  }

  if (item.kind === 'binary'){
    const d = item.domain as DomainKey;
    return (
      <div className="card">
        <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2>{DOMAINS[d].label} — {item.facet}</h2>
            <p className="muted">Answer Yes/No based on the last year.</p>
          </div>
          {progress ? (<div className="pill">{progress.answered} answered • {progress.remaining} left</div>) : null}
        </div>
        <div className="card" style={{borderStyle:'dashed' as any, marginTop:12}}>{item.q}</div>
        <div className="row mt16">
          <button className="rate btn" onClick={()=> submitBinary(item.id, d, item.facet, 1)}>Yes</button>
          <button className="rate btn" onClick={()=> submitBinary(item.id, d, item.facet, 0)}>No</button>
        </div>
      </div>
    );
  }

  if (item.kind === 'likert'){
    const d = item.domain as DomainKey;
    const ratings = [1,2,3,4,5] as Lik[];
    return (
      <div className="card">
        <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2>{DOMAINS[d].label} — {item.facet}</h2>
            <p className="muted">{item.scaleHint || '1..5 (Strongly disagree → Strongly agree)'}</p>
          </div>
          {progress ? (<div className="pill">{progress.answered} answered • {progress.remaining} left</div>) : null}
        </div>
        <div className="card" style={{borderStyle:'dashed' as any, marginTop:12}}>{item.q}</div>
        <div className="row mt16">
          {ratings.map(v=> (
            <button key={v} className="rate btn" onClick={()=> submitLikert(item.id, d, item.facet, v)}>{v}</button>
          ))}
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


