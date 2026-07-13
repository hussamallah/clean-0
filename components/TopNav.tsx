'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ResultsHeader } from '@/components/results/ResultsShell';

const DEEP_LABELS: { path: string; label: string }[] = [
  { path: '/results/operation-of-life-report', label: 'Operating manual' },
  { path: '/results', label: 'Trait details' },
  { path: '/conflict-patterns', label: 'Conflict patterns' },
  { path: '/existential-circuits', label: 'Life circuits' },
  { path: '/upgrades', label: 'Upgrades' },
  { path: '/compatibility', label: 'Compatibility' },
  { path: '/summary', label: 'Summary' },
];

export default function TopNav() {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  const rid = searchParams?.get('rid') || '';

  const showNav = [
    '/portal',
    '/your-id',
    '/results',
    '/conflict-patterns',
    '/existential-circuits',
    '/upgrades',
    '/results/operation-of-life-report',
    '/compatibility',
    '/summary',
  ].some((prefix) => pathname.startsWith(prefix));

  if (!showNav) return null;
  if (pathname.startsWith('/portal')) return null;

  const breadcrumb =
    DEEP_LABELS.find((d) => pathname === d.path || pathname.startsWith(d.path + '/'))?.label ||
    'Report';

  if (!rid) {
    return (
      <nav className="sticky top-0 z-50 border-b border-line bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="font-display text-lg font-semibold text-ink">
            Point Zero
          </Link>
          <Link href="/" className="text-sm font-medium text-ink-muted hover:text-ink">
            Home
          </Link>
        </div>
      </nav>
    );
  }

  return <ResultsHeader rid={rid} breadcrumb={breadcrumb} showSectionNav={false} />;
}
