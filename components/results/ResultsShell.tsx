'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';

export type ResultsSectionId = 'overview' | 'traits' | 'explore' | 'insights' | 'share';

const PORTAL_SECTIONS: { id: ResultsSectionId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'traits', label: 'Traits' },
  { id: 'explore', label: 'Explore' },
  { id: 'insights', label: 'Insights' },
  { id: 'share', label: 'Share' },
];

export function ResultsHeader({
  rid,
  archetypeTitle,
  breadcrumb,
  showSectionNav = true,
  activeSection,
}: {
  rid: string;
  archetypeTitle?: string;
  breadcrumb?: string;
  showSectionNav?: boolean;
  activeSection?: ResultsSectionId;
}) {
  const portalHref = `/portal?rid=${encodeURIComponent(rid)}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <Link href="/" className="text-xs font-medium uppercase tracking-[0.18em] text-ink-soft hover:text-ink">
              Point Zero
            </Link>
            <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              {archetypeTitle ? (
                <p className="truncate font-display text-lg font-semibold text-ink">{archetypeTitle}</p>
              ) : null}
              {breadcrumb ? (
                <>
                  <span className="text-ink-soft">/</span>
                  <p className="text-sm font-medium text-ink-muted">{breadcrumb}</p>
                </>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden rounded-lg border border-line bg-surface px-2.5 py-1 font-mono text-xs text-ink-muted sm:inline">
              {rid.length > 14 ? `${rid.slice(0, 12)}…` : rid}
            </span>
            {breadcrumb ? (
              <Link
                href={portalHref}
                className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink shadow-soft hover:bg-surface-muted"
              >
                Back to Overview
              </Link>
            ) : (
              <Link
                href="/"
                className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
              >
                Home
              </Link>
            )}
          </div>
        </div>

        {showSectionNav && !breadcrumb ? (
          <nav className="flex gap-1 overflow-x-auto pb-1" aria-label="Results sections">
            {PORTAL_SECTIONS.map((s) => {
              const isActive = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand/15 text-brand-deep'
                      : 'text-ink-muted hover:bg-surface-muted hover:text-ink'
                  }`}
                >
                  {s.label}
                </a>
              );
            })}
          </nav>
        ) : null}
      </div>
    </header>
  );
}

export function ResultsShell({
  rid,
  archetypeTitle,
  breadcrumb,
  showSectionNav = true,
  activeSection,
  children,
}: {
  rid: string;
  archetypeTitle?: string;
  breadcrumb?: string;
  showSectionNav?: boolean;
  activeSection?: ResultsSectionId;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <ResultsHeader
        rid={rid}
        archetypeTitle={archetypeTitle}
        breadcrumb={breadcrumb}
        showSectionNav={showSectionNav}
        activeSection={activeSection}
      />
      {children}
    </div>
  );
}

/** Observe which #section is in view for sticky nav highlight */
export function useActiveResultsSection() {
  const [active, setActive] = useState<ResultsSectionId>('overview');

  useEffect(() => {
    const sectionIds: ResultsSectionId[] = ['overview', 'traits', 'explore', 'insights', 'share'];
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActive(visible[0].target.id as ResultsSectionId);
        }
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, 0.25, 0.5] },
    );

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return active;
}
