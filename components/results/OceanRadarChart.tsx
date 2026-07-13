'use client';

import { DOMAINS, type DomainKey } from '@/lib/bigfive/constants';

const DOMAIN_ORDER: DomainKey[] = ['O', 'C', 'E', 'A', 'N'];
const DOMAIN_COLORS: Record<DomainKey, string> = {
  O: '#C48A2A',
  C: '#3b82f6',
  E: '#8b5cf6',
  A: '#10b981',
  N: '#ef4444',
};

function pctFromRaw(raw: number): number {
  return Math.round(((Math.max(1, Math.min(5, raw)) - 1) / 4) * 100);
}

type Props = {
  domainMeans: Record<DomainKey, number>;
};

export default function OceanRadarChart({ domainMeans }: Props) {
  const size = 280;
  const center = size / 2;
  const maxR = center - 36;
  const levels = [0.25, 0.5, 0.75, 1];

  const points = DOMAIN_ORDER.map((d, i) => {
    const angle = (Math.PI * 2 * i) / DOMAIN_ORDER.length - Math.PI / 2;
    const pct = pctFromRaw(domainMeans[d] ?? 3);
    const r = (pct / 100) * maxR;
    return {
      d,
      pct,
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
      lx: center + Math.cos(angle) * (maxR + 22),
      ly: center + Math.sin(angle) * (maxR + 22),
      color: DOMAIN_COLORS[d],
      label: DOMAINS[d].label.split(' ')[0],
    };
  });

  const polygon = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <div className="grid items-center gap-6 md:grid-cols-2">
      <div className="flex justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
          {levels.map((lvl) => (
            <polygon
              key={lvl}
              points={DOMAIN_ORDER.map((_, i) => {
                const angle = (Math.PI * 2 * i) / DOMAIN_ORDER.length - Math.PI / 2;
                const r = maxR * lvl;
                return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`;
              }).join(' ')}
              fill="none"
              stroke="rgba(26,28,30,0.08)"
              strokeWidth={1}
            />
          ))}
          {points.map((p) => (
            <line
              key={`axis-${p.d}`}
              x1={center}
              y1={center}
              x2={p.lx}
              y2={p.ly}
              stroke="rgba(26,28,30,0.12)"
            />
          ))}
          <polygon points={polygon} fill="rgba(196,138,42,0.15)" stroke="#C48A2A" strokeWidth={2} />
          {points.map((p) => (
            <circle key={`dot-${p.d}`} cx={p.x} cy={p.y} r={4} fill={p.color} />
          ))}
          {points.map((p) => (
            <text
              key={`label-${p.d}`}
              x={p.lx}
              y={p.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-ink-muted text-[11px] font-medium"
            >
              {p.label}
            </text>
          ))}
        </svg>
      </div>

      <div className="space-y-3">
        {DOMAIN_ORDER.map((d) => {
          const pct = pctFromRaw(domainMeans[d] ?? 3);
          return (
            <div key={d}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-ink">{DOMAINS[d].label.split(' ')[0]}</span>
                <span style={{ color: DOMAIN_COLORS[d] }} className="font-semibold">
                  {pct}%
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: DOMAIN_COLORS[d] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
