"use client";
import { useEffect, useRef, useState } from "react";
import { shortlistResolver } from "@/lib/bigfive/logic";
import { FACET_DESCRIPTIONS, FACET_HINTS } from "@/lib/bigfive/constants";

type StepP1 = { kind:'p1'; domain:string; label:string; prompts:{q1:string;q2:string;q3:string}; facets:string[] };
type StepP2 = { kind:'p2'; domain:string; label:string; queue:Array<{facet:string; idx:number; prompt:string}> };
type StepP3 = { kind:'p3'; domain:string; label:string; confirmers:Array<{facet:string; question:string}> };
type StepDone = { kind:'done'; rid:string; redirect:string };
type Step = StepP1 | StepP2 | StepP3 | StepDone;

export default function FullAssessment(){
  const [step, setStep] = useState<Step|null>(null);

  useEffect(()=>{
    fetch('/api/assessment/start', { method:'POST' })
      .then(async (r)=>{
        if (!r.ok) return null;
        const ct = r.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return null;
        return r.json();
      })
      .then(d=> { if (d?.ui) setStep({ kind:'p1', ...d.ui }); })
      .catch(()=>{});
  },[]);

  if (!step) return <div className="card">Loading…</div>;

  if (step.kind === 'p1') return <Phase1 ui={step} onSubmit={async (p)=>{
    try{
      const r = await fetch('/api/assessment/p1', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(p) });
      if (!r.ok) return;
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return;
      const d = await r.json();
      if (d?.ui) setStep({ kind:'p2', ...d.ui });
      } catch {}
  }}/>;  

  if (step.kind === 'p2') return <Phase2 ui={step} onSubmit={async (answers)=>{
    try{
      const r = await fetch('/api/assessment/p2', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({answers}) });
      if (!r.ok) return;
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return;
      const d = await r.json();
      if (d?.ui) setStep({ kind:'p3', ...d.ui });
    } catch {}
  }}/>;  

  if (step.kind === 'p3') return <Phase3 ui={step} onSubmit={async (asked)=>{
    try{
      const r = await fetch('/api/assessment/p3', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({asked}) });
      if (!r.ok) return;
      const ct = r.headers.get('content-type') || '';
      if (!ct.includes('application/json')) return;
      const d = await r.json();
      if (d?.step === 'done') { window.location.href = d.redirect; return; }
      if (d?.ui) setStep({ kind:'p1', ...d.ui });
    } catch {}
  }}/>;  

  return null;
}

function Phase1({ ui, onSubmit }:{ ui: StepP1; onSubmit:(p:{picksP:any;picksM:any;picksT:any})=>void }){
  const [stage, setStage] = useState<1|2|3>(1);
  const [sel, setSel] = useState<string[]>([]);
  const [drop, setDrop] = useState<string[]>([]);
  const [final, setFinal] = useState<string[]>([]);

  // derive pick maps
  const all = ui.facets;
  const pMap = Object.fromEntries(all.map(f=> [f, sel.includes(f)?1:0]));
  const mMap = Object.fromEntries(all.map(f=> [f, drop.includes(f)?1:0]));
  const shortlist = shortlistResolver(pMap as any, mMap as any, ui.domain as any);

  // keep drop within sel; keep final within shortlist
  useEffect(()=>{ setDrop(prev=> prev.filter(f=> sel.includes(f))); }, [sel]);
  useEffect(()=>{ setFinal(prev=> prev.filter(f=> shortlist.includes(f))); }, [shortlist.join(',')]);

  const required = stage===1 ? 3 : stage===2 ? 2 : Math.min(2, shortlist.length);

  const options = stage===1 ? ui.facets : stage===2 ? sel : shortlist;

  const toggle = (arr:string[], set:(v:string[])=>void, f:string, limit:number) => {
    set(arr.includes(f) ? arr.filter(x=>x!==f) : (arr.length<limit ? arr.concat(f) : arr));
  };

  const submit = ()=>{
    const tMap = Object.fromEntries(all.map(f=> [f, final.includes(f)?1:0]));
    onSubmit({ picksP:pMap, picksM:mMap, picksT:tMap });
  };

  return (
    <div className="card">
      <h2>{ui.label}</h2>
      <p>{stage===1? ui.prompts.q1 : stage===2? ui.prompts.q2 : ui.prompts.q3}</p>
      <div className="facet-grid">
        {options.map(f=>{
          const description = (FACET_DESCRIPTIONS as any)[ui.domain]?.[f] ?? "";
          const hint = (FACET_HINTS as any)[ui.domain]?.[f] ?? "";
          return (
            <button key={f} className={"btn-chip"+(stage===1? (sel.includes(f)?" selected":"") : stage===2? (drop.includes(f)?" selected":"") : (final.includes(f)?" selected":""))}
              onClick={()=> stage===1? toggle(sel,setSel,f,3) : stage===2? toggle(drop,setDrop,f,2) : toggle(final,setFinal,f,required)}>
              <b>{f}</b>
              {description && <small className="facet-description">{description}</small>}
              {hint && <small className="facet-hint">{hint}</small>}
            </button>
          );
        })}
      </div>
      <div className="row mt16" style={{justifyContent:'space-between'}}>
        {stage>1 ? <button className="ghost" onClick={()=> setStage((s)=> (s-1) as any)}>Back</button> : <span/>}
        <button className="primary" disabled={(stage===1?sel:stage===2?drop:final).length!==required}
          onClick={()=> stage<3? setStage((s)=> (s+1) as any) : submit()}>
          {stage<3? "Next":"Continue"}
        </button>
      </div>
    </div>
  );
}

function Phase2({ ui, onSubmit }:{ ui: StepP2; onSubmit:(answers:Array<{facet:string; idx:number; value:number}>)=>void }){
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Array<{facet:string; idx:number; value:number}>>([]);
  const submittedRef = useRef(false);
  const queue = Array.isArray(ui.queue) ? ui.queue : [];
  if (i>=queue.length){ if (!submittedRef.current){ submittedRef.current = true; onSubmit(answers); } return null; }
  const item = queue[i];
  const ratings = [
    {text:"Very Inaccurate", val:1},
    {text:"Moderately Inaccurate", val:2},
    {text:"Neutral", val:3},
    {text:"Moderately Accurate", val:4},
    {text:"Very Accurate", val:5},
  ];
  return (
    <div className="card">
      <h2>{ui.label} — Phase 2</h2>
      <p><b>{item.facet}</b></p>
      <div className="card" style={{borderStyle:'dashed' as any}}>{item.prompt}</div>
      <div className="row mt16">
        {ratings.map(r=>(
          <button key={r.val} className="rate btn" onClick={()=> {
            setAnswers(prev=> prev.concat({ facet:item.facet, idx:item.idx, value:r.val }));
            setI(i+1);
          }}>{r.text}</button>
        ))}
      </div>
    </div>
  );
}

function Phase3({ ui, onSubmit }:{ ui: StepP3; onSubmit:(asked:Array<{facet:string; answer:'Yes'|'No'|'Maybe'}>)=>void }){
  const [i, setI] = useState(0);
  const [asked, setAsked] = useState<Array<{facet:string; answer:'Yes'|'No'|'Maybe'}>>([]);
  const submittedRef = useRef(false);
  if (i>=ui.confirmers.length){ if (!submittedRef.current){ submittedRef.current = true; onSubmit(asked); } return null; }
  const c = ui.confirmers[i];
  return (
    <div className="card">
      <h2>{ui.label} — Confirm</h2>
      <div className="card" style={{borderStyle:'dashed' as any}}>{c.question}</div>
      <div className="row mt16">
        {['Yes','No','Maybe'].map(x=> (
          <button key={x} className="rate btn" onClick={()=> {
            setAsked(prev=> prev.concat({ facet:c.facet, answer: x as any }));
            setI(i+1);
          }}>{x}</button>
        ))}
      </div>
    </div>
  );
}
