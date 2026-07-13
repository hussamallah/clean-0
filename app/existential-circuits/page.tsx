'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ExistentialCircuits from '@/components/who/ExistentialCircuits';
import AllLifeSignals from '@/components/who/AllLifeSignals';
import Tooltip from '@/components/Tooltip';

function CircuitsContent(){
  const search = useSearchParams();
  const rid = search?.get('rid') || '';
  const [domainMeans, setDomainMeans] = useState<any>(null);
  const [fullResults, setFullResults] = useState<any>(null);
  const [accentColor] = useState('#C48A2A');

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

  if (!rid) return <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Missing rid</div>;
  if (!domainMeans && !fullResults) return <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Loading…</div>;

  return (
    <main className="min-h-screen bg-canvas text-ink p-4 md:p-8">
      <div className="gz-theme container" style={{
        ['--bg-color' as any]: '#F7F5F2',
        ['--surface-color' as any]: '#FFFFFF',
        ['--primary-text-color' as any]: '#1A1C1E',
        ['--secondary-text-color' as any]: '#5C6570',
        ['--accent-color' as any]: accentColor || '#C48A2A',
        ['--border-color' as any]: '#E2E6EB',
        ['--progress-green' as any]: '#22c55e',
        ['--progress-yellow' as any]: '#C48A2A',
        ['--progress-red' as any]: '#ef4444',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0'
        }}>
         <div className="text-center">
           <h1 className="font-display text-2xl font-semibold mb-4 text-brand-deep">
             <Tooltip text="These are the core processes you use to interact with the world, such as how you manage energy, seek clarity, or build structure.">
               Existential Circuits
             </Tooltip>
           </h1>
         </div>
          <ExistentialCircuits domainMeans={domainMeans} fullResults={fullResults} />
          <AllLifeSignals domainMeans={domainMeans} />
        </div>
      </div>
    </main>
  );
}

export default function ExistentialCircuitsPage(){
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Loading…</div>}>
      <CircuitsContent />
    </Suspense>
  );
}

