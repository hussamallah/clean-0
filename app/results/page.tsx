"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FullResults, { ResultsPanel } from "@/components/assessment/FullResults";
import { sha256 } from "@/lib/crypto/sha256";
import { stableStringify } from "@/lib/bigfive/format";
import { DOMAINS } from "@/lib/bigfive/constants";
import { AxisModeScreen } from "@/components/assessment/AxisModeScreen";
import { IdentityModeCard } from "@/components/results/IdentityModeCard";

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
  useEffect(()=> setMounted(true), []);

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
              <h2>Results — {DOMAINS[(single as any)?.domain as keyof typeof DOMAINS]?.label || 'Domain'}</h2>
              
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
        <div className="card">
          <FullResults data={data} suiteHash={null} verifyStatus={'idle'} onVerify={()=>{}} />
          <div style={{display:'flex', justifyContent:'center', marginTop:16}}>
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
          </div>
        </div>
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


