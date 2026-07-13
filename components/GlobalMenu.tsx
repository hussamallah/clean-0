'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { isAnswerCode } from '@/lib/answerCode';
import { Button } from '@/components/ui/BrandChrome';

export default function GlobalMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [resultCode, setResultCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  const handleRetrieve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultCode.trim()) return;

    let code = resultCode.trim();

    try {
      const url = new URL(code);
      const rid = url.searchParams.get('rid');
      if (rid) code = rid;
    } catch {
      // Not a URL
    }

    setLoading(true);
    setError('');

    try {
      if (isAnswerCode(code)) {
        const resolveRes = await fetch('/api/answer-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const resolveData = await resolveRes.json();
        if (resolveRes.ok && resolveData?.rid) {
          window.location.href = `/portal?rid=${encodeURIComponent(resolveData.rid)}`;
          return;
        }
      }

      const response = await fetch(`/api/who/${encodeURIComponent(code)}`);

      if (response.ok) {
        window.location.href = `/portal?rid=${encodeURIComponent(code)}`;
      } else {
        const data = await response.json();
        setError(data.message || 'Result not found. Please check your code and try again.');
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const showMenu = ['/', '/assessment', '/free-results', '/privacy'].includes(pathname || '');

  if (!showMenu) return null;

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="font-display text-lg font-semibold tracking-tight text-ink">
            Point Zero
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link
              href="/free-results"
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
            >
              Sample
            </Link>
            <button
              type="button"
              onClick={() => setShowRetrieve(true)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
            >
              Retrieve results
            </button>
            <Button href="/assessment" variant="primary" className="!px-4 !py-2 text-sm">
              Start assessment
            </Button>
          </nav>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink sm:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-ink/20 backdrop-blur-sm sm:hidden"
            onClick={() => setMenuOpen(false)}
            aria-hidden
          />
          <div
            className="fixed top-[57px] left-0 right-0 z-50 border-b border-line bg-surface p-4 shadow-lift sm:hidden"
            role="dialog"
            aria-label="Site menu"
          >
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="rounded-xl px-4 py-3 text-ink hover:bg-surface-muted"
                onClick={() => setMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/free-results"
                className="rounded-xl px-4 py-3 text-ink hover:bg-surface-muted"
                onClick={() => setMenuOpen(false)}
              >
                Sample result
              </Link>
              <button
                type="button"
                className="rounded-xl px-4 py-3 text-left text-ink hover:bg-surface-muted"
                onClick={() => {
                  setShowRetrieve(true);
                  setMenuOpen(false);
                }}
              >
                Retrieve results
              </button>
              <Link
                href="/assessment"
                className="mt-2 rounded-xl bg-brand px-4 py-3 text-center font-semibold text-white"
                onClick={() => setMenuOpen(false)}
              >
                Start assessment
              </Link>
            </nav>
          </div>
        </>
      )}

      {showRetrieve && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/30 p-4 backdrop-blur-sm"
          role="presentation"
          onClick={() => setShowRetrieve(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="retrieve-title"
            className="w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-lift"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="retrieve-title" className="font-display text-xl font-semibold text-ink">
              Retrieve your results
            </h2>
            <p className="mt-2 text-sm text-ink-muted">
              Enter your Run ID, Answer Code, or results URL.
            </p>
            <form onSubmit={handleRetrieve} className="mt-4 space-y-3">
              <input
                type="text"
                value={resultCode}
                onChange={(e) => setResultCode(e.target.value)}
                placeholder="Run ID or Answer Code"
                className="w-full rounded-xl border border-line bg-canvas px-4 py-3 text-ink placeholder:text-ink-soft focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                autoFocus
              />
              {error ? <p className="text-sm text-ocean-N">{error}</p> : null}
              <div className="flex gap-2">
                <Button type="submit" variant="primary" disabled={loading} className="flex-1">
                  {loading ? 'Looking up…' : 'Open results'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setShowRetrieve(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
