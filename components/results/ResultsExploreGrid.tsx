'use client';

import Link from 'next/link';

type ExploreCard = {
  href: string;
  title: string;
  subtitle: string;
  desc: string;
  accentColor: string;
};

export default function ResultsExploreGrid({ rid }: { rid: string }) {
  const cards: ExploreCard[] = [
    {
      href: `/results?rid=${encodeURIComponent(rid)}`,
      title: 'Trait details',
      subtitle: 'Deep facet scores',
      desc: 'Explore all five OCEAN domains and 30 facet scores that drive your profile.',
      accentColor: '#3b82f6',
    },
    {
      href: `/conflict-patterns?rid=${encodeURIComponent(rid)}`,
      title: 'Conflict patterns',
      subtitle: 'Where friction lives',
      desc: 'See internal tensions and practical orders for when pressure hits.',
      accentColor: '#ef4444',
    },
    {
      href: `/existential-circuits?rid=${encodeURIComponent(rid)}`,
      title: 'Life circuits',
      subtitle: '16 life signals',
      desc: 'Map Energy, Clarity, Structure, Bond, and Drive — plus your life signals.',
      accentColor: '#8b5cf6',
    },
  ];

  return (
    <section id="explore" className="scroll-mt-28 space-y-4">
      <div>
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">Explore</p>
        <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Go deeper</h2>
        <p className="mt-1 text-sm text-ink-muted">Open a report — each one builds on your same scores.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-col rounded-panel border border-line bg-surface p-5 shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            style={{ borderTopWidth: 3, borderTopColor: card.accentColor }}
          >
            <h3 className="font-display text-lg font-semibold text-ink">{card.title}</h3>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-ink-soft">
              {card.subtitle}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{card.desc}</p>
            <span className="mt-4 text-sm font-semibold text-brand-deep">
              Open →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
