'use client';

import Link from 'next/link';

const ARCHETYPES = [
  'Sovereign',
  'Rebel',
  'Visionary',
  'Navigator',
  'Guardian',
  'Seeker',
  'Architect',
  'Spotlight',
  'Diplomat',
  'Partner',
  'Provider',
  'Sentinel',
  'Vessel',
] as const;

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      {/* HERO — brand, one headline, one sentence, CTAs, atmosphere */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(232, 197, 122, 0.35) 0%, transparent 55%), linear-gradient(180deg, #F7F5F2 0%, #EEF1F4 100%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 pb-16 pt-12 text-center sm:px-6 sm:pb-24 sm:pt-20">
          <div className="animate-fade-rise flex flex-col items-center">
            <img
              src="/the-axis.png"
              alt=""
              className="mb-6 h-20 w-20 object-contain sm:h-24 sm:w-24"
            />
            <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Point Zero
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Understand how you operate in 7 minutes
            </h1>
            <p className="mt-4 max-w-xl text-base text-ink-muted sm:text-lg">
              A clear personality profile and identity blueprint — reproducible, practical, and built on the Big Five.
            </p>
            <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/assessment"
                className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-brand-deep"
              >
                Start the assessment
              </Link>
              <Link
                href="/free-results"
                className="inline-flex items-center justify-center rounded-xl border border-line bg-surface px-6 py-3.5 text-base font-semibold text-ink shadow-soft transition hover:bg-surface-muted"
              >
                See a sample result
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Three steps to your blueprint
          </h2>
          <p className="mt-3 text-ink-muted">
            Answer honestly. We score the same way every time.
          </p>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: '1',
              title: 'Take the assessment',
              d: 'About 7 minutes across your core behavioral patterns.',
            },
            {
              n: '2',
              title: 'We map your traits',
              d: 'Thirty facets across the Big Five, plus your archetype.',
            },
            {
              n: '3',
              title: 'Get your blueprint',
              d: 'A living profile you can explore, share, and return to.',
            },
          ].map((s) => (
            <li
              key={s.n}
              className="rounded-panel border border-line bg-surface p-6 shadow-soft"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand/15 text-sm font-bold text-brand-deep">
                {s.n}
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What you get */}
      <section className="border-y border-line bg-surface-muted/60 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">What you get</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Profile, patterns, and next steps
            </h2>
            <p className="mt-3 text-ink-muted">
              Psychometric clarity plus practical identity tools — not a vague label.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Your archetype',
                d: 'One clear mirror for how you move through pressure, purpose, and people.',
              },
              {
                title: 'Trait profile',
                d: 'Big Five scores with facet detail you can drill into.',
              },
              {
                title: 'Actionable patterns',
                d: 'Conflict dynamics, life circuits, and compatibility when you need them.',
              },
            ].map((item) => (
              <div key={item.title} className="rounded-panel border border-line bg-surface p-6 shadow-soft">
                <h3 className="font-display text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archetypes */}
      <section id="archetypes" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">Archetypes</p>
            <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
              Thirteen archetypes, one clear mirror
            </h2>
            <p className="mt-2 max-w-lg text-ink-muted">
              Your result points to the pattern that fits you best.
            </p>
          </div>
          <Link href="/assessment" className="text-sm font-semibold text-brand-deep hover:underline">
            Take the assessment →
          </Link>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {ARCHETYPES.map((name) => (
            <li
              key={name}
              className="flex flex-col items-center gap-2 rounded-xl border border-line bg-surface p-3 shadow-soft"
            >
              <img
                src={`/${name.toLowerCase()}.png`}
                alt=""
                className="h-14 w-14 object-contain"
              />
              <span className="text-sm font-medium text-ink">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Trust */}
      <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="rounded-panel border border-line bg-surface p-8 shadow-soft sm:p-10">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">Trust</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ink">
            Same answers, same result
          </h2>
          <p className="mt-3 max-w-2xl text-ink-muted">
            Scoring is deterministic and verifiable — no randomized profiles. Your data stays tied to your Run ID so you can retrieve results anytime.
          </p>
          <Link href="/privacy" className="mt-4 inline-block text-sm font-semibold text-brand-deep hover:underline">
            Privacy & methodology →
          </Link>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-line bg-surface-muted/80 px-4 py-16 text-center sm:px-6">
        <h2 className="font-display text-2xl font-semibold text-ink sm:text-3xl">
          Ready to see your blueprint?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-muted">
          Seven minutes. One clear starting point.
        </p>
        <Link
          href="/assessment"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-brand px-6 py-3.5 text-base font-semibold text-white shadow-soft transition hover:bg-brand-deep"
        >
          Start the assessment
        </Link>
      </section>

      <footer className="border-t border-line px-4 py-8 text-center text-sm text-ink-soft">
        © {new Date().getFullYear()} Point Zero
      </footer>
    </main>
  );
}
