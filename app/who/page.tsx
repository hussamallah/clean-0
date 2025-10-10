"use client";
import { useEffect, useState } from "react";
import AuthorityBar from "@components/who/AuthorityBar";
import FiveCardResults from "@components/who/FiveCardResults";
import ExistentialCircuits from "@components/who/ExistentialCircuits";
import AllLifeSignals from "@components/who/AllLifeSignals";
import { buildWhoFromFullResults } from "@/lib/bigfive/who";
import { buildHandoff } from "@/lib/bigfive/handoff";
import { computeSignals } from "@/lib/bigfive/signals";

// ================= Types =================
type StressItem = {
  key: string;
  desc: string;
  move: string;
};

type SnapshotItem = {
  key: string;
  pct: number;
  meaning: string;
  move?: string;
};

type ConflictItem = {
  title: string;
  desc: string;
  tip: string;
};

type Circuit = {
  key: string;
  pct: number;
  meaning: string;
  risk: string;
  move: string;
};

type LifeSignal = {
  key: string;
  pct: number;
  desc: string;
};

type WhoResult = {
  resultId: string;
  tone: string;
  archetype: string;
  hash: string;
  weeklyFinishers: number;
  narrative: string[];
  interpersonal: {
    label: string;
    lines: string[];
    actions: string[];
  };
  workStyle: {
    heading: string;
    text: string;
    guidance: string;
    actions: string[];
  };
  decisionStyle: {
    heading: string;
    label: string;
    text: string;
    strength: string;
    risk: string;
    fix: string;
  };
  stress: StressItem[];
  snapshot: SnapshotItem[];
  conflicts: ConflictItem[];
  circuits: Circuit[];
  lifeSignals: LifeSignal[];
};

// ================= Narrative Builder =================
type NarrativeOptions = {
  includeNumbers?: boolean;
  includeAllSignals?: boolean;
  includeSnapshot?: boolean;
};

const defaultOpts: Required<NarrativeOptions> = {
  includeNumbers: true,
  includeAllSignals: true,
  includeSnapshot: true,
};

function formatInt(n: number) {
  return new Intl.NumberFormat().format(n);
}

function capitalize(s: any) {
  if (typeof s !== 'string' || !s) return s || '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildNarrativeStory(data: WhoResult, opts: NarrativeOptions = defaultOpts): string[] {
  const { includeNumbers, includeAllSignals, includeSnapshot } = { ...defaultOpts, ...opts };
  const out: string[] = [];

  // Header
  const archetype = capitalize(data.archetype || 'Unknown');
  const tone = capitalize(data.tone || 'neutral');
  const resultId = data.resultId || 'Unknown';
  const hash = data.hash || 'Unknown';
  const weeklyFinishers = data.weeklyFinishers || 0;
  
  const header = includeNumbers
    ? `You are the ${archetype}. ${tone} tone, result ${resultId}. This run is verified (hash ${hash}). This week, ${formatInt(weeklyFinishers)} people finished; you read yours now.`
    : `You are the ${archetype}. ${tone} tone. This run is verified.`;
  out.push(header);

  // Narrative blocks
  if (Array.isArray(data.narrative) && data.narrative.length) {
    out.push(data.narrative.slice(0, 5).join(' '));
    out.push(data.narrative.slice(5, 10).join(' '));
    out.push(data.narrative.slice(10).join(' '));
  }

  // Interpersonal, Work, Decision
  if (data.interpersonal) {
    const l0 = data.interpersonal.lines?.[0] ?? '';
    const l1 = data.interpersonal.lines?.[1] ?? '';
    const acts = (data.interpersonal.actions ?? []).join('; ');
    out.push(`Your stance with people is ${data.interpersonal.label.toLowerCase()}. ${l0} ${l1} Two concrete steps beat a perfect map: ${acts}.`);
  }

  if (data.workStyle) {
    out.push(`${data.workStyle.text} ${data.workStyle.guidance} Actions: ${(data.workStyle.actions ?? []).join('; ')}.`);
  }

  if (data.decisionStyle) {
    out.push(`${data.decisionStyle.label}. ${data.decisionStyle.text} ${data.decisionStyle.strength} ${data.decisionStyle.risk} ${data.decisionStyle.fix}`);
  }

  // Conflicts
  if (Array.isArray(data.conflicts) && data.conflicts.length) {
    const parts = data.conflicts.map(c => `${c.title.replace('Conflict Pair — ', '')}: ${c.desc} Tip: ${c.tip}`);
    out.push(`Tensions live inside your engine. ${parts.join(' ')}.`);
  }

  // Stress
  if (Array.isArray(data.stress) && data.stress.length) {
    const parts = data.stress.map(s => `${s.key}: ${s.desc} Move: ${s.move}`);
    out.push(`When pressure climbs, you respond with moves. ${parts.join(' ')}.`);
  }

  // Snapshot
  if (includeSnapshot && Array.isArray(data.snapshot) && data.snapshot.length) {
    const parts = data.snapshot.map(s => includeNumbers ? `${s.key} ${s.pct}% — ${s.meaning}` : `${s.key} — ${s.meaning}`);
    out.push(`Your frontline signals run hot and directional. ${parts.join(' ')}.`);
  }

  // Circuits
  if (Array.isArray(data.circuits) && data.circuits.length) {
    const parts = data.circuits.map(c => includeNumbers ? `${c.key} ${c.pct}% — ${c.meaning}. Risk: ${c.risk} Move: ${c.move}` : `${c.key} — ${c.meaning}. Risk: ${c.risk} Move: ${c.move}`);
    out.push(`Your circuits are bright. ${parts.join(' ')}.`);
  }

  // All Life Signals
  if (includeAllSignals && Array.isArray(data.lifeSignals) && data.lifeSignals.length) {
    const parts = data.lifeSignals.map(l => includeNumbers ? `${l.key} ${l.pct}% — ${l.desc}` : `${l.key} — ${l.desc}`);
    out.push(`All your life signals sit inside this pattern. ${parts.join(' ')}.`);
  }

  // Close
  out.push('This is your story: heat plus direction equals motion. Define the win, claim the lane, and work in short, certain cycles.');

  return out;
}

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
      
      // (debug narrative removed)
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

  // Build Story Narrative feature
  const archetypeStr = (typeof (who as any)?.archetype === 'string')
    ? String((who as any).archetype)
    : ((who as any)?.archetype?.winner ? String((who as any).archetype.winner) : 'Unknown');

  const whoResultData: WhoResult = {
    resultId: rid,
    tone: (who as any)?.tone || String(inferredTone) || 'neutral',
    archetype: archetypeStr,
    hash: (handoff as any)?.hash || rid,
    weeklyFinishers: 0,
    narrative: Array.isArray((who as any)?.narrative) ? (who as any).narrative : [],
    interpersonal: {
      label: interpersonalPanel?.title || 'Adaptive',
      lines: interpersonalPanel?.lines || [],
      actions: interpersonalPanel?.actions || []
    },
    workStyle: {
      heading: workPanel?.title || 'Work Style',
      text: (workPanel?.lines || []).join(' '),
      guidance: 'Work with intention',
      actions: workPanel?.actions || []
    },
    decisionStyle: {
      heading: decisionPanel?.title || 'Decision Style',
      label: decisionPanel?.title || 'Pragmatic',
      text: (decisionPanel?.lines || []).join(' '),
      strength: 'Adaptable',
      risk: 'Overthinking',
      fix: 'Set time limits'
    },
    stress: stressHighs.map(s => ({ key: s.facet, desc: s.meaning || '', move: s.move || '' })),
    snapshot: topo.map(t => ({
      key: t.key,
      pct: Math.round(t.value * 100),
      meaning: lifePanels?.[t.key]?.levels?.[toLevel(t.value)] || '',
      move: undefined
    })),
    conflicts: [],
    circuits: [],
    lifeSignals: topo.map(t => ({ key: t.key, pct: Math.round(t.value * 100), desc: lifePanels?.[t.key]?.levels?.[toLevel(t.value)] || '' }))
  };

  const storyParagraphs = buildNarrativeStory(whoResultData, { includeNumbers: true, includeAllSignals: false, includeSnapshot: false });

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

      {/* Narrative Story (feature) */}
      {Array.isArray(storyParagraphs) && storyParagraphs.length ? (
        <div className="card" style={{marginTop: 12}}>
          <h3>Narrative Story</h3>
          <div style={{marginTop:8}}>
            {storyParagraphs.map((p:string, i:number)=> (
              <p key={i} style={{margin:'8px 0', lineHeight:1.7}}>{p}</p>
            ))}
          </div>
        </div>
      ) : null}

      {/* Full Narrative removed per request */}

      {/* Narrative debug removed from UI */}

      {/* Interpersonal Style removed per request */}

      {/* Work Style removed per request */}

      {/* Decision Style removed per request */}

      {/* Stress Pattern removed per request */}

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
