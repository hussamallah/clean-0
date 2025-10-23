'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ExistentialCircuits from '@/components/who/ExistentialCircuits';
import AllLifeSignals from '@/components/who/AllLifeSignals';
import ResultsNav from '@/components/ResultsNav';

function CircuitsContent(){
  const search = useSearchParams();
  const rid = search.get('rid');
  const [domainMeans, setDomainMeans] = useState<any>(null);
  const [fullResults, setFullResults] = useState<any>(null);
  const [accentColor] = useState('#d4af37');

  useEffect(()=>{
    (async ()=>{
      try{
        if (!rid) return;
        const res = await fetch(`/api/who/${rid}`, { cache: 'no-store' });
        const data = await res.json();
        setDomainMeans(data?.who?.derived?.domainMeans || null);
        setFullResults(Array.isArray(data?.results) ? data.results : null);
      } catch {}
    })();
  },[rid]);

  if (!rid) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Missing rid</div>;
  if (!domainMeans && !fullResults) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>;

  return (
    <main className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="gz-theme container" style={{
        ['--bg-color' as any]: '#121212',
        ['--surface-color' as any]: '#1e1e1e',
        ['--primary-text-color' as any]: '#e0e0e0',
        ['--secondary-text-color' as any]: '#a0a0a0',
        ['--accent-color' as any]: accentColor || '#4cafef',
        ['--border-color' as any]: '#333',
        ['--progress-green' as any]: '#2ecc71',
        ['--progress-yellow' as any]: '#f1c40f',
        ['--progress-red' as any]: '#e74c3c',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0'
      }}>
        <h1 className="text-2xl font-bold mb-4" style={{ color: '#d4af37' }}>Existential Circuits</h1>
        <ResultsNav currentPage="/existential-circuits" />
        <ExistentialCircuits domainMeans={domainMeans} fullResults={fullResults} />
        <div className="mt-6">
          {domainMeans ? (
            <AllLifeSignals
              domainMeans={domainMeans}
              hideKeys={[
                // Show only T (Threat), P (Pursuit), S (Social Buffer), G (Grit)
                'B','D','R','V','Y','L','F','U','M','I','K','Q'
              ]}
            />
          ) : null}
        </div>
      </div>
    </main>
  );
}

export default function ExistentialCircuitsPage(){
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>}>
      <CircuitsContent />
    </Suspense>
  );
}


