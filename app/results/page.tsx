"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FullResults, { ResultsPanel } from "@/components/assessment/FullResults";
import ResultsNav from "@/components/ResultsNav";
import CTAButton from "@/components/CTAButton";
import { sha256 } from "@/lib/crypto/sha256";
import { stableStringify } from "@/lib/bigfive/format";
import { DOMAINS, DomainKey } from "@/lib/bigfive/constants";
import { AxisModeScreen } from "@/components/assessment/AxisModeScreen";
import { IdentityModeCard } from "@/components/results/IdentityModeCard";
import PaidContentPreviewModal from "@/components/PaidContentPreviewModal";

function ResultsContent(){
  const router = useRouter();
  const search = useSearchParams();
  const rid = search?.get('rid') || '';
  const [data, setData] = useState<any[]>([]);
  const [suiteHash, setSuiteHash] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'idle'|'ok'|'fail'>('idle');
  const [single, setSingle] = useState<any|null>(null);
  const [mode, setMode] = useState<'full'|'single'>('full');
  const [mounted, setMounted] = useState(false);
  // Identity mode disabled (gz3switch removed)
  const [identityResult, setIdentityResult] = useState<any|null>(null);
  const [previewModal, setPreviewModal] = useState<any | null>(null);
  useEffect(()=> setMounted(true), []);

  const CircuitsPreview = ({ results }: { results: any[] }) => {
    if (!results || results.length === 0) {
      return <p className="text-white/70">Your circuit data will be shown here.</p>;
    }

    const getDomainMean = (domain: DomainKey) => {
      const domainData = results.find(r => r.domain === domain);
      return domainData?.payload?.final?.domain_mean_raw || 3.0;
    };

    const C = getDomainMean('C');
    const E = getDomainMean('E');

    // Simplified calculation for the Authority circuit
    const authorityValue = ((C - 3) / 2 + (E - 3) / 2) / 2;
    const percentage = Math.round(((authorityValue + 1) / 2) * 100);
    const color = authorityValue >= 0 ? '#2ecc71' : '#e74c3c';

    return (
      <div>
        <h4 className="font-bold text-lg text-purple-300">Your Authority Circuit</h4>
        <p className="mt-2 text-white/90 text-sm">
          This circuit governs your ability to establish order and influence outcomes. It's built from your Conscientiousness (structure) and Extraversion (action).
        </p>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <strong className="text-sm">Authority Score</strong>
            <span className="text-sm font-bold" style={{ color }}>{percentage}%</span>
          </div>
          <div className="bg-white/10 rounded-full h-3">
            <div className="h-3 rounded-full" style={{ width: `${percentage}%`, backgroundColor: color, transition: 'width 0.5s ease-in-out' }} />
          </div>
          <p className="text-xs text-white/70 mt-2">
            This is a preview of one of the five circuits you'll unlock. The full report provides a detailed breakdown and actionable "moves" for each.
          </p>
        </div>
      </div>
    );
  };

  useEffect(()=>{
    if (!mounted) return;
    (async () => {
      try {
        const url = new URL(window.location.href);
        const dh = url.searchParams.get('dh');
        if (dh){
          // Single-domain mode (legacy local-only view)
          const mapRaw = localStorage.getItem('gz_domain_results');
          if (mapRaw){
            const db = JSON.parse(mapRaw);
            if (db[dh]){
              setSingle(db[dh]);
              setMode('single');
              return;
            }
          }
        }
        // Full-run mode: prefer server by rid
        const ridParam = url.searchParams.get('rid') || rid;
        if (ridParam){
          const res = await fetch(`/api/who/${ridParam}`, { cache:'no-store' });
          if (res.ok){
            const payload = await res.json();
            const results = Array.isArray(payload?.results) ? payload.results : [];
            setData(results);
            setSuiteHash(null);
            setMode('full');
            return;
          }
        }
        // Fallback to localStorage (legacy)
        const raw = localStorage.getItem('gz_full_results');
        const hash = localStorage.getItem('gz_full_hash');
        if (raw){ setData(JSON.parse(raw)); }
        setSuiteHash(null);
        setMode('full');
      } catch {}
    })();
  }, [mounted, rid]);

  if (!mounted) return null;

  return (
    <main className="app">
      {/* Identity mode temporarily disabled since gz3switch was removed */}
      {mode==='single' && single ? (
        <div className="card">
          <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h2>Full Results — {DOMAINS[(single as any)?.domain as keyof typeof DOMAINS]?.label || 'Domain'}</h2>
              
            </div>
          </div>
          <ResultsPanel payload={single} />
          <div style={{display:'flex', justifyContent:'center', marginTop:16, gap:12, flexWrap:'wrap'}}>
            <button
              className="btn btn-gold"
              style={{
                border: '2px solid #d4af37',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.5), 0 4px 16px rgba(0,0,0,0.3)',
                padding: '12px 22px',
                borderRadius: 10,
                color: 'white',
                fontSize: 16,
                fontWeight: 600
              }}
              onClick={()=> router.push(`/your-id?rid=${rid}`)}
            >View Your ID →</button>
            <button
              className="btn btn-gold"
              style={{
                border: '2px solid #d4af37',
                boxShadow: '0 0 12px rgba(212, 175, 55, 0.5), 0 4px 16px rgba(0,0,0,0.3)',
                padding: '12px 22px',
                borderRadius: 10,
                color: 'white',
                fontSize: 16,
                fontWeight: 600
              }}
              onClick={()=> router.push(`/arctyps-duals${rid?`?rid=${rid}`:''}`)}
            >Arctyps Duals →</button>
          </div>
        </div>
      ) : (
        <div>
          <h1 style={{ textAlign:'center', margin:'0 0 12px', fontSize:24, fontWeight:800, letterSpacing:.5 }}>Full Results</h1>
          <div className="card">
            <div className="my-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30 text-center">
              <h3 className="text-lg font-bold text-purple-200">Ready for the Deepest Level of Analysis?</h3>
              <p className="mt-1 text-sm text-purple-200/90 max-w-2xl mx-auto">
                You've seen your traits. Now, understand the underlying mental circuits that drive your core motivations and fears. This is the foundational system behind your personality.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => setPreviewModal({
                    title: 'Existential Circuits',
                    description: 'Go beyond traits to see the foundational mental systems that drive your core motivations and fears. Below is a preview of your Authority Circuit.',
                    previewContent: <CircuitsPreview results={data} />,
                    price: 1.49,
                    purchaseUrl: `/existential-circuits${rid ? `?rid=${rid}` : ''}`
                  })}
                  className="inline-block bg-purple-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-purple-400"
                >
                  Preview Existential Circuits
                </button>
              </div>
            </div>
            <FullResults data={data} suiteHash={null} verifyStatus={'idle'} onVerify={()=>{}} />
            <ResultsNav currentPage="/results" />
          </div>
        </div>
      )}
      {previewModal && (
        <PaidContentPreviewModal
          {...previewModal}
          onClose={() => setPreviewModal(null)}
        />
      )}
    </main>
  );
}

export default function ResultsPage(){
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsContent />
    </Suspense>
  );
}


