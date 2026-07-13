import Link from 'next/link';
import { Suspense } from 'react';

function NotFoundContent() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-lg font-semibold text-brand-deep mb-2">Point Zero</p>
      <h1 className="font-display text-6xl font-semibold text-ink mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-ink-muted mb-8 max-w-md">
        The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link href="/" className="px-6 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-deep transition-colors duration-300">
        Go Back Home
      </Link>
    </div>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-canvas text-ink flex items-center justify-center">Loading…</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
