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
      <div className="card" style={{
        background: 'linear-gradient(135deg, #2d1b69 0%, #1e3c72 50%, #2a5298 100%)',
        border: '1px solid #4a6fa5',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)'
      }}>
        <div style={{textAlign: 'center'}}>
          <div style={{fontSize: '12px', color: '#a8c8e8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px'}}>
            Assessment Complete
          </div>
          <div style={{fontSize: '16px', color: '#f0f8ff', fontWeight: '500', marginTop: '8px'}}>
            All domains finished. Processing your results...
          </div>
          <div style={{fontSize: '12px', color: '#a8c8e8', marginTop: '8px', fontStyle: 'italic'}}>
            You've done it.
          </div>
        </div>
      </div>
    );
  }

  // Read all completed domain results to compute proper life signals
  const domainMeans = useMemo(()=>{
    try{
      const raw = localStorage.getItem('gz_full_results');
      const results = raw ? JSON.parse(raw) || [] : [];
      
      
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
    } catch (error) { 
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
    if (domain === 'E') return { key: 'P', value: signals.P };  // Extraversion → Pursuit
    if (domain === 'C') return { key: 'D', value: signals.D };  // Conscientiousness → Dominance/Drive
    if (domain === 'A') return { key: 'S', value: signals.S };  // Agreeableness → Social Buffer
    if (domain === 'O') return { key: 'T', value: signals.T };  // Openness → Threat
    if (domain === 'N') return { key: 'T', value: signals.T };  // Neuroticism → Threat
    
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
    <div className="card" style={{
      background: 'linear-gradient(135deg, #1e1e3f 0%, #2a2a5a 50%, #3a3a7a 100%)',
      border: '1px solid #4a4a8a',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px',
      boxShadow: '0 12px 32px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '16px'}}>
        <div>
          <div style={{
            fontSize: '12px', 
            color: '#a8c8e8', 
            fontWeight: '600', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px',
            marginBottom: '8px'
          }}>
            Life Signal Preview
          </div>
          <div style={{
            fontSize: '16px', 
            color: '#f0f8ff', 
            fontWeight: '500',
            lineHeight: '1.4',
            marginBottom: '8px'
          }}>
            {line}
          </div>
          <div style={{
            fontSize: '12px', 
            color: '#a8c8e8', 
            fontStyle: 'italic'
          }}>
            {encouragement}
          </div>
        </div>
        <button 
          className="btn" 
          onClick={onNext} 
          style={{
            marginLeft: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            fontWeight: '600',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)'
          }}
        >
          Keep going
        </button>
      </div>
      <div style={{
        height: '8px', 
        background: 'rgba(255,255,255,0.1)', 
        borderRadius: '4px', 
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <div style={{
          width: `${Math.round(value*100)}%`, 
          height: '100%', 
          background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
          borderRadius: '4px',
          boxShadow: '0 0 8px rgba(79, 172, 254, 0.5)',
          transition: 'width 0.3s ease'
        }} />
      </div>
    </div>
  );
}


