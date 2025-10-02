"use client";
import React, { useMemo } from "react";
import { computeSignals, type DomainMeans, CUTLINE_HIGH, CUTLINE_MEDMIN, CUTLINE_MEDMAX } from "@/lib/bigfive/signals";

type Level = 'High'|'Medium'|'Low';

function levelOf(v: number): Level {
  if (v >= CUTLINE_HIGH) return 'High';
  if (v >= CUTLINE_MEDMIN && v <= CUTLINE_MEDMAX) return 'Medium';
  return 'Low';
}

// Per-signal copy variants keyed by level
const signalCopy: Record<string, Partial<Record<Level, string>>> = {
  T: {
    High: 'Threat: Pain avoidance runs hot; you scan for risks first.',
    Medium: 'Threat: You notice risk and plan around it when needed.',
    Low: 'Threat: Signal stays low; you move without much caution.'
  },
  P: {
    High: 'Pursuit: Strong exploration/build drive; you move proactively.',
    Medium: 'Pursuit: Moderate; you move when the case is clear.',
    Low: 'Pursuit: Exploration lower; you hold back until safe.'
  },
  S: {
    High: 'Social Buffer: You bond and soothe easily; steadying in teams.',
    Medium: 'Social Buffer: Capacity to bond and soothe is moderate.',
    Low: 'Social Buffer: Buffer runs low; you self‑regulate more than co‑regulate.'
  },
  D: {
    High: 'Dominance/Drive: You push forward and assert control often.',
    Medium: 'Dominance/Drive: You can take charge when needed.',
    Low: 'Dominance/Drive: Low; you rarely push or direct others.'
  }
};

function lineFor(key: string, v: number): string {
  const lvl = levelOf(v);
  const map = signalCopy[key] || {};
  return map[lvl] || `${key}: ${lvl.toLowerCase()} level.`;
}

export default function LifeSignalNudge({ domain, domainMeanRaw, onNext, progressIndex, total }:{ domain: 'O'|'C'|'E'|'A'|'N'; domainMeanRaw: number; onNext: ()=>void; progressIndex: number; total: number }){

  // Don't show life signal for domain 5 (Neuroticism) - assessment completes
  if (domain === 'N') {
    // Auto-redirect after 2 seconds
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onNext();
      }, 2000);
      return () => clearTimeout(timer);
    }, [onNext]);

    return (
      <div className="card" style={{background:'#0f1420', border:'1px solid #25324a', borderRadius:10, padding:16, marginBottom:12}}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize:12, color:'#9aa3ad'}}>Assessment Complete</div>
          <div style={{fontSize:14, color:'#d6e5ff'}}>All domains finished. Processing your results...</div>
          <div style={{fontSize:12, color:'#9aa3ad', marginTop:4}}>You've done it.</div>
        </div>
      </div>
    );
  }

  // Read all completed domain results to compute proper life signals
  const domainMeans = useMemo(()=>{
    try{
      const raw = localStorage.getItem('gz_full_results');
      if (!raw) return null;
      const results = JSON.parse(raw) || [];
      
      // Build domain means from completed results
      const means: DomainMeans = { O: 3, C: 3, E: 3, A: 3, N: 3 }; // defaults
      
      for (const result of results) {
        const d = result.domain as keyof DomainMeans;
        const mean = result?.payload?.final?.domain_mean_raw;
        if (typeof mean === 'number') {
          means[d] = mean;
        }
      }
      
      // Add current domain result
      means[domain] = domainMeanRaw;
      
      return means;
    } catch { 
      // Fallback: use current domain with defaults
      const means: DomainMeans = { O: 3, C: 3, E: 3, A: 3, N: 3 };
      means[domain] = domainMeanRaw;
      return means;
    }
  }, [domain, domainMeanRaw]);

  const { key, value } = useMemo(()=>{
    if (!domainMeans) return { key: 'T', value: 0.5 };
    
    const signals = computeSignals(domainMeans);
    
    // Show signals based on new domain order: E, C, A, O, N
    if (domain === 'E') return { key: 'P', value: signals.P };  // Extraversion → Pursuit (P = 0.4*O + 0.35*E + 0.25*C - E has weight 0.35, O and C not available yet)
    if (domain === 'C') return { key: 'D', value: signals.D };  // Conscientiousness → Dominance/Drive (D = 0.55*E + 0.45*C - both E and C now available)
    if (domain === 'A') return { key: 'S', value: signals.S };  // Agreeableness → Social Buffer (S = z(A) - direct relationship)
    if (domain === 'O') return { key: 'P', value: signals.P };  // Openness → Pursuit (P = 0.4*O + 0.35*E + 0.25*C - O, E, C all available)
    if (domain === 'N') return { key: 'T', value: signals.T };  // Neuroticism → Threat (T = z(N) - direct relationship)
    
    // Default to T if no match
    return { key: 'T', value: signals.T };
  }, [domainMeans, domain]);

  const line = useMemo(()=>{
    return lineFor(key, value);
  }, [key, value]);

  const encouragement = useMemo(()=>{
    const i = progressIndex;
    const n = total;
    if (i <= 0) return 'Keep going.';
    if (i === 1) return 'Keep moving.';
    if (i === 2) return 'Not much left.';
    if (i === n - 1) return "You've done it.";
    return 'Almost there.';
  }, [progressIndex, total]);

  return (
    <div className="card" style={{background:'#0f1420', border:'1px solid #25324a', borderRadius:10, padding:16, marginBottom:12}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontSize:12, color:'#9aa3ad'}}>Life Signal Preview</div>
          <div style={{fontSize:14, color:'#d6e5ff'}}>{line}</div>
          <div style={{fontSize:12, color:'#9aa3ad', marginTop:4}}>{encouragement}</div>
        </div>
        <button className="btn" onClick={onNext} style={{marginLeft:12}}>Keep going</button>
      </div>
      <div style={{height:6, background:'#182236', borderRadius:4, overflow:'hidden', marginTop:10}}>
        <div style={{width:`${Math.round(value*100)}%`, height:'100%', background:'#4cafef'}} />
      </div>
      <div style={{fontSize:10, color:'#666', marginTop:6, fontStyle:'italic'}}>
        *Based on partial data - final results may vary
      </div>
    </div>
  );
}


