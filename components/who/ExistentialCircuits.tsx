"use client";
import { useEffect, useState } from "react";
import { compute, type Circuits, type Result } from "../../Existential Circuits";

type DomainLetter = 'E'|'N'|'C'|'O'|'A';

interface ExistentialCircuitsProps {
  domainMeans: { E: number; N: number; C: number; O: number; A: number } | undefined;
  fullResults: Array<{ domain: string; payload: any }> | undefined;
}

interface ProfileData {
  id: string;
  buckets: { E: string; N: string; C: string; O: string; A: string };
  findings: {
    E: { meaning: string; risk: string; move: string };
    N: { meaning: string; risk: string; move: string };
    C: { meaning: string; risk: string; move: string };
    O: { meaning: string; risk: string; move: string };
    A: { meaning: string; risk: string; move: string };
  };
}

export default function ExistentialCircuits({ domainMeans, fullResults }: ExistentialCircuitsProps) {
  const [result, setResult] = useState<Result | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function calculateCircuits() {
      try {
        const E = Number.isFinite((domainMeans as any)?.E) ? (domainMeans as any).E : 3;
        const O = Number.isFinite((domainMeans as any)?.O) ? (domainMeans as any).O : 3;
        const C = Number.isFinite((domainMeans as any)?.C) ? (domainMeans as any).C : 3;
        const A = Number.isFinite((domainMeans as any)?.A) ? (domainMeans as any).A : 3;
        const N = Number.isFinite((domainMeans as any)?.N) ? (domainMeans as any).N : 3;

        const circuits: Circuits = {
          vitality: Math.max(-1, Math.min(1, (E - 3) / 2)),
          signal: Math.max(-1, Math.min(1, (O - 3) / 2)),
          time: Math.max(-1, Math.min(1, (C - 3) / 2)),
          attachment: Math.max(-1, Math.min(1, (A - 3) / 2)),
          seeking: Math.max(-1, Math.min(1, (3 - N) / 2))
        };

        const computed = await compute(circuits);
        setResult(computed);

        // Compute domain buckets from fullResults (fallback to domainMeans thresholds)
        const buckets: { E: string; N: string; C: string; O: string; A: string } = { E: 'Medium', N: 'Medium', C: 'Medium', O: 'Medium', A: 'Medium' };
        try {
          const list = Array.isArray(fullResults) ? fullResults : [];
          for (const r of list) {
            const d = (r?.domain || '').toUpperCase() as DomainLetter;
            const mean = r?.payload?.final?.domain_mean_raw;
            if (typeof mean === 'number' && (['E','N','C','O','A'] as DomainLetter[]).includes(d)) {
              buckets[d] = mean >= 4.0 ? 'High' : (mean <= 2.0 ? 'Low' : 'Medium');
            }
          }
          // If any domain missing, infer via domainMeans
          (['E','N','C','O','A'] as const).forEach(d => {
            if (!['High','Medium','Low'].includes(buckets[d] as any)){
              const m = ({E,N,C,O,A} as any)[d];
              buckets[d] = m >= 4.0 ? 'High' : (m <= 2.0 ? 'Low' : 'Medium');
            }
          });

          // Build profile id like E_H|N_M|C_L|O_H|A_L
          const t = (x:string)=> x.startsWith('H')?'H':(x.startsWith('L')?'L':'M');
          const profileId = `E_${t(buckets.E)}|N_${t(buckets.N)}|C_${t(buckets.C)}|O_${t(buckets.O)}|A_${t(buckets.A)}`;

          // Load profiles JSON via dynamic import (bundled)
          const data: any = await import("../../ground_zero_243_profiles.json");
          const payload = (data as any).default ?? data;
          const profiles = payload?.profiles as ProfileData[] | undefined;
          if (Array.isArray(profiles)){
            const hit = profiles.find(p => p.id === profileId) || null;
            setProfileData(hit);
          }
        } catch (e) {
          // Non-fatal: profiles not found
          console.warn('Profile mapping unavailable:', e);
        }
      } catch (error) {
        console.error('Error calculating existential circuits:', error);
      } finally {
        setLoading(false);
      }
    }

    calculateCircuits();
  }, [domainMeans, fullResults]);

  if (loading) {
    return (
      <div style={{
        background: '#1a1a1a',
        padding: '20px',
        borderRadius: '10px',
        margin: '20px 0'
      }}>
        <h2 style={{ marginTop: 0 }}>Existential Circuits</h2>
        <p style={{ color: '#aaa' }}>Calculating your existential profile...</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const circuitLabels = {
    vitality: 'Energy (Circuit)',
    signal: 'Clarity (Circuit)',
    time: 'Structure (Circuit)',
    attachment: 'Bond (Circuit)',
    seeking: 'Drive (Circuit)'
  };

  const circuitDescriptions = {
    vitality: 'Life ↔ Death',
    signal: 'Silence ↔ Signal',
    time: 'Space ↔ Time',
    attachment: 'Despair ↔ Love',
    seeking: 'Pain/Avoid ↔ Pursue'
  };

  // Generate headline from primary domain
  const getPrimaryDomain = () => {
    if (!result) return { domain: 'E', bucket: 'Medium', name: 'Extraversion' };
    const domainNames = { E: 'Extraversion', N: 'Neuroticism', C: 'Conscientiousness', O: 'Openness', A: 'Agreeableness' };
    const scores = result.scores;
    const buckets = result.buckets;
    
    // Find highest scoring domain
    let maxScore = -Infinity;
    let primaryDomain: DomainLetter = 'E';
    (['E','N','C','O','A'] as const).forEach(d => {
      if (typeof scores[d] === 'number' && scores[d] > maxScore) {
        maxScore = scores[d];
        primaryDomain = d;
      }
    });
    
    return {
      domain: primaryDomain,
      bucket: buckets[primaryDomain],
      name: domainNames[primaryDomain]
    };
  };

  const primary = getPrimaryDomain();
  const headline = profileData ? 
    `${primary.bucket} ${primary.name} — risk: ${profileData.findings[primary.domain as keyof typeof profileData.findings].risk.toLowerCase()}. Move: ${profileData.findings[primary.domain as keyof typeof profileData.findings].move.toLowerCase()}.` :
    `${primary.bucket} ${primary.name} — core pattern identified.`;

  return (
    <div style={{
      background: '#1a1a1a',
      padding: '20px',
      borderRadius: '10px',
      margin: '20px 0'
    }}>
      {/* 1. Combined Circuits with Domain Data */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '14px', color: '#d6e5ff', margin: '0 0 8px 0' }}>Existential Circuits</h3>
          <div style={{ fontSize: '12px', color: '#9aa3ad', lineHeight: '1.4' }}>
            Scores are not morals. Green bar means "more access" red bar means "less use."<br/>
            Use the "Move" to act.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {(['vitality', 'signal', 'time', 'attachment', 'seeking'] as const).map(circuitKey => {
            const value = result.v[circuitKey];
            const label = circuitLabels[circuitKey];
            const description = circuitDescriptions[circuitKey];
            const percentage = Math.round(((value + 1) / 2) * 100); // Convert -1 to 1 range to 0-100%
            const color = value >= 0 ? '#4caf50' : '#f44336';
            
            // Map circuits to domains for finding data
            const domainMap: Record<string, DomainLetter> = {
              vitality: 'E',    // Energy maps to Extraversion
              signal: 'O',      // Clarity maps to Openness  
              time: 'C',        // Structure maps to Conscientiousness
              attachment: 'A',  // Bond maps to Agreeableness
              seeking: 'N'      // Drive maps to Neuroticism
            };
            
            const domain = domainMap[circuitKey];
            const findings = profileData?.findings[domain];
            
            return (
              <div key={circuitKey} style={{
                background: '#222',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '13px', color: '#d6e5ff' }}>{label}</strong>
                  <span style={{ fontSize: '11px', color: '#ccc' }}>{percentage}%</span>
                </div>
                <div style={{ fontSize: '11px', color: '#b6c2d1', marginBottom: '8px' }}>
                  {description}
                </div>
                
                {/* Progress bar */}
                <div style={{
                  background: '#333',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  height: '6px',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    background: color,
                    height: '100%',
                    width: `${percentage}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                
                {/* Domain findings */}
                {findings && (
                  <>
                    <div style={{ fontSize: '11px', color: '#b6c2d1', marginBottom: '6px' }}>
                      <strong>Meaning:</strong> {findings.meaning}
                    </div>
                    <div style={{ fontSize: '11px', color: '#f39c12', marginBottom: '6px' }}>
                      <strong>Risk:</strong> {findings.risk}
                    </div>
                    <div style={{ fontSize: '11px', color: '#4caf50' }}>
                      <strong>Move:</strong> {findings.move}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
