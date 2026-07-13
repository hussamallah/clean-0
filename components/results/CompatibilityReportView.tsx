'use client';

import Link from 'next/link';
import {
  DOMAIN_LABELS,
  SECTION_INTROS,
  alignmentHighlightsLine,
  domainSynergyParagraph,
  facetAlignDescription,
  facetConflictDescription,
  synergyColor,
} from '@/lib/bigfive/compatibilityReportCopy';

function levelLabel(score: number): 'High' | 'Low' {
  return score >= 4 ? 'High' : 'Low';
}

function facetLabel(facetKey: string): string {
  return facetKey.split(':')[1] || facetKey;
}

type Props = {
  data: any;
  backHref?: string;
  compact?: boolean;
};

export default function CompatibilityReportView({ data, backHref, compact }: Props) {
  const alignPairs = (data?.compat?.facets?.align_pairs || []).slice(0, 4);
  const conflictPairs = (data?.compat?.facets?.conflict_pairs || []).slice(0, 4);
  const topOverride = data?.prescriptions?.overrides?.[0];
  const alignLabels = alignPairs.map((p: any) => facetLabel(p.facet));
  const overall = data?.compat?.overall || {};
  const band = String(overall.band || '').toUpperCase();

  return (
    <div className={`font-sans leading-relaxed text-ink ${compact ? '' : 'min-h-screen bg-canvas'}`}>
      {backHref && !compact && (
        <Link
          href={backHref}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink shadow-soft hover:bg-surface-muted"
        >
          <span>←</span>
          <span>Back</span>
        </Link>
      )}

      <div className={`mx-auto max-w-3xl px-4 ${compact ? 'py-2' : 'py-12'}`}>
        <header className="mb-8 text-center">
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-ink-muted">Point Zero</p>
          <h1 className="mb-2 font-display text-3xl font-semibold text-ink md:text-4xl">Compatibility Report</h1>
          {data?.ui?.badges && (
            <p className="text-sm text-ink-muted">{data.ui.badges.join(' · ')}</p>
          )}
        </header>

        {/* Overall score ring */}
        <section className="mb-8 rounded-panel border border-line bg-surface p-8 text-center shadow-soft">
          <div
            className="mx-auto mb-4 flex h-36 w-36 items-center justify-center rounded-full border-4"
            style={{ borderColor: synergyColor(overall.band === 'Strong' ? 'Align' : overall.band === 'Moderate' ? 'Complement' : 'Tension') }}
          >
            <div>
              <div className="text-4xl font-bold text-ink">{overall.score_pct}%</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-widest text-ink-muted">{band}</div>
            </div>
          </div>
          <p className="mx-auto max-w-xl text-sm text-ink-muted">
            {(overall.rationale || []).join(' · ')}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs font-medium uppercase tracking-wider text-ink-soft">
            <span className="text-red-600">Tension</span>
            <span className="text-amber-600">Watch</span>
            <span className="text-emerald-600">Align</span>
            <span className="text-ink-muted">Complement</span>
          </div>
        </section>

        {data?.narrative && (
          <section className="mb-8 rounded-xl border border-line bg-canvas p-5">
            <p className="text-sm text-ink leading-relaxed">{data.narrative}</p>
          </section>
        )}

        {data?.archetypePairing && (
          <section className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-amber-300 mb-2">Archetype Dynamic</h2>
            <p className="text-sm text-ink leading-relaxed">{data.archetypePairing}</p>
          </section>
        )}

        <section className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-300 mb-2">How it works</h2>
          <p className="text-sm text-ink-muted">{SECTION_INTROS.howItWorks}</p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-center mb-6">Domain Synergy</h2>
          <div className="space-y-5">
            {['O', 'C', 'E', 'A', 'N'].map((key) => {
              const value = data?.compat?.domains?.[key];
              if (!value) return null;
              const color = synergyColor(value.synergy);
              return (
                <div key={key} className="rounded-xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                    <h3 className="font-semibold">
                      {DOMAIN_LABELS[key]} <span className="text-ink-soft text-sm">({key})</span>
                    </h3>
                    <span className="text-sm" style={{ color }}>
                      {Math.round(value.score_pct)}% · {value.synergy}
                    </span>
                  </div>
                  <p className="text-sm text-ink-muted mb-3">{domainSynergyParagraph(key, value.synergy)}</p>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${value.score_pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold text-center mb-2">Key Dynamics</h2>
          <p className="text-sm text-ink-muted text-center mb-6 max-w-2xl mx-auto">{SECTION_INTROS.keyDynamics}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <h3 className="font-semibold text-green-300 mb-3">Alignment Highlights</h3>
              <p className="text-xs text-ink-muted mb-3">{alignmentHighlightsLine(alignLabels)}</p>
              <div className="space-y-3">
                {alignPairs.map((pair: any) => (
                  <div key={pair.facet}>
                    <div className="font-medium text-sm text-white">{facetLabel(pair.facet)}</div>
                    <p className="text-xs text-ink-muted mt-1">{facetAlignDescription(pair.facet)}</p>
                  </div>
                ))}
                {alignPairs.length === 0 && <p className="text-sm text-ink-muted">No shared extremes detected.</p>}
              </div>
            </div>
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <h3 className="font-semibold text-red-300 mb-3">Conflict Zone</h3>
              <div className="space-y-4">
                {conflictPairs.map((pair: any, i: number) => (
                  <div key={pair.facet}>
                    <div className="font-medium text-sm text-white">{facetLabel(pair.facet)}</div>
                    <p className="text-xs text-ink-muted mt-1">{facetConflictDescription(pair.facet)}</p>
                    <p className="text-[11px] text-ink-soft mt-2">
                      You: {levelLabel(pair.a)} · Them: {levelLabel(pair.b)}
                    </p>
                    {topOverride && i === 0 && (
                      <p className="text-[11px] text-amber-200 mt-2">
                        Top guardrail: <strong>{topOverride.id}</strong> — {topOverride.why}
                      </p>
                    )}
                  </div>
                ))}
                {conflictPairs.length === 0 && <p className="text-sm text-ink-muted">No significant conflict pairs identified.</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-xl border border-line bg-surface p-5">
          <h2 className="text-xl font-bold mb-2">Playbooks You Two Can Use</h2>
          <p className="text-sm text-ink-muted mb-4">{SECTION_INTROS.playbooks}</p>
          {data?.prescriptions?.overrides?.length || data?.prescriptions?.routines?.length ? (
            <ul className="space-y-3 text-sm text-ink">
              {data.prescriptions.overrides.map((p: any) => (
                <li key={p.id}>
                  <strong className="text-yellow-300">{p.id}:</strong> {p.why}
                </li>
              ))}
              {data.prescriptions.routines.map((r: any) => (
                <li key={r.name}>
                  <strong className="text-yellow-300">{r.name}:</strong> {r.spec}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">
              Your profiles suggest a natural alignment that doesn&apos;t require specific playbooks. Continue with open communication.
            </p>
          )}
        </section>

        <section className="mb-10 rounded-xl border border-line bg-surface p-5">
          <h2 className="text-xl font-bold mb-2">Scenarios</h2>
          <p className="text-sm text-ink-muted mb-4">{SECTION_INTROS.scenarios}</p>
          {data?.prescriptions?.scenarios?.work?.length || data?.prescriptions?.scenarios?.relationship?.length ? (
            <ul className="space-y-2 text-sm text-ink">
              {data.prescriptions.scenarios.work.map((s: string, i: number) => (
                <li key={`w-${i}`}><strong className="text-amber-200">Work:</strong> {s}</li>
              ))}
              {data.prescriptions.scenarios.relationship.map((s: string, i: number) => (
                <li key={`r-${i}`}><strong className="text-amber-200">Relationship:</strong> {s}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-muted">No specific high-risk scenarios were flagged based on your compatibility profile.</p>
          )}
        </section>

        {data?.compare_hash && (
          <p className="text-center text-[10px] font-mono text-ink-soft">
            Compare hash: {data.compare_hash}
          </p>
        )}
      </div>
    </div>
  );
}
