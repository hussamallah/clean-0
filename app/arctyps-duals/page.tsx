"use client";

import { useSearchParams } from "next/navigation";
import CTAButton from "@/components/CTAButton";
import { Suspense, useState } from "react";
import { buildPairNarrative } from "@/lib/bigfive/compatibility";

function ArctypsDualsContent(){
  const search = useSearchParams();
  const rid = search?.get('rid') || '';
  const [partnerCode, setPartnerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [cmp, setCmp] = useState<null | {score:number; perDomain:any; notes:string[]}>(null);
  const [pairNarr, setPairNarr] = useState<string>("");
  async function analyze(){
    if (!rid || !partnerCode) return;
    setLoading(true);
    try{
      const res = await fetch(`/api/compatibility?ridA=${encodeURIComponent(rid)}&ridB=${encodeURIComponent(partnerCode)}`, { cache:'no-store' });
      const data = await res.json();
      if (data?.result) {
        setCmp(data.result);
        try {
          const narr = buildPairNarrative((data.meansA||{}) as any, (data.meansB||{}) as any, data.result.notes||[]);
          setPairNarr(narr || "");
        } catch { setPairNarr(""); }
      }
    } finally { setLoading(false); }
  }
  return (
    <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', color: '#fff' }}>
      {/* Background layers: grid, radial glows, vignette */}
      <div style={{ position:'absolute', inset:0, background:'#09090b' }} />
      <div style={{
        position:'absolute', inset:0,
        backgroundImage:
          'repeating-linear-gradient(0deg, rgba(255,0,0,0.04) 0px, rgba(255,0,0,0.04) 1px, transparent 1px, transparent 40px),\
           repeating-linear-gradient(90deg, rgba(255,0,0,0.04) 0px, rgba(255,0,0,0.04) 1px, transparent 1px, transparent 40px)'
      }} />
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', filter:'blur(120px)', background:'radial-gradient(circle, rgba(255,42,78,0.25), transparent 60%)', top:-120, left:-80 }} />
      <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', filter:'blur(140px)', background:'radial-gradient(circle, rgba(255,72,0,0.18), transparent 65%)', bottom:-160, right:-100 }} />
      <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 60%, rgba(0,0,0,0.8) 100%)' }} />

      {/* CTA row (outside wrapper, top like Summary) */}
      <div style={{ position:'relative', zIndex:2, display:'flex', justifyContent:'center', padding:'16px' }}>
        <div style={{display:'flex', gap:12, flexWrap:'wrap', justifyContent:'center'}}>
          <CTAButton href={`/your-id${rid?`?rid=${rid}`:''}`}>🆔 ID Card</CTAButton>
          <CTAButton href={`/conflict-patterns${rid?`?rid=${rid}`:''}`}>🔍 Explore Conflict Pattern</CTAButton>
          <CTAButton href={`/compatibility${rid?`?rid=${rid}`:''}`}>🤝 Compatibility Report</CTAButton>
          <CTAButton href={`/existential-circuits${rid?`?rid=${rid}`:''}`}>🧠 Existential Circuits</CTAButton>
          <CTAButton href={`/summary${rid?`?rid=${rid}`:''}`}>📋 Summary</CTAButton>
          <CTAButton href={`/results${rid?`?rid=${rid}`:''}`}>📊 Full Analysis</CTAButton>
        </div>
      </div>

      {/* Center content */}
      <div style={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', padding:'40px 16px' }}>
        <div
          style={{
            width:'100%', maxWidth: 980,
            border:'1px solid rgba(255,55,95,0.35)',
            borderRadius:16,
            background:'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
            boxShadow:'0 10px 30px rgba(0,0,0,0.45), 0 0 60px rgba(255,60,90,0.20)',
            backdropFilter:'blur(6px)', WebkitBackdropFilter:'blur(6px)',
            padding:'28px 28px 24px'
          }}
        >
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <h1 style={{ margin:0, fontSize:28, fontWeight:900, letterSpacing:1, color:'#ffd1d9', textShadow:'0 0 14px rgba(255,70,100,0.45)' }}>Arctyps Duals</h1>
            {rid ? (<span style={{ fontSize:12, color:'#ff9aa8', border:'1px solid rgba(255,100,120,0.3)', padding:'4px 8px', borderRadius:8 }}>RID: {rid}</span>) : null}
          </div>
          <p style={{ marginTop:8, marginBottom:8, color:'#f8d5db', textAlign:'center' }}>Compare archetypes head‑to‑head. Enter a friend or partner code to preview.</p>
          
          

          {/* RID vs Partner code */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, flexWrap:'wrap', marginBottom:18 }}>
            <span style={{ fontSize:12, color:'#ff9aa8', border:'1px solid rgba(255,100,120,0.3)', padding:'6px 10px', borderRadius:8 }}>RID: {rid || '—'}</span>
            <span style={{ color:'#ff8596', fontWeight:700 }}>VS</span>
            <input
              value={partnerCode}
              onChange={e=> setPartnerCode(e.target.value)}
              placeholder="Enter partner code"
              style={{
                background:'rgba(20,20,22,0.55)',
                border:'1px solid rgba(255,55,95,0.35)',
                color:'#ffe3e8', padding:'8px 10px', borderRadius:8, minWidth:220
              }}
            />
            <button className="btn" onClick={analyze} disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze'}
            </button>
          </div>

          {cmp ? (
            <div className="card" style={{ marginTop:12, background:'rgba(20,20,22,0.55)' }}>
              <div style={{ fontWeight:700, marginBottom:8 }}>Compatibility Score</div>
              <div className="bar"><span style={{ width:`${cmp.score}%` }} /></div>
              <div className="row mt8" style={{ gap:8 }}>
                {(['O','C','E','A','S'] as const).map(k=> (
                  <div key={k} style={{ flex:'1 1 0' }}>
                    <div style={{ fontSize:12, opacity:.8 }}>{k}</div>
                    <div className="bar"><span style={{ width:`${Math.round((cmp.perDomain as any)[k]*100)}%` }} /></div>
                  </div>
                ))}
              </div>
              {cmp.notes?.length ? (
                <ul style={{ marginTop:10, paddingLeft:18 }}>
                  {cmp.notes.map((n:string,i:number)=>(<li key={i} style={{ fontSize:13, lineHeight:1.5 }}>{n}</li>))}
                </ul>
              ) : null}
              {pairNarr ? (
                <p style={{ marginTop:10, color:'#ffe3e8', fontStyle:'italic' }}>{pairNarr}</p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      
    </main>
  );
}

export default function ArctypsDualsPage(){
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <ArctypsDualsContent />
    </Suspense>
  );
}


