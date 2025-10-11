"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import bank from "@/gz-final/bankv1.json";
import { DOMAINS, canonicalFacets } from "@/lib/bigfive/constants";
import { resolveWithArctypsRules } from "@/arctyps routing";
import archRules from "@/arctyps rules.json";
import { getFacetScoreLevel, toPercentFromRaw, stableStringify } from "@/lib/bigfive/format";
import { sha256Hex } from "@/lib/crypto/sha256hex";

type DomainKey = keyof typeof DOMAINS; // 'O'|'C'|'E'|'A'|'N'

function toCanonicalFacet(domain: DomainKey, facet: string): string {
  if (domain === 'O' && facet === 'Values Openness') return 'Liberalism';
  return facet;
}

export default function GZFinalAssessment(){
  const router = useRouter();
  const basePath = useMemo(()=> (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, ''), []);
  const assetUrl = (p:string)=> `${basePath}${p}`;
  // Archetype UI meta: title, image, and bird description
  const ARCHETYPE_META: Record<string, { title: string; img: string; desc: string }> = useMemo(()=>({
    sovereign: { title:'Sovereign', img:'/sovereign.png', desc:'I rise in direct ascent, wings locked, owning the sky. Nothing above me but the sun itself.' },
    rebel:     { title:'Rebel',     img:'/rebel.png',     desc:'I twist through air in erratic bursts, sharp turns breaking every pattern mid-flight. Order means nothing to me.' },
    visionary: { title:'Visionary', img:'/visionary.png', desc:'I carve long arcs forward, eyes set on horizons no one else has seen yet. My body lives in tomorrow\'s wind.' },
    navigator: { title:'Navigator', img:'/navigator.png', desc:'I glide across endless distances, adjusting course through every crosswind. Storm or calm, I find the way.' },
    guardian:  { title:'Guardian',  img:'/guardian.png',  desc:'I circle wide, watching, shielding the formation. Approach with peace and I stay graceful; threaten and I rise fierce.' },
    seeker:    { title:'Seeker',    img:'/seeker.png',    desc:'I dive with piercing precision, cutting through veils and illusions. What lies beneath is mine to uncover.' },
    architect: { title:'Architect', img:'/architect.png', desc:'I climb in measured steps, every angle chosen, every strand reinforced. My flight builds as much as it moves.' },
    spotlight: { title:'Spotlight', img:'/spotlight.png', desc:'I spiral upward, radiant, all eyes pulled to my shimmer. Flight is my stage, the sky my mirror.' },
    diplomat:  { title:'Diplomat',  img:'/diplomat.png',  desc:'I weave gently through the currents, smoothing turbulence, easing the path of those beside me.' },
    partner:   { title:'Partner',   img:'/partner.png',   desc:'I fly in water if not in sky, always wing-to-wing, never breaking from the one I\'ve chosen.' },
    provider:  { title:'Provider',  img:'/provider.png',  desc:'I lift with strength enough for others, carrying their weight in my draft. My currents are never just for me.' },
    catalyst:  { title:'Catalyst',  img:'/catalyst.png',  desc:'I explode off the air in impossible speed, scattering stillness, igniting motion where none existed.' },
    vessel:    { title:'Vessel',    img:'/vessel.png',    desc:'I stroke the air in slow, deliberate movements, each motion refined, each landing an act of grace.' }
  }), []);

  // Short per-archetype hints for final match subtitles (dynamic, not axis-generic)
  const ARCHETYPE_HINTS: Record<string, string> = useMemo(()=>({
    sovereign: 'Lead with structure, authority, and decisive pace',
    rebel: 'Break constraints; favor independence over consensus',
    visionary: 'Invent through ideas; pull toward unseen horizons',
    navigator: 'Guide through change; adjust course with people',
    guardian: 'Protect the formation; push momentum when needed',
    seeker: 'Cut through noise; dig for the underlying truth',
    architect: 'Design and build systems; deliberate and precise',
    spotlight: 'Energize the room; pull focus and lift morale',
    diplomat: 'Smooth turbulence; connect through empathy',
    partner: 'Stabilize the group; keep the lane steady',
    provider: 'Carry the load; reliability for others',
    vessel: 'Move with grace; keep peace and composure'
  }), []);
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
  const [step, setStep] = useState<'bin'|'likert'|'arch'|'done'>('bin');
  const [finalScores, setFinalScores] = useState<Record<DomainKey, Record<string, number>>>(()=> ({ O:{}, C:{}, E:{}, A:{}, N:{} } as any));
  const personalization = useRef<DomainKey | null>(null);
  // Archetype mini-quiz state
  type TriadProbe = { type:'single_choice'; question:string; options:Array<{id:string; label:string}> };
  type BinaryProbe = { type:'binary'; question:string; left:{id:string; label:string}; right:{id:string; label:string}; meta?:{ stage?:'pair'|'final'; present?:'image_pair'|'binary' } };
  type AnyProbe = TriadProbe | BinaryProbe;
  const [archProbe, setArchProbe] = useState<AnyProbe|null>(null);
  const archResolveRef = useRef<((id:string)=>void)|null>(null);
  const archStarted = useRef(false);
  const [archWinner, setArchWinner] = useState<string|null>(null);
  const archTrace = useRef<Array<{ q:string; type:'triad'|'binary'; options:string[]; pick:string }>>([]);
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
        const raw = A_raw[f];
        if (raw >= 5) return [f, 'High' as 'High'|'Medium'|'Low'];
        if (raw <= 2) return [f, 'Low' as 'High'|'Medium'|'Low'];
        return [f, 'Medium' as 'High'|'Medium'|'Low'];
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
    // Append Archetype result if present
    if (archWinner){
      (results as any).push({
        domain: 'ARCH',
        payload: { winner: archWinner, trace: archTrace.current }
      });
    }

    try{
      const res = await fetch('/api/runs', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ results }) });
      if (res.ok){
        const data = await res.json();
        const rid = data?.rid;
        if (typeof rid === 'string' && rid.length){
          router.push(`/who?rid=${rid}`);
          return;
        }
      }
      // fallback: compute client rid deterministically and route to who page
      try {
        const rid = await sha256Hex(stableStringify(results)).then(s=> s.slice(0,24));
        localStorage.setItem('gz_full_results', JSON.stringify(results));
        router.push(`/who?rid=${rid}`);
        return;
      } catch {}
      // last resort: route to results
      try { localStorage.setItem('gz_full_results', JSON.stringify(results)); } catch {}
      router.push('/results');
    } catch {
      try {
        const rid = await sha256Hex(stableStringify(results)).then(s=> s.slice(0,24));
        localStorage.setItem('gz_full_results', JSON.stringify(results));
        router.push(`/who?rid=${rid}`);
        return;
      } catch {}
      try { localStorage.setItem('gz_full_results', JSON.stringify(results)); } catch {}
      router.push('/results');
    }
  }

  // Render
  const total = facetList.length;
  const current = facetList[idx];

  if (!current && step !== 'done') return <div className="card">Loading…</div>;

  if (step === 'bin' && current){
    const d = current.domain;
    return (
      <div className="card">
        <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2>{DOMAINS[d].label} — {toCanonicalFacet(d, current.facet)}</h2>
          </div>
          <div className="pill">{idx+1}/{total}</div>
        </div>
        <div className="card" style={{borderStyle:'dashed' as any, marginTop:12}}>{current.binQ}</div>
        <div className="row mt16">
          <button className="rate btn" onClick={()=>{
            // Yes → Final Score = 5, go next facet
            setFinalScores(prev=> ({ ...prev, [d]: { ...(prev[d]||{}), [toCanonicalFacet(d, current.facet)]: 5 } } as any));
            if (idx+1 < total){ setIdx(idx+1); setStep('bin'); } else { setStep('arch'); }
          }}>Yes</button>
          <button className="rate btn" onClick={()=> setStep('likert')}>No</button>
        </div>
      </div>
    );
  }

  if (step === 'likert' && current){
    const d = current.domain;
    const ratings = [
      { text: 'Very Inaccurate', val: 1 },
      { text: 'Moderately Inaccurate', val: 2 },
      { text: 'Neutral', val: 3 },
      { text: 'Moderately Accurate', val: 4 },
      { text: 'Very Accurate', val: 5 }
    ] as const;
    return (
      <div className="card">
        <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h2>{DOMAINS[d].label} — {toCanonicalFacet(d, current.facet)}</h2>
            <p className="muted">Scale: Very Inaccurate → Very Accurate</p>
          </div>
          <div className="pill">{idx+1}/{total}</div>
        </div>
        <div className="card" style={{borderStyle:'dashed' as any, marginTop:12}}>{current.likQ}</div>
        <div className="row mt16">
          {ratings.map(r=> (
            <button key={r.val} className="rate btn" onClick={()=>{
              // No → Likert reverse-scored mapping per spec
              // Likert 1→5, 2→4, 3→3, 4→2, 5→1
              const map: Record<number, number> = { 1:5, 2:4, 3:3, 4:2, 5:1 };
              const final = map[r.val as number] ?? 3;
              setFinalScores(prev=> ({ ...prev, [d]: { ...(prev[d]||{}), [toCanonicalFacet(d, current.facet)]: final } } as any));
              if (idx+1 < total){ setIdx(idx+1); setStep('bin'); } else { setStep('arch'); }
            }}>{r.text}</button>
          ))}
        </div>
        <div className="row mt16" style={{justifyContent:'flex-start'}}>
          <button className="ghost" onClick={()=> setStep('bin')}>Back</button>
        </div>
      </div>
    );
  }

  // personalization step removed

  // Archetype mini-quiz driver
  if (step === 'arch'){
    // Start the resolver once
    if (!archStarted.current){
      archStarted.current = true;
      (async () => {
        const ask = async (probe: AnyProbe): Promise<string> => {
          return new Promise<string>((resolve) => {
            setArchProbe(probe);
            archResolveRef.current = (id:string)=>{
              // record trace
              if (probe.type === 'single_choice'){
                archTrace.current.push({ q: probe.question, type:'triad', options: probe.options.map(o=>o.label), pick: id });
              } else {
                archTrace.current.push({ q: probe.question, type:'binary', options: [probe.left.label, probe.right.label], pick: id });
              }
              resolve(id);
            };
          });
        };
        try{
          // 1) Build user buckets from finalScores
          const domains: Record<DomainKey, { mean: number; bucket: 'High'|'Medium'|'Low'; facet: Record<string,'High'|'Medium'|'Low'> }> = { O: {} as any, C: {} as any, E: {} as any, A: {} as any, N: {} as any };
          const toBucket = (v:number): 'High'|'Medium'|'Low' => (v>=5?'High':(v<=2?'Low':'Medium'));
          for (const d of domainOrder){
            const facs = canonicalFacets(d);
            const raw = facs.map(f=> Math.max(1, Math.min(5, finalScores[d]?.[toCanonicalFacet(d,f)] ?? 3)));
            const mean = Math.round((raw.reduce((a,c)=>a+c,0)/raw.length)*100)/100;
            const facetBuckets: Record<string,'High'|'Medium'|'Low'> = {} as any;
            facs.forEach((f,i)=>{ facetBuckets[f] = toBucket(raw[i]); });
            const meanBucket: 'High'|'Medium'|'Low' = (mean>=4.0?'High':(mean<=2.0?'Low':'Medium'));
            domains[d] = { mean, bucket: meanBucket, facet: facetBuckets } as any;
          }

          // 2) Evaluate JSON rules to select matching archetypes
          type Bucket = 'High'|'Medium'|'Low';
          const A = (archRules as any).archetypes as Array<any>;
          function passFacetCluster(d:DomainKey, cluster:any): boolean {
            if (!cluster) return true;
            if (cluster.require){
              return Array.isArray(cluster.require) && cluster.require.every((r:any)=> domains[d].facet[r.facet] === r.bucket);
            }
            if (typeof cluster.min_high === 'number' && Array.isArray(cluster.facets)){
              let c=0; for (const f of cluster.facets){ if (domains[d].facet[f]==='High') c++; }
              return c >= cluster.min_high;
            }
            if (Array.isArray(cluster.any_high)){
              return cluster.any_high.some((f:string)=> domains[d].facet[f]==='High');
            }
            if (Array.isArray(cluster.any_low)){
              return cluster.any_low.some((f:string)=> domains[d].facet[f]==='Low');
            }
            return true;
          }
          function matchesRules(ar:any): boolean {
            const domReq = ar?.rules?.domains || {};
            for (const k of Object.keys(domReq||{}) as DomainKey[]){
              const want = domReq[k] as Bucket; if (!want) continue;
              if (domains[k].bucket !== want) return false;
            }
            const clusters = ar?.rules?.facet_clusters || {};
            for (const k of Object.keys(clusters||{}) as DomainKey[]){
              if (!passFacetCluster(k, clusters[k])) return false;
            }
            return true;
          }
          let ids = A.filter(matchesRules).map(x=> x.id as string);
          // Ensure sufficient pool: if <4, backfill with most divergent from the matched set first
          if (ids.length < 4){
            const all = A.map(x=>x.id as string);
            const rest = all.filter(x=> !ids.includes(x));
            ids = ids.concat(rest.slice(0, Math.max(0, 4-ids.length)));
          }
          // Keep deterministic order but cap unreasonable size (12 → ok); winners will bracket down
          const winner = await resolveWithArctypsRules(ids, ask);
          setArchWinner(winner);
        } finally {
          setArchProbe(null);
          setStep('done');
        }
      })();
    }
    // Render current probe UI
    if (!archProbe){
      return (
        <div className="card">
          <h2>Finding your archetype…</h2>
          <p className="muted">Setting up a quick 2–3 question tie-breaker.</p>
        </div>
      );
    }
    if (archProbe.type === 'single_choice'){
      const fallbackTriadQ = (archRules as any)?.tie_layer?.fallbacks?.triad_question as string | undefined;
      const isFallbackTriad = fallbackTriadQ && archProbe.question === fallbackTriadQ;
      return (
        <div className="card">
          <h2>Quick mini-quiz</h2>
          <div className="card" style={{borderStyle:'dashed' as any, marginTop:12}}>{archProbe.question}</div>
          {isFallbackTriad ? (
            <div className="facet-grid mt8" style={{gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))'}}>
              {archProbe.options.map(o=> {
                const meta = ARCHETYPE_META[o.id] || { title:o.id, img:'/equalizer.png', desc:o.label };
                return (
                  <button key={o.id} className="btn-chip" style={{padding:0, background:'transparent'}} onClick={()=> archResolveRef.current?.(o.id)}>
                    <div className="card" style={{background:'#111', border:'1px solid #333'}}>
                      <div style={{textAlign:'center', padding:'8px 8px 0 8px'}}>
                        <strong>{meta.title}</strong>
                      </div>
            <div style={{display:'flex',justifyContent:'center',alignItems:'center',padding:'8px'}}>
              <img src={assetUrl(meta.img)} alt={meta.title} style={{maxWidth:'100%', height:140, objectFit:'contain', borderRadius:8}}
                onError={(e)=>{ e.currentTarget.onerror=null as any; e.currentTarget.src=assetUrl('/equalizer.png'); }} />
            </div>
                      <div style={{padding:'0 12px 12px 12px'}}>
                        <p className="muted" style={{fontSize:12, lineHeight:1.4}}>{meta.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="facet-grid mt8">
              {archProbe.options.map(o=> (
                <button key={o.id} className="btn-chip" onClick={()=> archResolveRef.current?.(o.id)}>
                  <b>{o.label}</b>
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }
    const isImagePair = (archProbe as any)?.meta?.present === 'image_pair';
    if (isImagePair){
      const L = archProbe.left.id; const R = archProbe.right.id;
      const leftMeta  = ARCHETYPE_META[L] || { title: L, img:'/equalizer.png', desc: L };
      const rightMeta = ARCHETYPE_META[R] || { title: R, img:'/equalizer.png', desc: R };
      return (
        <div className="card">
          <div className="row mt16" style={{gap:24, alignItems:'center', justifyContent:'center', flexWrap:'wrap' as any}}>
            <button className="btn" style={{padding:0, background:'transparent'}} onClick={()=> archResolveRef.current?.(L)}>
              <div className="card" style={{width:260, background:'#111', border:'1px solid #333'}}>
                <div style={{textAlign:'center', padding:'8px 8px 0 8px'}}><strong>{leftMeta.title}</strong></div>
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',padding:'8px'}}>
                  <img src={assetUrl(leftMeta.img)} alt={leftMeta.title} style={{maxWidth:'100%', height:140, objectFit:'contain', borderRadius:8}}
                    onError={(e)=>{ e.currentTarget.onerror=null as any; e.currentTarget.src=assetUrl('/equalizer.png'); }} />
                </div>
                <div style={{padding:'0 12px 12px 12px'}}>
                  <p className="muted" style={{fontSize:12, lineHeight:1.4}}>{leftMeta.desc}</p>
                </div>
              </div>
            </button>
            <div style={{width:48,height:48,borderRadius:24,background:'#b81f1f',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700}}>VS</div>
            <button className="btn" style={{padding:0, background:'transparent'}} onClick={()=> archResolveRef.current?.(R)}>
              <div className="card" style={{width:260, background:'#111', border:'1px solid #333'}}>
                <div style={{textAlign:'center', padding:'8px 8px 0 8px'}}><strong>{rightMeta.title}</strong></div>
                <div style={{display:'flex',justifyContent:'center',alignItems:'center',padding:'8px'}}>
                  <img src={assetUrl(rightMeta.img)} alt={rightMeta.title} style={{maxWidth:'100%', height:140, objectFit:'contain', borderRadius:8}}
                    onError={(e)=>{ e.currentTarget.onerror=null as any; e.currentTarget.src=assetUrl('/equalizer.png'); }} />
                </div>
                <div style={{padding:'0 12px 12px 12px'}}>
                  <p className="muted" style={{fontSize:12, lineHeight:1.4}}>{rightMeta.desc}</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      );
    }
    return (
      <div className="card">
        <h2>Quick mini-quiz</h2>
        <div className="card" style={{borderStyle:'dashed' as any, marginTop:12}}>{archProbe.question}</div>
        <div className="row mt16" style={{gap:12, flexWrap:'wrap' as any}}>
          <button className="btn" onClick={()=> archResolveRef.current?.(archProbe.left.id)}>
            <span className="muted" style={{fontSize:12}}>
              {ARCHETYPE_HINTS[archProbe.left.id]}
            </span>
          </button>
          <button className="btn" onClick={()=> archResolveRef.current?.(archProbe.right.id)}>
            <span className="muted" style={{fontSize:12}}>
              {ARCHETYPE_HINTS[archProbe.right.id]}
            </span>
          </button>
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


