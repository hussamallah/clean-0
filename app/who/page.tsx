"use client";
import { useEffect, useState } from "react";
import AuthorityBar from "@components/who/AuthorityBar";
import FiveCardResults from "@components/who/FiveCardResults";
import ExistentialCircuits from "@components/who/ExistentialCircuits";
import AllLifeSignals from "@components/who/AllLifeSignals";
import { buildWhoFromFullResults } from "@/lib/bigfive/who";
import { buildHandoff } from "@/lib/bigfive/handoff";
import { computeSignals } from "@/lib/bigfive/signals";

type DomainKey = 'O'|'C'|'E'|'A'|'N';
type Level = 'High'|'Medium'|'Low';
type Tone = 'neutral'|'alpha'|'warm'|'calm'|'technical';

export default function WhoPage({ searchParams }:{ searchParams:{ rid?:string, tone?:Tone } }){
  const rid = searchParams?.rid || '';
  const toneQuery = (searchParams?.tone as Tone) || undefined;

  const [fullResults, setFullResults] = useState<any[]|null>(null);
  const [who, setWho] = useState<any|null>(null);
  const [handoff, setHandoff] = useState<any|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [panels, setPanels] = useState<any|null>(null);

  useEffect(()=>{ import("@/lib/data/who_panels.json").then(m=> setPanels((m as any).default || m)); }, []);

  useEffect(()=>{
    async function run(){
      if (!rid){ setError("Missing result id."); return; }
      const res = await fetch(`/api/who/${rid}`, { cache:'no-store' });
      if (!res.ok){ setError("Not found"); return; }
      const data = await res.json();
      const results = data?.results;
      if (!Array.isArray(results)){ setError("Invalid data"); return; }
      setFullResults(results);
      // Extract archetype if present (stored as an extra pseudo-domain 'ARCH')
      const arch = Array.isArray(results) ? (results as any[]).find(r=> r?.domain === 'ARCH')?.payload : null;
      // Prefer server-provided who/handoff to keep API as source of truth
      const whoView = data?.who ?? await buildWhoFromFullResults(results, rid);
      const ho = data?.handoff ?? await buildHandoff(results, rid);
      const merged = arch ? { ...whoView, archetype: arch } : whoView;
      setWho(merged); setHandoff(ho);
      try {
        // Debug audit: view full payload in console and on window
        const audit = { rid, results, who: whoView, handoff: ho };
        console.log('[WHO AUDIT]', audit);
        (globalThis as any).gzAudit = audit;
      } catch {}
    }
    run();
  }, [rid]);

  if (error) return <div className="card">{error}</div>;
  if (!who || !handoff || !fullResults || !panels) return <div className="card">Loading…</div>;

  const domainMeans = who.derived.domainMeans as Record<DomainKey, number>;
  const states = who.states as Record<DomainKey, Record<string,Level>>;
  // Selection keys
  const interpersonalKey = (()=>{
    const Ehigh = domainMeans.E >= 4.0, Elow = domainMeans.E <= 2.0;
    const Ahigh = domainMeans.A >= 4.0, Alow = domainMeans.A <= 2.0;
    if (Ehigh && Ahigh) return 'warm_energizing';
    if (Ehigh && Alow)  return 'forceful_independent';
    if (Elow  && Ahigh) return 'calm_considerate';
    if (Elow  && Alow)  return 'autonomous_direct';
    return 'adaptive_balanced';
  })();

  // Tone from server, overridable via URL param
  const inferredTone: Tone = (toneQuery ?? who.tone) as Tone;

  // helper: apply tone variant if present
  const withTone = (panel:any|undefined|null)=>{
    if (!panel) return panel;
    const v = panel.tones?.[inferredTone];
    if (!v) return panel;
    return {
      ...panel,
      title: v.title ?? panel.title,
      lines: Array.isArray(v.lines) ? v.lines : panel.lines,
      actions: Array.isArray(v.actions) ? v.actions : panel.actions
    };
  };

  const interpersonalPanel = withTone(panels?.interpersonal?.[interpersonalKey]);

  const workKey = (()=>{
    const cHigh = (f:string)=> states.C[f]==='High';
    if (cHigh('Self-Discipline') || cHigh('Orderliness') || domainMeans.C >= 3.8) return 'dependable_systems';
    if (states.C['Orderliness']==='Low' || domainMeans.C <= 2.2) return 'flexible_lanes';
    return 'balanced';
  })();
  const workPanel = withTone(panels?.work_style?.[workKey]);

  const decisionKey = (()=>{
    const oIntHigh = states.O['Intellect']==='High';
    const oLibHigh = states.O['Liberalism']==='High';
    const cCautHigh= states.C['Cautiousness']==='High';
    if (oIntHigh && cCautHigh) return 'models_and_boundaries';
    if (oIntHigh && !cCautHigh) return 'principles_and_experiments';
    if (oLibHigh && cCautHigh) return 'challenge_with_safeguards';
    if (oLibHigh) return 'challenge_defaults';
    if (cCautHigh) return 'measured_steps';
    return 'pragmatic';
  })();
  const decisionPanel = withTone(panels?.decision_style?.[decisionKey]);

  // Stress pattern (keep truthful and specific)
  const stressHighs: Array<{ facet:string; meaning?:string; move?:string }> = [];
  ['Anxiety','Anger','Vulnerability','Depression','Self-Consciousness','Immoderation'].forEach(f => {
    if (states.N[f]==='High'){
      const bit = panels?.stress_pattern?.bits?.[f] || {};
      stressHighs.push({ facet: f, meaning: bit.meaning, move: bit.move });
    }
  });

  // Life Signals snapshot
  const signals = computeSignals(domainMeans as any);
  const toLevel = (v:number)=> v>=0.70? 'High' : v>=0.40? 'Medium' : 'Low';
  const lifePanels = panels?.life_signals_snapshot || {};
  const topo = [
    { key:'T', name: lifePanels?.T?.name || 'Threat', value: signals.T },
    { key:'P', name: lifePanels?.P?.name || 'Pursuit', value: signals.P },
    { key:'S', name: lifePanels?.S?.name || 'Social Buffer', value: signals.S },
    { key:'D', name: lifePanels?.D?.name || 'Dominance/Drive', value: signals.D }
  ] as const;

  return (
    <main className="stack">
      <header className="row between">
        <div>
          <h1>Who You Are</h1>
          <div className="muted">Result ID: <code>{rid}</code></div>
          <div className="muted">Tone: <code>{inferredTone}</code></div>
        </div>
      </header>

      {/* Archetype summary if present */}
      {who?.archetype?.winner ? (
        <div className="card" style={{marginTop:12}}>
          <h3>Archetype</h3>
          <p className="muted" style={{marginTop:4}}>
            Selected: <strong>{String(who.archetype.winner)}</strong>
          </p>
        </div>
      ) : null}

      {Array.isArray(who?.narrative) && who.narrative.length ? (
        <div className="card" style={{marginTop: 12}}>
          <h3>Full Narrative</h3>
          <div style={{marginTop:8}}>
            {who.narrative.map((line:string, idx:number)=> (
              <p key={idx} style={{margin:'8px 0', lineHeight:1.7}}>{line}</p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="card" style={{marginTop:12}}>
        <h3>Interpersonal Style (E×A)</h3>
        {interpersonalPanel ? (
          <>
            {interpersonalPanel.title ? (<p className="muted" style={{marginTop:4}}>{interpersonalPanel.title}</p>) : null}
            {(interpersonalPanel.lines||[]).map((l:string,i:number)=>(<p key={i} style={{marginTop:4}}>{l}</p>))}
            {Array.isArray(interpersonalPanel.actions) && interpersonalPanel.actions.length ? (
              <ul style={{marginTop:8}}>{interpersonalPanel.actions.map((a:string,i:number)=>(<li key={i} className="muted">{a}</li>))}</ul>
            ) : null}
          </>
        ) : (
          <p className="muted" style={{marginTop:4}}>Adaptive / Balanced.</p>
        )}
      </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Work Style (C)</h3>
        {workPanel ? (
          <>
            {(workPanel.lines||[]).map((l:string,i:number)=>(<p key={i} style={{marginTop:4}}>{l}</p>))}
            {Array.isArray(workPanel.actions) && workPanel.actions.length ? (
              <ul style={{marginTop:8}}>{workPanel.actions.map((a:string,i:number)=>(<li key={i} className="muted">{a}</li>))}</ul>
            ) : null}
          </>
        ) : <p className="muted" style={{marginTop:4}}>Balances plans with motion.</p>}
    </div>

      <div className="card" style={{marginTop:12}}>
        <h3>Decision Style (O×C)</h3>
        {decisionPanel ? (
          <>
            {decisionPanel.title ? (<p className="muted" style={{marginTop:4}}>{decisionPanel.title}</p>) : null}
            {(decisionPanel.lines||[]).map((l:string,i:number)=>(<p key={i} style={{marginTop:4}}>{l}</p>))}
          </>
        ) : <p className="muted" style={{marginTop:4}}>Decide pragmatically based on context.</p>}
      </div>

      {stressHighs.length ? (
        <div className="card" style={{marginTop:12}}>
          <h3>Stress Pattern (N)</h3>
          <ul style={{marginTop:8}}>
            {stressHighs.map((s, i)=> (
              <li key={i} style={{marginTop:6}}>
                <strong>{s.facet}:</strong> <span className="muted">{s.meaning}</span>
                {s.move ? (<div className="muted" style={{marginTop:2}}>Move: {s.move}</div>) : null}
              </li>
            ))}
          </ul>
        </div>
            ) : null}

      <div className="card" style={{marginTop:12}}>
        <h3>Life Signals Snapshot</h3>
        <div className="row" style={{gap:12, marginTop:8, flexWrap:'wrap'}}>
          {topo.map(s=> {
            const level = toLevel(s.value);
            const base = lifePanels?.[s.key] || {};
            const variant = base?.tones?.[inferredTone];
            const copy = (variant?.levels?.[level]) || (base?.levels?.[level]) || '';
            return (
              <div key={s.key} className="card" style={{minWidth:260}}>
                <div className="row between" style={{alignItems:'center'}}>
                  <strong>{(variant?.name)||base.name||s.name}</strong>
                  <span className="badge">{Math.round(s.value*100)}%</span>
                </div>
                <div style={{background:'#333',height:6,borderRadius:4,overflow:'hidden',marginTop:8}}>
                  <div style={{background:'#4cafef',width:`${Math.round(s.value*100)}%`,height:'100%'}} />
                </div>
                {copy ? (<p className="muted" style={{marginTop:8}}>{copy}</p>) : null}
              </div>
            );
          })}
        </div>
        </div>

      <AuthorityBar hash={(handoff as any)?.hash || rid} />
      <FiveCardResults data={(fullResults as any[]).filter((r:any)=> ['O','C','E','A','N'].includes(r?.domain))} />
      <ExistentialCircuits domainMeans={who.derived.domainMeans} fullResults={fullResults} />
      {/* Hide T/P/S/D here to avoid duplicating Snapshot; Snapshot already shows these four */}
      <AllLifeSignals domainMeans={who.derived.domainMeans} tone={who.tone} hideKeys={['T','P','S','D']} />

      <div style={{marginTop:24, display:'flex', justifyContent:'center'}}>
        <a href={`/results?rid=${rid}`} className="btn">View Detailed Results →</a>
    </div>
    </main>
  );
}
