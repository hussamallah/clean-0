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
            setSuiteHash(ridParam);
            setMode('full');
            return;
          }
        }
        // Fallback to localStorage (legacy)
        const raw = localStorage.getItem('gz_full_results');
        const hash = localStorage.getItem('gz_full_hash');
        if (raw){ setData(JSON.parse(raw)); }
        if (hash){ setSuiteHash(hash); }
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
              <p className="muted">Review and verify the hash for this domain run.</p>
            </div>
          </div>
          <ResultsPanel payload={single} />
          <div className="divider"></div>
          <div className="row-nowrap" style={{justifyContent:'space-between',alignItems:'center'}}>
            <small className="muted">Session hash (SHA-256): <span className="kbd">{(single as any)?.audit?.nonce || '...'}</span></small>
            <div className="row-nowrap" style={{gap:8, alignItems:'center'}}>
              <button className="btn" onClick={async ()=>{
                try{
                  const s:any = single;
                  if (!s) return;
                  const auditPayload = {
                    version: s.version,
                    domain: s.domain,
                    phase1: s.phase1,
                    phase2: s.phase2,
                    phase3: s.phase3,
                    final: s.final
                  };
                  const hash = await sha256(stableStringify(auditPayload));
                  setVerifyStatus(hash === s?.audit?.nonce ? 'ok' : 'fail');
                } catch {}
              }}>Verify hash</button>
              {verifyStatus==='ok' ? <span className="badge high">Verified</span> : null}
              {verifyStatus==='fail' ? <span className="badge low">Mismatch</span> : null}
              <small className="muted">Tie-breaks use canonical facet order.</small>
            </div>
          </div>
          <div className="divider"></div>
          <div className="row-nowrap" style={{justifyContent:'flex-end'}}>
            <button className="btn" onClick={()=> router.push('/who' + (rid?`?rid=${rid}`:''))}>← Back to Personality Insights</button>
          </div>
        </div>
      ) : (
        <div className="card">
          <FullResults data={data} suiteHash={suiteHash} verifyStatus={verifyStatus} onVerify={async ()=>{
            const normalized = data.map((r:any)=>({domain:r.domain, payload:r.payload}));
            const hash = await sha256(stableStringify(normalized));
            setVerifyStatus(hash === suiteHash ? 'ok' : 'fail');
          }} />
          <div className="divider"></div>
          <div className="row-nowrap" style={{justifyContent:'flex-end'}}>
            <button className="btn" onClick={()=> router.push('/who' + (rid?`?rid=${rid}`:''))}>← Back to Personality Insights</button>
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


