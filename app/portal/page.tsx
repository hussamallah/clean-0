'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import FullResultsHub from '@/components/results/FullResultsHub';
import { getLastRid } from '@/lib/persistence';
import { useEffect, useState } from 'react';
import Link from 'next/link';

function PortalContent() {
  const search = useSearchParams();
  const ridFromUrl = search.get('rid');
  const [rid, setRid] = useState<string | null>(ridFromUrl);

  useEffect(() => {
    if (ridFromUrl) {
      setRid(ridFromUrl);
      return;
    }
    const saved = getLastRid();
    if (saved) setRid(saved);
  }, [ridFromUrl]);

  if (!rid) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center px-6 text-center gap-4">
        <p className="text-ink-muted">No saved results yet.</p>
        <Link href="/assessment" className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-deep transition-colors">
          Take the assessment
        </Link>
      </div>
    );
  }

  return <FullResultsHub rid={rid} />;
}

export default function PortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Loading…</div>}>
      <PortalContent />
    </Suspense>
  );
}
