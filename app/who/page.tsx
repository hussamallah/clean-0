"use client";
import { useEffect, useState } from "react";
import FiveCardResults from "@components/who/FiveCardResults";
import ExistentialCircuits from "@components/who/ExistentialCircuits";
import AllLifeSignals from "@components/who/AllLifeSignals";
import { buildWhoFromFullResults } from "@/lib/bigfive/who";
import { buildHandoff } from "@/lib/bigfive/handoff";
import { sha256Hex } from "@/lib/crypto/sha256hex";
import { stableStringify } from "@/lib/bigfive/format";
import { computeSignals } from "@/lib/bigfive/signals";
import archetypeRules from "@/arctyps rules.json";

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

function limitWords(input: string, maxWords: number): string {
  const words = String(input || '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return words.slice(0, maxWords).join(' ');
}

function pseudoRandomIntFromString(seed: string, min: number, max: number): number {
  const lower = Math.floor(min);
  const upper = Math.floor(max);
  const span = upper - lower + 1;
  if (span <= 1) return lower;
  let h = 0 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h * 31) + seed.charCodeAt(i)) >>> 0;
  }
  return lower + (h % span);
}

type NarrativeDoc = {
  header: string[];
  core: string[];
  ops: {
    cycles: string[];
    daily: string[];
    guardrails: string[];
    stressMoves: string[];
  };
  snapshot: string[];
  close: string;
};

function buildNarrativeStory(
  data: WhoResult,
  opts: NarrativeOptions = defaultOpts
): NarrativeDoc {
  const { includeNumbers, includeAllSignals, includeSnapshot } = { ...defaultOpts, ...opts };

  // Header Proof
  const archetype = capitalize(data.archetype || 'Unknown');
  const tone = capitalize(data.tone || 'Neutral');
  const resultId = data.resultId || 'Unknown';
  const hash = data.hash || 'Unknown';
  const weeklyFinishers = data.weeklyFinishers ?? 0;

  const header = [
    includeNumbers
      ? `This run is verified (hash ${hash}). This week, ${formatInt(weeklyFinishers)} people finished; you read yours now.`
      : `This run is verified.`
  ];

  // Identity Narrative (Core Story) — 6–7 sentences, punchy, facet-first
  const core: string[] = [];
  const MAX_SENTENCES = 7;
  const MAX_FROM_NARR = 5;   // up to 5 from who.narrative
  const MAX_WORDS = 16;
  const MIN_WORDS = 6;

  const SOFTENERS = /\b(very|really|quite|somewhat|often|usually|maybe|perhaps|a bit|kind of|sort of)\b/gi;
  const FILLERS = /\b(that|just|actually|literally)\b/gi;
  const BOILERPLATE_DOMAIN = /^\s*Your\s+(Openness|Conscientiousness|Extraversion|Agreeableness|Neuroticism)\s+is\b/i;

  // domain + facet tokens for salience
  const TOKENS = [
    {k:'Openness', rx:/\bopenness\b/i, facets:[/imagin/i,/creativ/i,/ideas?/i,/beauty|art|music|literature|nature/i]},
    {k:'Conscientiousness', rx:/\bconscientiousness\b/i, facets:[/reliable|reliab/i,/execution|deliver|finish/i,/lanes?|scope|SOP/i]},
    {k:'Extraversion', rx:/\bextraversion\b/i, facets:[/tempo|momentum|visible|energ/i,/lead|initiat/i]},
    {k:'Agreeableness', rx:/\bagreeableness\b/i, facets:[/goodwill|trust|warm/i,/convert|align|coalition/i]},
    {k:'Neuroticism', rx:/\bneuroticism\b/i, facets:[/signals?|worry|anxiety|overload|frustration/i,/buffers?|resets?|guardrails?/i]}
  ];

  function splitSentences(text:string): string[] {
    return (text||'')
      .replace(/\s+/g,' ')
      .split(/(?<=[.!?])\s+/)
      .map(s=>s.trim())
      .filter(Boolean);
  }

  function clampWords(s:string): string {
    const words = s
      .replace(SOFTENERS,'')
      .replace(FILLERS,'')
      .replace(/\s+/g,' ')
      .trim()
      .split(' ');
    if (words.length <= MAX_WORDS) return words.join(' ');
    return words.slice(0, MAX_WORDS).join(' ') + '.';
  }

  function scoreSentence(s:string): number {
    let score = 0;
    for (const t of TOKENS) {
      if (t.rx.test(s)) score += 1; // downweight plain domain mentions
      for (const f of t.facets) if (f.test(s)) score += 3; // boost facet cues
    }
    // stressey, action, boundary cues
    if (/\b(tight cycles?|buffers?|resets?|guardrails?|boundar(y|ies))\b/i.test(s)) score += 2;
    if (/\b(define|commit|ship|move|drop scope|restart|request)\b/i.test(s)) score += 1;
    if (/\b(composed\s+force|regain\s+control|reliable\s+execution|set\s+tempo|momentum\s+visible)\b/i.test(s)) score += 2;
    return score;
  }

  // 1) candidates from who.narrative (first 5, next 5, rest)
  const n0 = Array.isArray(data.narrative) ? data.narrative.slice(0,5).join(' ') : '';
  const n1 = Array.isArray(data.narrative) ? data.narrative.slice(5,10).join(' ') : '';
  const n2 = Array.isArray(data.narrative) ? data.narrative.slice(10).join(' ') : '';
  let candidates = [...splitSentences(n0), ...splitSentences(n1), ...splitSentences(n2)];
  // Filter boilerplate and too-short lines; remove lone taglines like "Heat."
  candidates = candidates.filter(s => {
    const w = s.trim().split(/\s+/).filter(Boolean).length;
    if (w < MIN_WORDS) return false;
    if (BOILERPLATE_DOMAIN.test(s)) return false;
    if (/^heat\.?$/i.test(s)) return false;
    return true;
  });

  // 2) rank by facet salience, not literal domain-only spam
  const ranked = candidates
    .map((s,idx)=>({ s, idx, score: scoreSentence(s) }))
    .sort((a,b)=> b.score - a.score || a.idx - b.idx);

  // 3) enforce coverage: O C E A N if present; pick best sentence per domain first
  const picked: string[] = [];
  const used = new Set<number>();

  for (const t of TOKENS) {
    let bestIdx: number = -1;
    let bestScore: number = -Infinity;
    ranked.forEach((r, i) => {
      if (used.has(i)) return;
      if (t.rx.test(r.s) || t.facets.some(f => f.test(r.s))) {
        if (r.score > bestScore) { bestScore = r.score; bestIdx = i; }
      }
    });
    if (bestIdx >= 0) { picked.push(ranked[bestIdx].s); used.add(bestIdx); }
    if (picked.length >= MAX_FROM_NARR) break;
  }

  // 4) fill remaining narrative slots with next best facet-rich lines (avoid duplicates, clichés)
  for (let i=0; i<ranked.length && picked.length<MAX_FROM_NARR; i++){
    if (used.has(i)) continue;
    const s = ranked[i].s;
    if (/heat plus direction equals motion/i.test(s)) continue; // repetitive tagline
    picked.push(s);
    used.add(i);
  }

  // 5) compress to one tight paragraph, clamp words
  const compressed = picked.map(clampWords);

  // 6) snapshot-derived nuance removed per request

  // 7) stance line (exactly one sentence)
  let stanceLine = '';
  if (data.interpersonal){
    const stance = (data.interpersonal.label ?? 'Adaptive').toLowerCase();
    let l0 = (data.interpersonal.lines?.[0] ?? '').replace(/\s+/g,' ').trim();
    l0 = l0.replace(/^[Yy]ou\s+/, 'you '); // merge smoothly into one sentence
    stanceLine = clampWords(`Your stance with people is ${stance} and ${l0}`);
  }

  // 8) assemble to 6–7 sentences total
  const finalSentences: string[] = [];
  for (const s of compressed) { if (finalSentences.length < 6) finalSentences.push(s); }
  if (stanceLine && finalSentences.length < MAX_SENTENCES) finalSentences.push(stanceLine);
  if (!finalSentences.length) finalSentences.push('You set direction and move work to done.');

  core.push(finalSentences.join(' '));

  // Operational Layer
  const cycles: string[] = [];
  const daily: string[] = [];
  const guardrails: string[] = [];
  const stressMoves: string[] = [];

  // Cycles + WorkStyle
  if (data.workStyle) {
    const text = data.workStyle.text?.trim() ? data.workStyle.text : '';
    const guidance = data.workStyle.guidance?.trim() ? data.workStyle.guidance : '';
    if (text || guidance) cycles.push([text, guidance].filter(Boolean).join(' '));
    const acts = (data.workStyle.actions ?? []);
    if (acts.length) daily.push(...acts);
  }

  // Decision Guardrails
  if (data.decisionStyle) {
    const label = data.decisionStyle.label || '';
    const t = data.decisionStyle.text || '';
    const strength = data.decisionStyle.strength ? `Strength: ${data.decisionStyle.strength}.` : '';
    const risk = data.decisionStyle.risk ? `Risk: ${data.decisionStyle.risk}.` : '';
    const fix = data.decisionStyle.fix ? `${data.decisionStyle.fix}.` : '';
    guardrails.push(`${label}. ${t} ${strength} ${risk} ${fix}`.replace(/\s+/g, ' ').trim());
  }

  // Stress → Moves (short, 12 words max per line)
  if (Array.isArray(data.stress) && data.stress.length) {
    data.stress.forEach(s => {
      const key = s.key || 'Stress';
      const desc = s.desc || '';
      const move = s.move ? s.move : '';
      const lineRaw = `${key}: ${desc} ${move}`.trim();
      const line = limitWords(lineRaw, 12);
      stressMoves.push(line);
    });
  }

  // Life Signals Snapshot (one-line indicators only)
  const snapshot: string[] = [];
  if (includeSnapshot && Array.isArray(data.snapshot) && data.snapshot.length) {
    data.snapshot.forEach(s => {
      const line = includeNumbers
        ? `${s.key} ${s.pct}% — ${s.meaning}`
        : `${s.key} — ${s.meaning}`;
      snapshot.push(line);
    });
  }

  // Close
  const close = 'This is your story: heat plus direction equals motion. Define the win, claim the lane, and work in short, certain cycles.';

  // Optional: includeAllSignals as an appendix-style snapshot (still one-liners)
  if (includeAllSignals && Array.isArray(data.lifeSignals) && data.lifeSignals.length) {
    data.lifeSignals.forEach(l => {
      const line = includeNumbers ? `${l.key} ${l.pct}% — ${l.desc}` : `${l.key} — ${l.desc}`;
      snapshot.push(line);
    });
  }

  return { header, core, ops: { cycles, daily, guardrails, stressMoves }, snapshot, close };
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
  const [ridState, setRidState] = useState<string>(rid);

  useEffect(()=>{ import("@/lib/data/who_panels.json").then(m=> setPanels((m as any).default || m)); }, []);

  useEffect(()=>{
    async function run(){
      // If no rid in URL, try client fallback
      if (!rid){
        try{
          const stored = localStorage.getItem('gz_full_results');
          const results = stored ? JSON.parse(stored) : null;
          if (Array.isArray(results)){
            const ridLocal = (await sha256Hex(stableStringify(results))).slice(0,24);
            setRidState(ridLocal);
            setFullResults(results);
            const arch = (results as any[]).find(r=> r?.domain === 'ARCH')?.payload ?? null;
            const whoView = await buildWhoFromFullResults(results, ridLocal);
            const ho = await buildHandoff(results, ridLocal);
            const merged = arch ? { ...whoView, archetype: arch } : whoView;
            setWho(merged); setHandoff(ho);
            try { const audit = { rid: ridLocal, results, who: whoView, handoff: ho }; console.log('[WHO AUDIT]', audit); (globalThis as any).gzAudit = audit; } catch {}
            return;
          }
        } catch {}
        setError("Missing result id.");
        return;
      }

      // Try server by rid
      try{
        const res = await fetch(`/api/who/${rid}`, { cache:'no-store' });
        if (res.ok){
          const data = await res.json();
          const results = data?.results;
          if (!Array.isArray(results)){ setError("Invalid data"); return; }
          setRidState(rid);
          setFullResults(results);
          const arch = (results as any[]).find(r=> r?.domain === 'ARCH')?.payload ?? null;
          const whoView = data?.who ?? await buildWhoFromFullResults(results, rid);
          const ho = data?.handoff ?? await buildHandoff(results, rid);
          const merged = arch ? { ...whoView, archetype: arch } : whoView;
          setWho(merged); setHandoff(ho);
          try { const audit = { rid, results, who: whoView, handoff: ho }; console.log('[WHO AUDIT]', audit); (globalThis as any).gzAudit = audit; } catch {}
          return;
        }
      } catch {}

      // Fallback to client store if server not available
      try{
        const stored = localStorage.getItem('gz_full_results');
        const results = stored ? JSON.parse(stored) : null;
        if (Array.isArray(results)){
          const ridLocal = (await sha256Hex(stableStringify(results))).slice(0,24);
          setRidState(ridLocal);
          setFullResults(results);
          const arch = (results as any[]).find(r=> r?.domain === 'ARCH')?.payload ?? null;
          const whoView = await buildWhoFromFullResults(results, ridLocal);
          const ho = await buildHandoff(results, ridLocal);
          const merged = arch ? { ...whoView, archetype: arch } : whoView;
          setWho(merged); setHandoff(ho);
          try { const audit = { rid: ridLocal, results, who: whoView, handoff: ho }; console.log('[WHO AUDIT]', audit); (globalThis as any).gzAudit = audit; } catch {}
          return;
        }
      } catch {}
      setError("Not found");
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
  const ridUsed = ridState || rid;

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
  const archImgSrc = archetypeStr
    ? '/' + String(archetypeStr).toLowerCase().replace(/[^a-z0-9]+/g, '') + '.png'
    : null;

  const whoResultData: WhoResult = {
    resultId: ridUsed,
    tone: (who as any)?.tone || String(inferredTone) || 'neutral',
    archetype: archetypeStr,
    hash: (handoff as any)?.hash || ridUsed,
    weeklyFinishers: pseudoRandomIntFromString(String((handoff as any)?.hash || ridUsed), 1000, 2000),
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

  const storyDoc = buildNarrativeStory(
    whoResultData,
    { includeNumbers: true, includeAllSignals: false, includeSnapshot: false }
  );

  const arcMatch = (archetypeRules as any)?.archetypes?.find((a:any)=> String(a?.gz||'').toLowerCase() === String(archetypeStr).toLowerCase());
  const accentHex = arcMatch?.color?.hex || '#4cafef';

  return (
    <main>
      <div className="gz-theme container" style={{
        // Theme variables (scoped)
        ['--bg-color' as any]: '#121212',
        ['--surface-color' as any]: '#1e1e1e',
        ['--primary-text-color' as any]: '#e0e0e0',
        ['--secondary-text-color' as any]: '#a0a0a0',
        ['--accent-color' as any]: accentHex,
        ['--border-color' as any]: '#333',
        ['--progress-green' as any]: '#2ecc71',
        ['--progress-yellow' as any]: '#f1c40f',
        ['--progress-red' as any]: '#e74c3c',
        transform: 'scale(1.25)',
        transformOrigin: 'top center',
        width: '80%'
      }}>
        <header className="header">
          <h1>Who You Are</h1>
          {archImgSrc ? (
            <img src={archImgSrc} alt={`${archetypeStr} emblem`} className="archetype-img" />
          ) : null}
          <p className="archetype">{archetypeStr || '—'}</p>
        </header>

        {/* Identity Narrative */}
        {storyDoc ? (
          <section className="card">
            <h2>Identity Narrative</h2>
            <div>
              {storyDoc.core.map((p:string, i:number)=> (
                <p key={`core-${i}`}>{p}</p>
              ))}
            </div>
            <h3>Header Proof</h3>
            <div>
              {storyDoc.header.map((p:string, i:number)=> (
                <p key={`hdr-${i}`} className="meta-info">{p}</p>
              ))}
            </div>
          </section>
        ) : null}

        {/* Operational Layer */}
        {storyDoc ? (
          <section className="card">
            <h2>Operational Layer</h2>
            {storyDoc.ops.cycles.length ? (
              <>
                <h3>Cycles:</h3>
                <ul>
                  {storyDoc.ops.cycles.map((p:string, i:number)=> (<li key={`cy-${i}`}>{p}</li>))}
                </ul>
              </>
            ) : null}
            {storyDoc.ops.daily.length ? (
              <>
                <h3>Daily actions:</h3>
                <ul>
                  {storyDoc.ops.daily.map((p:string, i:number)=> (<li key={`da-${i}`}>{p}</li>))}
                </ul>
              </>
            ) : null}
            {storyDoc.ops.guardrails.length ? (
              <>
                <h3>Guardrails:</h3>
                <ul>
                  {storyDoc.ops.guardrails.map((p:string, i:number)=> (<li key={`gr-${i}`}>{p}</li>))}
                </ul>
              </>
            ) : null}
            {storyDoc.ops.stressMoves.length ? (
              <>
                <h3>Stress Response Moves:</h3>
                <ul>
                  {storyDoc.ops.stressMoves.map((p:string, i:number)=> (<li key={`sm-${i}`}>{p}</li>))}
                </ul>
              </>
            ) : null}
            <p className="final-line" style={{marginTop:12, color:'var(--accent-color)'}}><strong>{storyDoc.close}</strong></p>
          </section>
        ) : null}

      {/* Full Narrative removed per request */}

      {/* Narrative debug removed from UI */}

      {/* Interpersonal Style removed per request */}

      {/* Work Style removed per request */}

      {/* Decision Style removed per request */}

      {/* Stress Pattern removed per request */}

        {/* AuthorityBar removed per request */}
        <FiveCardResults data={(fullResults as any[]).filter((r:any)=> ['O','C','E','A','N'].includes(r?.domain))} />
        <ExistentialCircuits domainMeans={who.derived.domainMeans} fullResults={fullResults} />
        <AllLifeSignals domainMeans={who.derived.domainMeans} tone={who.tone} hideKeys={['T','P','S','D']} />

        <div style={{marginTop:24, display:'flex', justifyContent:'center'}}>
          <a href={`/results?rid=${ridUsed}`} className="btn">View Detailed Results →</a>
        </div>

        <style jsx>{`
          .gz-theme.container { max-width: 800px; margin: 0 auto; display: grid; gap: 24px; }
          .header { text-align: center; padding: 20px; border-bottom: 1px solid var(--border-color); }
          .header h1 { font-size: 2.0rem; font-weight: 700; margin-bottom: 8px; color: var(--primary-text-color); }
          .archetype { font-size: 1.2rem; font-weight: 600; color: var(--accent-color); text-transform: uppercase; letter-spacing: 2px; }
          .archetype-img { display: inline-block; margin-top: 8px; height: 240px; width: auto; object-fit: contain; }
          .meta-info { font-size: 0.9rem; color: var(--secondary-text-color); margin-top: 8px; }
          .final-line { font-size: 1.05rem; color: var(--accent-color); letter-spacing: 0.3px; }
          .card { background-color: var(--surface-color); border-radius: 12px; padding: 24px; border: 1px solid var(--border-color); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
          .card h2 { font-size: 1.4rem; font-weight: 700; color: var(--accent-color); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); }
          .card h3 { font-size: 1.1rem; font-weight: 600; color: var(--primary-text-color); margin-top: 16px; margin-bottom: 6px; }
          .card p { margin: 8px 0; color: var(--secondary-text-color); line-height: 1.7; }
          .card ul { list-style: none; padding-left: 0; }
          .card li { background-color: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid var(--accent-color); }
        `}</style>
      </div>
    </main>
  );
}
