"use client";

import { useSearchParams } from "next/navigation";

export default function ArctypsDualsPage(){
  const search = useSearchParams();
  const rid = search?.get('rid') || '';
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
          <p style={{ marginTop:8, marginBottom:18, color:'#f8d5db', textAlign:'center' }}>A dedicated space for head‑to‑head archetype visuals. Coming soon.</p>

          {/* Placeholder dual panels */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', gap:16 }}>
            {[1,2,3].map((i)=> (
              <div key={i} style={{
                border:'1px solid rgba(255,55,95,0.28)', borderRadius:16,
                background:'rgba(20,20,22,0.55)',
                boxShadow:'0 0 22px rgba(255,50,80,0.12) inset',
                padding:'16px 14px'
              }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <strong style={{ color:'#ffe3e8' }}>Dual #{i}</strong>
                  <span style={{ color:'#ff8596', fontSize:12 }}>VS</span>
                </div>
                <div style={{ height:8, marginTop:12, borderRadius:6, background:'rgba(255,70,110,0.18)', overflow:'hidden' }}>
                  <div style={{ width:`${30 + i*15}%`, height:'100%', background:'linear-gradient(90deg, #ff3b61, #ff6a3b)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}


