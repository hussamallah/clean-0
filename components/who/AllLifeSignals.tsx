"use client";
import { computeSignals, type DomainMeans } from "@/lib/bigfive/signals";
import variants from "@/lib/data/narrative_variants.json";

interface AllLifeSignalsProps {
  domainMeans: DomainMeans;
  tone?: 'neutral'|'alpha'|'warm'|'calm'|'technical';
  hideKeys?: ReadonlyArray<string>;
}

type Level = 'Very High'|'High'|'Medium'|'Low'|'Very Low';

function levelOf(v: number): Level {
  if (v >= 0.70) return 'Very High';  // 70% and above
  if (v >= 0.50) return 'High';       // 50% to 69%
  if (v >= 0.40) return 'Medium';     // 40% to 49%
  if (v >= 0.20) return 'Low';        // 20% to 39%
  return 'Very Low';                  // Below 20%
}

// All 16 signals with their descriptions
const signalDescriptions: Record<string, { name: string; description: string; levels: Record<Level, string> }> = {
  T: {
    name: 'Threat',
    description: 'Pain avoidance and risk scanning',
    levels: {
      'Very High': 'Pain avoidance dominates your thinking; you constantly scan for threats and avoid risks at all costs.',
      'High': 'Pain avoidance runs hot; you scan for risks first.',
      'Medium': 'You notice risk and plan around it when needed.',
      'Low': 'Threat awareness is minimal; you move forward with confidence and rarely second-guess yourself.',
      'Very Low': 'Threat signal is almost non-existent; you are remarkably fearless and may sometimes ignore obvious risks.'
    }
  },
  P: {
    name: 'Pursuit',
    description: 'Exploration and proactive movement',
    levels: {
      'Very High': 'Exploration drive is overwhelming; you constantly seek new challenges and can\'t sit still.',
      'High': 'Strong exploration/build drive; you move proactively.',
      'Medium': 'Moderate; you move when the case is clear.',
      'Low': 'Exploration is cautious; you prefer to wait for clear signals before moving forward.',
      'Very Low': 'Pursuit drive is almost absent; you are extremely conservative and avoid any situation that feels uncertain.'
    }
  },
  S: {
    name: 'Social Buffer',
    description: 'Bonding and emotional regulation capacity',
    levels: {
      'Very High': 'Social buffer is exceptional; you naturally become the emotional anchor for everyone around you.',
      'High': 'You bond and soothe easily; steadying in teams.',
      'Medium': 'Capacity to bond and soothe is moderate.',
      'Low': 'Social buffer is limited; you handle emotions independently and prefer to work through problems alone.',
      'Very Low': 'Social buffer is almost non-existent; you are extremely self-reliant and may struggle to connect with others emotionally.'
    }
  },
  B: {
    name: 'Bond',
    description: 'Connection strength and emotional stability',
    levels: {
      'Very High': 'Bonding capacity is extraordinary; you form intense, life-changing emotional connections.',
      'High': 'Strong emotional bonds; you create deep connections.',
      'Medium': 'Moderate bonding; you connect when it matters.',
      'Low': 'Emotional bonds are surface-level; you maintain relationships but keep them at a comfortable distance.',
      'Very Low': 'Bonding capacity is almost absent; you are extremely guarded and may struggle to form deep emotional connections.'
    }
  },
  D: {
    name: 'Dominance/Drive',
    description: 'Leadership and control assertion',
    levels: {
      'Very High': 'Dominance is overwhelming; you instinctively take control and lead in every situation.',
      'High': 'You push forward and assert control often.',
      'Medium': 'You can take charge when needed.',
      'Low': 'Dominance is minimal; you prefer to support others and avoid taking charge unless absolutely necessary.',
      'Very Low': 'Dominance is almost non-existent; you are extremely deferential and may struggle to assert yourself even when needed.'
    }
  },
  G: {
    name: 'Grit',
    description: 'Resilience and persistence under pressure',
    levels: {
      'Very High': 'Grit is extraordinary; you not only survive but thrive under crushing pressure and impossible odds.',
      'High': 'High grit; you push through tough situations.',
      'Medium': 'Moderate persistence; you endure when needed.',
      'Low': 'Grit is limited; you prefer to avoid difficult situations and may give up when things get tough.',
      'Very Low': 'Grit is almost non-existent; you are extremely sensitive to stress and actively avoid any challenging situations.'
    }
  },
  R: {
    name: 'Rigor',
    description: 'Systematic approach and precision',
    levels: {
      'Very High': 'Rigor is obsessive; you follow systems with fanatical precision and can\'t function without structure.',
      'High': 'High precision; you follow systems meticulously.',
      'Medium': 'Moderate structure; you organize when important.',
      'Low': 'Rigor is minimal; you prefer flexibility and may struggle with detailed, structured approaches.',
      'Very Low': 'Rigor is almost non-existent; you are extremely spontaneous and may find any structured approach constraining.'
    }
  },
  V: {
    name: 'Vitality',
    description: 'Energy and life force expression',
    levels: {
      'Very High': 'Vitality is overwhelming; you have explosive energy that others find exhausting to keep up with.',
      'High': 'High energy; you bring life to situations.',
      'Medium': 'Moderate vitality; you energize when engaged.',
      'Low': 'Vitality is limited; you prefer to conserve energy and may find high-energy situations draining.',
      'Very Low': 'Vitality is almost non-existent; you are extremely low-energy and may struggle to keep up with others.'
    }
  },
  Y: {
    name: 'Yield',
    description: 'Adaptability and flexibility',
    levels: {
      'Very High': 'Adaptability is extraordinary; you effortlessly morph to fit any situation and actually thrive on chaos.',
      'High': 'Highly adaptable; you bend without breaking.',
      'Medium': 'Moderate flexibility; you adjust when needed.',
      'Low': 'Adaptability is limited; you prefer consistency and may struggle when plans change unexpectedly.',
      'Very Low': 'Adaptability is almost non-existent; you are extremely rigid and may become anxious or upset when routines are disrupted.'
    }
  },
  L: {
    name: 'Leverage',
    description: 'Influence and impact creation',
    levels: {
      'Very High': 'Leverage is extraordinary; you have an almost magical ability to multiply impact with minimal resources.',
      'High': 'High leverage; you create maximum impact.',
      'Medium': 'Moderate influence; you affect what matters.',
      'Low': 'Leverage is minimal; you prefer direct action and may struggle with indirect or strategic approaches.',
      'Very Low': 'Leverage is almost non-existent; you are extremely direct and may miss opportunities for strategic influence.'
    }
  },
  F: {
    name: 'Fusion',
    description: 'Integration and harmony creation',
    levels: {
      'Very High': 'Fusion is extraordinary; you have an almost magical ability to bring any group together in perfect harmony.',
      'High': 'High fusion; you bring people together.',
      'Medium': 'Moderate integration; you connect when needed.',
      'Low': 'Fusion is limited; you prefer independence and may struggle to bring groups together.',
      'Very Low': 'Fusion is almost non-existent; you are extremely independent and may actively avoid group situations.'
    }
  },
  U: {
    name: 'Unity',
    description: 'Coherence and consistency',
    levels: {
      'Very High': 'Unity is obsessive; you maintain fanatical consistency and can\'t function without clear principles.',
      'High': 'High unity; you maintain consistent principles.',
      'Medium': 'Moderate coherence; you align when important.',
      'Low': 'Unity is limited; you prefer variety and may struggle to maintain consistent approaches.',
      'Very Low': 'Unity is almost non-existent; you are extremely varied and may find any consistent pattern constraining.'
    }
  },
  M: {
    name: 'Momentum',
    description: 'Forward progress and sustained action',
    levels: {
      'Very High': 'Momentum is unstoppable; you build such strong forward progress that nothing can slow you down.',
      'High': 'High momentum; you maintain steady progress.',
      'Medium': 'Moderate drive; you advance when focused.',
      'Low': 'Momentum is limited; you prefer measured steps and may struggle to maintain forward progress.',
      'Very Low': 'Momentum is almost non-existent; you are extremely cautious and may get stuck in analysis paralysis.'
    }
  },
  I: {
    name: 'Integration',
    description: 'Synthesis and holistic thinking',
    levels: {
      'Very High': 'Integration is extraordinary; you have an almost mystical ability to see hidden connections and patterns everywhere.',
      'High': 'High integration; you see the big picture.',
      'Medium': 'Moderate synthesis; you connect dots when needed.',
      'Low': 'Integration is limited; you prefer focused details and may struggle to see the big picture.',
      'Very Low': 'Integration is almost non-existent; you are extremely detail-focused and may miss important connections.'
    }
  },
  K: {
    name: 'Kinetic',
    description: 'Dynamic energy and movement',
    levels: {
      'Very High': 'Kinetic energy is overwhelming; you are constantly in motion and can\'t sit still for long.',
      'High': 'High kinetic; you create dynamic change.',
      'Medium': 'Moderate dynamism; you move when motivated.',
      'Low': 'Kinetic energy is limited; you prefer stable approaches and may find constant change overwhelming.',
      'Very Low': 'Kinetic energy is almost non-existent; you are extremely stable and may find any change disruptive.'
    }
  },
  Q: {
    name: 'Quality',
    description: 'Excellence and refinement standards',
    levels: {
      'Very High': 'Quality standards are obsessive; you can\'t accept anything less than perfection and notice every flaw.',
      'High': 'High quality; you demand excellence.',
      'Medium': 'Moderate standards; you refine when important.',
      'Low': 'Quality focus is limited; you prefer speed over perfection and may rush through tasks.',
      'Very Low': 'Quality focus is almost non-existent; you are extremely speed-focused and may produce work that lacks attention to detail.'
    }
  }
};

export default function AllLifeSignals({ domainMeans, tone = 'neutral', hideKeys = [] }: AllLifeSignalsProps) {
  const signals = computeSignals(domainMeans);
  
  const signalKeys = ['T', 'P', 'S', 'B', 'D', 'G', 'R', 'V', 'Y', 'L', 'F', 'U', 'M', 'I', 'K', 'Q'] as const;
  const visibleKeys = signalKeys.filter(k => !hideKeys.includes(k));
  
  return (
    <section style={{
      background: 'var(--surface-color)',
      border: '1px solid var(--border-color)',
      borderRadius: 12,
      padding: 24,
      margin: '20px 0'
    }}>
      <h2 style={{ marginTop: 0, color: 'var(--accent-color)', textAlign: 'left' }}>All Life Signals</h2>
      <p style={{ fontSize: 14, color: 'var(--secondary-text-color)', margin: '8px 0 20px 0' }}>
        Complete personality signal analysis.
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: 12 
      }}>
        {visibleKeys.map(signalKey => {
          const value = signals[signalKey];
          const level = levelOf(value);
          const percentage = Math.round(value * 100);
          const signalInfo = signalDescriptions[signalKey];
          // Variant copy lookup with fallback chain
          const base: any = (variants as any).life_signals_snapshot;
          const node = base?.[signalKey] && base?.[signalKey].tones && Object.keys(base[signalKey].tones).length
            ? base[signalKey]
            : base?._default;
          const t = (node?.tones?.[tone]?.levels?.[level])
            || (node?.tones?.['neutral']?.levels?.[level])
            || '';
          
          return (
            <div key={signalKey} style={{
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              borderRadius: 8,
              padding: 12
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong style={{ fontSize: 13, color: 'var(--primary-text-color)' }}>{signalInfo.name}</strong>
                <span style={{ fontSize: 12, color: 'var(--accent-color)' }}>{percentage}%</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--secondary-text-color)', lineHeight: 1.5 }}>
                {t || signalInfo.levels[level]}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
