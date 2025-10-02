"use client";
import { useState, useEffect } from "react";
import { selectFiveCards, type FacetData } from "@/lib/bigfive/fiveCardSelector";
import { DOMAINS, FACET_DESCRIPTIONS, FACET_INTERPRETATIONS, canonicalFacets } from "@/lib/bigfive/constants";
import { getFacetScoreLevel } from "@/lib/bigfive/format";

type DomainKey = keyof typeof DOMAINS;

interface Props {
  data: Array<{domain: DomainKey; payload: any}>;
  onCardOpen?: (cardType: string) => void;
  onOfferSeen?: (offerType: 'override' | 'compat' | 'yvt') => void;
}

export default function FiveCardResults({ data, onCardOpen, onOfferSeen }: Props) {
  const [viewedCards, setViewedCards] = useState<Set<string>>(new Set());
  const [ctaEnabled, setCTAEnabled] = useState(false);
  
  // Convert data to FacetData format for selector
  const facetData: FacetData[] = [];
  for (const result of data) {
    const domain = result.domain;
    const payload = result.payload;
    const facets = canonicalFacets(domain);
    
    for (const facet of facets) {
      const raw = payload?.phase2?.A_raw?.[facet] || 3;
      const bucket = payload?.final?.bucket?.[facet] || 'Medium';
      facetData.push({ domain, facet, raw, bucket });
    }
  }
  
  // Get the deterministic 5 cards
  const selectedCards = selectFiveCards(facetData);
  
  // CTA micro-delay per spec (M)
  useEffect(() => {
    const timer = setTimeout(() => setCTAEnabled(true), 700);
    return () => clearTimeout(timer);
  }, []);
  
  const handleCardClick = (cardIndex: number, cardType: string) => {
    const cardKey = `${cardType}-${cardIndex}`;
    setViewedCards(prev => new Set([...prev, cardKey]));
    onCardOpen?.(cardType);
  };
  
  // Check offer conditions
  const lowMediumCount = selectedCards.filter(c => c.bucket === 'Low' || c.bucket === 'Medium').length;
  const hasSocialTrait = selectedCards.some(c => c.type === 'social');
  
  return (
    <div style={{
      background: '#222',
      padding: '20px',
      borderRadius: '10px',
      margin: '20px 0'
    }}>
      <h2 style={{ marginTop: 0, textAlign: 'center' }}>Conflict Patterns</h2>
      <div style={{ 
        textAlign: 'center', 
        margin: '8px 0 20px 0',
        padding: '8px', 
        background: '#2c1810', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#f39c12'
      }}>
        This tension creates interesting dynamics in your behavior patterns.
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        {selectedCards.filter(card => card.type === 'conflict').map((card, i) => {
          const stars = card.raw ? Math.round(card.raw) : (card.bucket === 'High' ? 5 : card.bucket === 'Medium' ? 3 : 2);
          const full = Array.from({length: Math.max(0, Math.min(5, stars))});
          const empty = Array.from({length: Math.max(0, 5 - stars)});
          const cls = card.bucket?.toLowerCase() || 'medium';
          const [isOpen, setIsOpen] = useState(card.type === 'conflict'); // Auto-expand only conflict cards, no collapse for them
          
          // Find the domain and payload for this facet to get interpretation
          let interpretation = card.description;
          if (card.domain && card.facet && card.type !== 'conflict') {
            const domainResult = data.find(d => d.domain === card.domain);
            if (domainResult) {
              const facetScoreLevel = getFacetScoreLevel(card.raw || 3);
              const interp = (FACET_INTERPRETATIONS as any)[card.domain]?.[card.facet]?.[facetScoreLevel];
              if (interp) interpretation = interp;
            }
          }
          
          // Get facet description
          const desc = card.domain && card.facet ? (FACET_DESCRIPTIONS as any)[card.domain]?.[card.facet] : null;
          
          return (
            <div
              key={i}
              className="card"
              style={{
                background: '#1a212a',
                border: card.type === 'conflict' ? '1px solid #f39c12' : '1px solid #2a3240',
                borderRadius: '12px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => {
                if (card.type !== 'conflict') {
                  setIsOpen(!isOpen);
                }
                handleCardClick(i, card.type);
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#2a3240';
                e.currentTarget.style.borderColor = card.type === 'conflict' ? '#f39c12' : '#3a424a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1a212a';
                e.currentTarget.style.borderColor = card.type === 'conflict' ? '#f39c12' : '#2a3240';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#d6e5ff' }}>{card.facet}</strong>
                  {card.type !== 'conflict' && <span className="muted" style={{marginLeft:6}}>{isOpen ? '▾' : '▸'}</span>}
                </div>
                {card.bucket && <div className={`badge ${cls}`}>{card.bucket}</div>}
              </div>
              
              {card.type !== 'conflict' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  {full.map((_, idx) => (
                    <span key={`fs-${idx}`} style={{ color: '#f1c40f', fontSize: '16px' }}>★</span>
                  ))}
                  {empty.map((_, idx) => (
                    <span key={`es-${idx}`} style={{ color: '#2a2f38', fontSize: '16px' }}>☆</span>
                  ))}
                </div>
              )}
              
              {desc ? (
                <div style={{marginTop:8,fontSize:12,color:'#b6c2d1',lineHeight:1.4}}>
                  <strong>What this measures:</strong> {desc}
                </div>
              ) : null}
              
              {!isOpen && card.type !== 'conflict' ? (
                <div style={{
                  marginTop: 12,
                  fontSize: 15,
                  color: '#f1c40f',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  fontWeight: '500'
                }}>
                  Press to reveal
                </div>
              ) : null}
              
              {isOpen && (
                <p style={{ 
                  margin: isOpen ? '6px 0 0 0' : 0, 
                  fontSize: '13px', 
                  lineHeight: 1.4, 
                  color: '#d6e5ff',
                  fontStyle: card.type === 'conflict' ? 'italic' : 'normal'
                }}>
                  {card.type === 'conflict' && <strong>How can both be true? </strong>}
                  {interpretation}
                </p>
              )}
              
            </div>
          );
        })}
        
        {/* Sales Cards */}
        <div className="card" style={{
          background: '#1a212a',
          border: '1px solid #2a3240',
          borderRadius: '12px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#d6e5ff' }}>Override Premium</strong>
            <div className="badge" style={{ background: '#f1c40f', color: '#000' }}>$7</div>
          </div>
          <p style={{ margin: '8px 0', fontSize: '13px', lineHeight: 1.4, color: '#d6e5ff' }}>
            Turn weak spots into levers
          </p>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#b6c2d1' }}>
            <strong>What this measures:</strong> Behavioral change and habit formation
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#b6c2d1', fontStyle: 'italic' }}>
            "First card paid for itself on day 2." – Sara, PM
          </div>
        </div>

        <div className="card" style={{
          background: '#1a212a',
          border: '1px solid #2a3240',
          borderRadius: '12px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#d6e5ff' }}>Compatibility</strong>
            <div className="badge" style={{ background: '#f1c40f', color: '#000' }}>$1.50</div>
          </div>
          <p style={{ margin: '8px 0', fontSize: '13px', lineHeight: 1.4, color: '#d6e5ff' }}>
            3 cards for $1.50 · See real alignment & friction
          </p>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#b6c2d1' }}>
            <strong>What this measures:</strong> Relationship dynamics and behavioral compatibility
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#b6c2d1', fontStyle: 'italic' }}>
            "Made sense of our differences instantly." – Omar & Lina
          </div>
        </div>

        <div className="card" style={{
          background: '#1a212a',
          border: '1px solid #2a3240',
          borderRadius: '12px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#d6e5ff' }}>You vs Them</strong>
            <div className="badge" style={{ background: '#f1c40f', color: '#000' }}>$1.50</div>
          </div>
          <p style={{ margin: '8px 0', fontSize: '13px', lineHeight: 1.4, color: '#d6e5ff' }}>
            3 cards for $1.50 · Fast side-by-side OCEAN view
          </p>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#b6c2d1' }}>
            <strong>What this measures:</strong> Personality differences and similarities
          </div>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#b6c2d1', fontStyle: 'italic' }}>
            "Clear picture in 30 seconds." – Alex, Designer
          </div>
        </div>
      </div>

    </div>
  );
}
