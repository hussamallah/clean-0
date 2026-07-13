'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function RedirectContent() {
  const router = useRouter();
  const search = useSearchParams();
  const rid = search.get('rid');

  useEffect(() => {
    if (rid) router.replace(`/portal?rid=${encodeURIComponent(rid)}`);
    else router.replace('/portal');
  }, [rid, router]);

  return null;
}

/** Legacy route — forwards to the Full Results Hub (portal). */
export default function YourIdRedirectPage() {
  return (
    <Suspense fallback={null}>
      <RedirectContent />
    </Suspense>
  );
}
