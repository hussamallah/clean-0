'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DetailedResults from '@/components/assessment/DetailedResults';

function ResultsContent() {
  const search = useSearchParams();
  const rid = search?.get('rid') || '';
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!rid) return;
        const res = await fetch(`/api/who/${rid}`, { cache: 'no-store' });
        if (res.ok) {
          const payload = await res.json();
          setData(Array.isArray(payload?.results) ? payload.results : []);
          return;
        }
        const raw = localStorage.getItem('gz_full_results');
        if (raw) setData(JSON.parse(raw));
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    })();
  }, [rid]);

  if (!rid) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">
        Missing run ID
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-ink p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-ink-muted mb-2">System overview // Operational parameters</p>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink">Deep Facet Scores</h1>
        </div>
        <DetailedResults data={data} suiteHash={null} verifyStatus="idle" onVerify={() => {}} />
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Loading…</div>}>
      <ResultsContent />
    </Suspense>
  );
}
