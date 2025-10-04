"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import LifeSignalNudge from "@/components/assessment/LifeSignalNudge";
import { useRouter } from "next/navigation";

import {
  DOMAINS, VERSION, P1_PROMPTS, canonicalFacets,
  CONFIRM, ANCHORS, FACET_HINTS
} from "@/lib/bigfive/constants";
import {
  stableStringify, toPercentFromRaw
} from "@/lib/bigfive/format";
import {
  anchorsBudget, applyConfirmersBucket, baseBucket, computePrior,
  shortlistResolver, triggersForConfirmers
} from "@/lib/bigfive/logic";
import { sha256 } from "@/lib/crypto/sha256";

type DomainKey = keyof typeof DOMAINS;

export default function FullAssessment(){
  const domainOrder: DomainKey[] = ['E','C','A','O','N'];
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Array<{domain:DomainKey; payload:any}>>([]);
  const done = idx >= domainOrder.length;
  const router = useRouter();

  const [nudge, setNudge] = useState<{domain:DomainKey; mean:number}|null>(null);
  const [pending, setPending] = useState<any|null>(null);

  useEffect(()=>{
    async function finalize(){
      const normalized = results.map(r=>({domain:r.domain, payload:r.payload}));
      const hash = await sha256(stableStringify(normalized));
      try {
        localStorage.setItem('gz_full_results', JSON.stringify(normalized));
        localStorage.setItem('gz_full_hash', hash);

        const runsRaw = localStorage.getItem('gz_full_runs');
        const runs = runsRaw ? JSON.parse(runsRaw) : {};
        runs[hash] = normalized;
        localStorage.setItem('gz_full_runs', JSON.stringify(runs));

        router.push('/who');
      } catch {}
    }
    if (done && results.length === domainOrder.length){ finalize(); }
  }, [done, results, router]);

  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      border: '1px solid #2d4a6b',
      borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
    }}>
      {!done ? (
        <>
          {nudge ? (
            <LifeSignalNudge
              domain={nudge.domain}
              domainMeanRaw={nudge.mean}
              progressIndex={idx}
              total={domainOrder.length}
              onNext={()=>{
                if (pending){
                  setResults(prev => prev.concat({domain: domainOrder[idx], payload: pending}));
                  setPending(null);
                }
                setNudge(null);
                setIdx(prev=> prev+1);
              }}
            />
          ) : null}
          {!nudge ? (
            <DomainFlow
              key={domainOrder[idx]}
              domain={domainOrder[idx]}
              onComplete={(payload)=>{
                const mean = payload?.final?.domain_mean_raw as number | undefined;
                if (typeof mean === 'number') setNudge({ domain: domainOrder[idx], mean });
                setPending(payload);
              }}
            />
          ) : null}
        </>
      ) : (
        <div style={{textAlign:'center',padding:40}}>
          <div style={{fontSize:16,color:'#e8f4fd',marginBottom:12,fontWeight:500}}>Processing your results…</div>
          <div style={{fontSize:14,color:'#a8c8e8'}}>Redirecting to your personality insights…</div>
        </div>
      )}
    </div>
  );
}

/** Self-contained per-domain flow. No dependency on <Assessment/>. */
function DomainFlow({ domain, onComplete }:{ domain: DomainKey; onComplete:(payload:any)=>void }){
  const facets = useMemo(()=> canonicalFacets(domain), [domain]);

  // Phase 1
  const [picksP, setPicksP] = useState<Record<string, number> | null>(null);
  const [picksM, setPicksM] = useState<Record<string, number> | null>(null);
  const [picksT, setPicksT] = useState<Record<string, number> | null>(null);
  const [priorP, setPriorP] = useState<Record<string, number> | null>(null);

  // Phase 2
  const [phase2Answers, setPhase2Answers] = useState<Array<{facet:string; idx:number; value:number}>>([]);
  const [A_raw, setAraw] = useState<Record<string, number> | null>(null);

  // Phase 3
  const [phase3Asked, setPhase3Asked] = useState<Array<{facet:string; answer:'Yes'|'No'|'Maybe'}>>([]);

  // Audit
  const [nonce, setNonce] = useState<string | null>(null);

  // Core payload without audit (computed when all ingredients are ready)
  const corePayload = useMemo(()=>{
    if (!domain || !picksP || !picksM || !picksT || !priorP || !A_raw) return null;
    const f = facets;
    const A_pct: Record<string,number> = Object.fromEntries(f.map(ff=> [ff, toPercentFromRaw((A_raw as any)[ff])])) as any;
    const initialBucket = Object.fromEntries(f.map(ff=> [ff, baseBucket((A_raw as any)[ff], (priorP as any)[ff])])) as Record<string,'High'|'Medium'|'Low'>;
    const bucket = applyConfirmersBucket(initialBucket, A_raw, priorP, phase3Asked);
    const order = f.slice().sort((a,b)=>{
      const rank = { High: 3, Medium: 2, Low: 1 } as const;
      if (rank[bucket[a]] !== rank[bucket[b]]) return rank[bucket[a]] - rank[bucket[b]];
      if ((A_raw as any)[b] !== (A_raw as any)[a]) return (A_raw as any)[b] - (A_raw as any)[a];
      if ((priorP as any)[b] !== (priorP as any)[a]) return (priorP as any)[b] - (priorP as any)[a];
      return f.indexOf(a) - f.indexOf(b);
    });
    const domain_mean_raw = Math.round((f.reduce((s,ff)=>s+(A_raw as any)[ff],0)/6)*100)/100;
    const domain_mean_pct = Math.round((toPercentFromRaw(domain_mean_raw))*10)/10;
    return {
      version: VERSION,
      domain,
      phase1: { p: picksP, m: picksM, t: picksT, P: priorP },
      phase2: { answers: phase2Answers, A_raw },
      phase3: { asked: phase3Asked },
      final: { A_pct, bucket, order, domain_mean_raw, domain_mean_pct }
    };
  }, [domain, facets, picksP, picksM, picksT, priorP, phase2Answers, A_raw, phase3Asked]);

  // Compute nonce from core payload
  useEffect(()=>{
    if (!corePayload) return;
    sha256(stableStringify(corePayload)).then(setNonce);
  }, [corePayload]);

  // Final result payload includes audit nonce
  const resultPayload = useMemo(()=>{
    if (!corePayload || !nonce) return null;
    return { ...corePayload, audit: { nonce } } as any;
  }, [corePayload, nonce]);

  // Persist per-domain payload by hash for later retrieval
  useEffect(()=>{
    if (!resultPayload) return;
    try{
      const raw = localStorage.getItem('gz_domain_results');
      const db = raw ? JSON.parse(raw) : {};
      const h = (resultPayload as any)?.audit?.nonce;
      if (h && !db[h]){
        db[h] = resultPayload;
        localStorage.setItem('gz_domain_results', JSON.stringify(db));
      }
    } catch {}
  }, [resultPayload]);

  // Prepare triggers for Phase 3
  const triggers = useMemo(()=>{
    if (!A_raw || !priorP) return [] as string[];
    return triggersForConfirmers(A_raw, priorP, domain);
  }, [A_raw, priorP, domain]);

  // Emit only when Phase 3 is fully finished and nonce is ready
  const emittedRef = useRef(false);
  useEffect(()=>{
    if (!resultPayload) return;
    if (emittedRef.current) return;
    if (phase3Asked.length >= triggers.length){
      emittedRef.current = true;
      onComplete(resultPayload);
    }
  }, [resultPayload, phase3Asked.length, triggers.length, onComplete]);

  // UI states
  const [selectedCount, setSelectedCount] = useState(0);

  // Reset selection count when entering new pick phases
  useEffect(()=>{
    if (picksP && !picksM){ setSelectedCount(0); }
  }, [picksP, picksM]);
  useEffect(()=>{
    if (picksM && !picksT){ setSelectedCount(0); }
  }, [picksM, picksT]);

  // Screens
  if (!picksP){
    return (
      <Card>
        <QuestionHdr domain={domain} text={domain === 'N' ? 'Choose the 3 that show up for you most often.' : 'Select the 3 traits that best describe you.'} count={`${selectedCount}/3`} />
        <FacetPickGrid
          key={`phase1-${domain}`}
          domain={domain}
          facets={facets}
          required={3}
          onSubmit={(arr)=>{
            const p = Object.fromEntries(facets.map(f=>[f,0]));
            for (const f of arr) (p as any)[f]=1;
            setPicksP(p as Record<string,number>);
          }}
          onBack={()=>{}}
          selectedCount={selectedCount}
          onSelectedCountChange={setSelectedCount}
        />
      </Card>
    );
  }

  if (!picksM){
    const q1Selected = facets.filter(f => (picksP as any)[f] === 1);
    return (
      <Card>
        <QuestionHdr domain={domain} text={P1_PROMPTS[domain].q2} count={`${selectedCount}/2`} />
        <FacetPickGrid
          key={`phase2-${q1Selected.join(',')}`}
          domain={domain}
          facets={q1Selected}
          required={2}
          onSubmit={(arr)=>{
            const m = Object.fromEntries(facets.map(f=>[f,0]));
            for (const f of arr) (m as any)[f]=1;
            setPicksM(m as Record<string,number>);
          }}
          onBack={()=> setPicksP(null)}
          selectedCount={selectedCount}
          onSelectedCountChange={setSelectedCount}
        />
      </Card>
    );
  }

  if (!picksT){
    const shortlist = shortlistResolver(picksP, picksM, domain);
    const tagsFor = (f: string) => {
      const tags: string[] = [];
      if ((picksP as any)[f]===1 && (picksM as any)[f]===1) tags.push("Picked & Dropped");
      if ((picksP as any)[f]===0) tags.push("Untouched in Q1");
      if ((picksM as any)[f]===1 && !((picksP as any)[f]===1 && (picksM as any)[f]===1)) tags.push("Dropped in Q2");
      return tags;
    };
    const required = Math.min(2, shortlist.length);
    return (
      <Card>
        <QuestionHdr domain={domain} text={P1_PROMPTS[domain].q3} count={`${selectedCount}/${required}`} sub="Why these? Picked & Dropped / Untouched." />
        <FacetPickGrid
          key={`phase3-${shortlist.join(',')}`}
          domain={domain}
          facets={shortlist}
          required={required}
          tagsFor={tagsFor}
          onSubmit={(arr)=>{
            const t = Object.fromEntries(facets.map(f=>[f,0]));
            for (const f of arr) (t as any)[f]=1;
            setPicksT(t as Record<string,number>);
            const P = computePrior(picksP!, t as Record<string,number>, picksM!, facets);
            setPriorP(P);
          }}
          onBack={()=> setPicksM(null)}
          selectedCount={selectedCount}
          onSelectedCountChange={setSelectedCount}
        />
      </Card>
    );
  }

  if (!A_raw){
    const P = priorP!;
    const budget = anchorsBudget(P, facets);
    const queue: Array<{facet:string; idx:number}> = [];
    for (const f of facets){ for (let i=0;i<(budget as any)[f];i++){ queue.push({facet:f, idx:i}); } }
    return (
      <AnchorsFlow
        domain={domain}
        queue={queue}
        onDone={(answers)=>{
          const perFacet: Record<string, number[]> = Object.fromEntries(facets.map(f=>[f, []]));
          for (const a of answers){ perFacet[a.facet].push(a.value); }
          const A = Object.fromEntries(facets.map(f=>{
            const arr = perFacet[f];
            if (arr.length === 0) return [f, 3.00];
            const avg = arr.reduce((s,x)=>s+x,0) / arr.length;
            return [f, Math.round(avg*100)/100];
          }));
          setPhase2Answers(answers);
          setAraw(A as Record<string,number>);
        }}
        onBack={()=>{ setPicksT(null); setPriorP(null); }}
      />
    );
  }

  const P = priorP!;
  if (phase3Asked.length < triggers.length){
    const f = triggers[phase3Asked.length];
    const q = CONFIRM[domain][f];
    return (
      <ConfirmFlow
        facet={f}
        domainLabel={DOMAINS[domain].label}
        question={q}
        onAnswer={(ans)=> setPhase3Asked(prev=> prev.concat({facet:f, answer: ans}))}
        onBack={()=>{ setAraw(null); setPhase2Answers([]); }}
      />
    );
  }

  // Final confirmation UI stub (short; payload already emitted via effect)
  const domain_mean_raw = Math.round((facets.reduce((s,f)=>s+(A_raw as any)[f],0)/6)*100)/100;
  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, #2d1b69 0%, #1e3c72 50%, #2a5298 100%)',
      border: '1px solid #4a6fa5',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      <h3 style={{color:'#f0f8ff',fontWeight:600}}>Captured {DOMAINS[domain].label}</h3>
      <p className="muted" style={{color:'#b8d4f0'}}>Domain mean {domain_mean_raw.toFixed(2)}. Continuing…</p>
    </div>
  );
}

/* --- Local UI atoms, identical behavior to prior flow but embedded here --- */
function Card({children}:{children:any}){ 
  return (
    <div className="card" style={{
      background: 'linear-gradient(135deg, #1e1e3f 0%, #2a2a5a 50%, #3a3a7a 100%)',
      border: '1px solid #4a4a8a',
      borderRadius: '12px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(10px)'
    }}>
      {children}
    </div>
  ); 
}

function QuestionHdr({domain, text, count, sub}:{domain:DomainKey; text:string; count:string; sub?:string}){
  return (
    <div className="question-row" style={{marginBottom: '20px'}}>
      <div className="q-left">
        <span className="domain-pill" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          {DOMAINS[domain].label.split(' (')[0]}
        </span>
      </div>
      <div className="q-center">
        <p style={{color: '#f0f8ff', fontSize: '16px', fontWeight: '500', lineHeight: '1.5'}}>
          {text}
          {sub? <><br/><small className="muted" style={{color: '#a8c8e8', fontSize: '14px'}}>{sub}</small></>:null}
        </p>
      </div>
      <div className="q-right">
        <div className="count-pill" style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
        }}>
          <span className="count">{count}</span>
        </div>
      </div>
    </div>
  );
}

function FacetChip({ domain, facet, selected, onToggle, tags = [] }:
  { domain: DomainKey; facet: string; selected: boolean; onToggle: () => void; tags?: string[] }){
  const hint = (FACET_HINTS as any)[domain]?.[facet] ?? "";
  return (
    <button 
      className={`btn-chip${selected ? ' selected' : ''}`} 
      title={hint} 
      onClick={onToggle}
      style={{
        background: selected 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #2a2a5a 0%, #3a3a7a 100%)',
        border: selected 
          ? '2px solid #8b5cf6'
          : '1px solid #4a4a8a',
        color: selected ? '#ffffff' : '#e0e6ed',
        borderRadius: '12px',
        padding: '16px',
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: selected 
          ? '0 8px 24px rgba(102, 126, 234, 0.4)'
          : '0 4px 12px rgba(0,0,0,0.1)',
        transform: selected ? 'translateY(-2px)' : 'translateY(0)',
        fontWeight: '500'
      }}
    >
      <b style={{display: 'block', marginBottom: '4px', fontSize: '14px'}}>{facet}</b>
      <small style={{display: 'block', fontSize: '12px', opacity: 0.8}}>{hint}</small>
      {tags.length ? (
        <div className="tags" style={{marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
          {tags.map((t,i)=>(
            <span key={i} className="tag" style={{
              background: 'rgba(255,255,255,0.2)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '500'
            }}>
              {t}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

function FacetPickGrid({
  domain, facets, required, onSubmit, onBack, tagsFor, selectedCount, onSelectedCountChange
}:{
  domain: DomainKey; facets: string[]; required: number;
  onSubmit: (selected: string[])=>void; onBack: ()=>void;
  tagsFor?: (f:string)=>string[]; selectedCount: number; onSelectedCountChange: (count: number)=>void
}){
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (f: string) => {
    const next = selected.includes(f)
      ? selected.filter(x=>x!==f)
      : (selected.length >= required ? selected : selected.concat(f));
    setSelected(next);
    onSelectedCountChange(next.length);
  };
  return (
    <div>
      <div className="facet-grid mt8">
        {facets.map(f=> (
          <FacetChip key={f} domain={domain} facet={f} selected={selected.includes(f)} onToggle={()=>toggle(f)} tags={tagsFor? tagsFor(f): []} />
        ))}
      </div>
      <div className="row mt16" style={{justifyContent:'space-between', marginTop: '24px'}}>
        <button 
          className="ghost" 
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '1px solid #4a4a8a',
            color: '#a8c8e8',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}
        >
          Back
        </button>
        <div className="row-nowrap" style={{gap:8}}>
          <button 
            className="primary" 
            disabled={selected.length !== required} 
            onClick={()=> onSubmit(selected)}
            style={{
              background: selected.length === required 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #4a4a8a 0%, #5a5a9a 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '12px 32px',
              borderRadius: '8px',
              cursor: selected.length === required ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s ease',
              fontWeight: '600',
              boxShadow: selected.length === required 
                ? '0 4px 16px rgba(102, 126, 234, 0.3)'
                : 'none',
              opacity: selected.length === required ? 1 : 0.5
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function AnchorsFlow({
  domain, queue, onDone, onBack
}:{ domain: DomainKey; queue: Array<{facet:string; idx:number}>;
   onDone: (answers: Array<{facet:string; idx:number; value:number}>)=>void; onBack: ()=>void }){
  const ratings = [
    {text: "Very Inaccurate", val: 1},
    {text: "Moderately Inaccurate", val: 2},
    {text: "Neutral", val: 3},
    {text: "Moderately Accurate", val: 4},
    {text: "Very Accurate", val: 5}
  ];
  const [ans, setAns] = useState<Array<{facet:string; idx:number; value:number}>>([]);
  const qi = ans.length;

  useEffect(()=>{
    if (ans.length >= queue.length){ onDone(ans); }
  }, [ans, queue.length, onDone]);

  if (qi >= queue.length){ return null; }
  const {facet, idx} = queue[qi];
  const anchorPrompt = (ANCHORS as any)[domain]?.[facet]?.[idx] ?? "";

  return (
    <div className="card">
      <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center', marginBottom: '24px'}}>
        <div>
          <h2 style={{color: '#f0f8ff', fontSize: '20px', fontWeight: '600', marginBottom: '8px'}}>
            Phase 2 — Accuracy item {qi+1} / {queue.length}
          </h2>
          <p style={{color: '#a8c8e8', fontSize: '14px'}}>
            <b style={{color: '#4facfe'}}>{facet}</b> • Rate the statement for <b style={{color: '#4facfe'}}>{DOMAINS[domain].label}</b>.
          </p>
        </div>
        <div className="pill" style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
        }}>
          Scale: Very Inaccurate → Very Accurate
        </div>
      </div>
      <div className="mt16" style={{marginBottom: '24px'}}>
        <div style={{
          fontSize: '18px', 
          color: '#f0f8ff', 
          lineHeight: '1.6',
          background: 'rgba(255,255,255,0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {anchorPrompt}
        </div>
      </div>
      <div className="row mt16" style={{gap: '12px', marginBottom: '24px'}}>
        {ratings.map(r=> (
          <button 
            key={r.val} 
            className={`rate btn${ans[qi]?.value===r.val?' selected':''}`} 
            onClick={()=>{
              setAns(prev => prev.concat({facet, idx, value: r.val}));
            }}
            style={{
              background: ans[qi]?.value===r.val
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #2a2a5a 0%, #3a3a7a 100%)',
              border: ans[qi]?.value===r.val
                ? '2px solid #8b5cf6'
                : '1px solid #4a4a8a',
              color: ans[qi]?.value===r.val ? '#ffffff' : '#e0e6ed',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '500',
              boxShadow: ans[qi]?.value===r.val
                ? '0 4px 16px rgba(102, 126, 234, 0.3)'
                : '0 2px 8px rgba(0,0,0,0.1)',
              transform: ans[qi]?.value===r.val ? 'translateY(-2px)' : 'translateY(0)',
              flex: '1',
              minWidth: '120px'
            }}
          >
            {r.text}
          </button>
        ))}
      </div>
      <div className="row mt16" style={{justifyContent:'flex-start'}}>
        <button 
          className="ghost" 
          onClick={()=>{
            if (ans.length>0){ setAns(prev=> prev.slice(0,-1)); }
            else { onBack(); }
          }}
          style={{
            background: 'transparent',
            border: '1px solid #4a4a8a',
            color: '#a8c8e8',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}

function ConfirmFlow({
  facet, domainLabel, question, onAnswer, onBack
}:{ facet:string; domainLabel:string; question:string;
   onAnswer:(ans:'Yes'|'No'|'Maybe')=>void; onBack:()=>void }){
  return (
    <div className="card">
      <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center', marginBottom: '24px'}}>
        <div>
          <h2 style={{color: '#f0f8ff', fontSize: '20px', fontWeight: '600', marginBottom: '8px'}}>
            Phase 3 — Confirm
          </h2>
          <p style={{color: '#a8c8e8', fontSize: '14px'}}>
            <b style={{color: '#4facfe'}}>{facet}</b> • Quick behavioral check.
          </p>
        </div>
        <div className="pill" style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          boxShadow: '0 4px 12px rgba(79, 172, 254, 0.3)'
        }}>
          Click to answer
        </div>
      </div>
      <div className="mt16" style={{marginBottom: '24px'}}>
        <div style={{
          fontSize: '18px', 
          color: '#f0f8ff', 
          lineHeight: '1.6',
          background: 'rgba(255,255,255,0.05)',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {question}
        </div>
      </div>
      <div className="row mt16" style={{gap: '12px', marginBottom: '24px'}}>
        {['Yes','No','Maybe'].map(x=> (
          <button 
            key={x} 
            className="rate btn" 
            onClick={()=> onAnswer(x as any)}
            style={{
              background: 'linear-gradient(135deg, #2a2a5a 0%, #3a3a7a 100%)',
              border: '1px solid #4a4a8a',
              color: '#e0e6ed',
              padding: '16px 32px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '600',
              fontSize: '16px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              flex: '1',
              minWidth: '120px'
            }}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="row mt16" style={{justifyContent:'flex-start'}}>
        <button 
          className="ghost" 
          onClick={onBack}
          style={{
            background: 'transparent',
            border: '1px solid #4a4a8a',
            color: '#a8c8e8',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '500'
          }}
        >
          Back
        </button>
      </div>
    </div>
  );
}
