'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CompatibilityReportView from '@/components/results/CompatibilityReportView';
import { resolveProfileInput } from '@/lib/compatibility/resolveInput';

function CompatibilityContent() {
  const search = useSearchParams();
  const ridAFromUrl = search?.get('ridA') || '';
  const ridBFromUrl = search?.get('ridB') || '';
  const currentUserRid = search?.get('rid') || '';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ridA, setRidA] = useState(ridAFromUrl || currentUserRid);
  const [ridB, setRidB] = useState(ridBFromUrl);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!ridAFromUrl && currentUserRid) setRidA(currentUserRid);
  }, [currentUserRid, ridAFromUrl]);

  useEffect(() => {
    if (!ridAFromUrl || !ridBFromUrl) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const resolvedA = await resolveProfileInput(ridAFromUrl);
        const resolvedB = await resolveProfileInput(ridBFromUrl);
        if (!resolvedA || !resolvedB) throw new Error('Invalid Run ID or Answer Code');
        const res = await fetch(
          `/api/compatibility?ridA=${encodeURIComponent(resolvedA)}&ridB=${encodeURIComponent(resolvedB)}`,
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error || 'Failed to fetch compatibility data');
        }
        setData(await res.json());
      } catch (e: any) {
        setError(e?.message || 'Failed to load report');
      } finally {
        setLoading(false);
      }
    })();
  }, [ridAFromUrl, ridBFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const resolvedA = await resolveProfileInput(ridA);
      const resolvedB = await resolveProfileInput(ridB);
      if (!resolvedA || !resolvedB) throw new Error('Invalid Run ID or Answer Code for one or both people');
      window.location.href = `/compatibility?ridA=${encodeURIComponent(resolvedA)}&ridB=${encodeURIComponent(resolvedB)}`;
    } catch (e: any) {
      setError(e?.message || 'Compare failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
        Loading Report…
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans px-6 text-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (data) {
    return (
      <CompatibilityReportView
        data={data}
        backHref={ridAFromUrl ? `/portal?rid=${encodeURIComponent(ridAFromUrl)}` : '/portal'}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-md mx-auto pt-12">
        <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-amber-400/80 text-center mb-2">Premium</p>
        <h1 className="text-3xl font-bold mb-2 text-center">Compatibility Report</h1>
        <p className="text-white/60 text-center mb-8 text-sm leading-relaxed">
          Analyze interpersonal dynamics. Discover points of harmony and friction between you and another person.
        </p>
        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4 backdrop-blur-sm">
          <div>
            <label htmlFor="ridA" className="block mb-2 text-xs font-mono uppercase tracking-wider text-white/50">
              Your Run ID or Answer Code
            </label>
            <input
              id="ridA"
              value={ridA}
              onChange={(e) => { setRidA(e.target.value); setError(null); }}
              placeholder="gzac_… or 24-char Run ID"
              className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-sm"
              readOnly={!!ridAFromUrl}
            />
          </div>
          <div>
            <label htmlFor="ridB" className="block mb-2 text-xs font-mono uppercase tracking-wider text-white/50">
              Partner&apos;s Answer Code or Run ID
            </label>
            <input
              id="ridB"
              value={ridB}
              onChange={(e) => { setRidB(e.target.value); setError(null); }}
              placeholder="Paste their Answer Code"
              className="w-full bg-black/40 border border-white/15 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !ridA.trim() || !ridB.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-semibold py-3 disabled:opacity-50"
          >
            {submitting ? 'Comparing…' : 'Compare'}
          </button>
          <p className="text-[11px] text-white/40 text-center">
            Already have an answer code? Paste it above — no account needed.
          </p>
        </form>
      </div>
    </main>
  );
}

export default function CompatibilityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading…</div>}>
      <CompatibilityContent />
    </Suspense>
  );
}
