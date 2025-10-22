import { NextResponse } from 'next/server';
import { computeCompatibility } from '@/lib/bigfive/compatibility';
import type { GZProfile, DomainProfile, DomainKey } from '@/lib/bigfive/types';
import { sha256 } from '@/lib/crypto/sha256';
import fs from 'fs/promises';
import path from 'path';

const DOMAIN_KEYS: DomainKey[] = ['O', 'C', 'E', 'A', 'N'];

function calculateDomainProfile(facetScores: Record<string, number>): DomainProfile {
  const scores = Object.values(facetScores);
  if (scores.length === 0) {
    return { raw: 3, pct: 50, bucket: 'Med' };
  }
  const raw = scores.reduce((a, b) => a + b, 0) / scores.length;
  const pct = Math.round(((raw - 1) / 4) * 100);
  
  let bucket: 'High' | 'Med' | 'Low' = 'Med';
  if (pct >= 67) {
    bucket = 'High';
  } else if (pct <= 33) {
    bucket = 'Low';
  }
  return { raw, pct, bucket };
}

async function loadFullProfile(rid: string, origin: string): Promise<GZProfile> {
  const url = `${origin}/api/who/${rid}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`RID not found: ${rid}`);
  const data = await res.json();
  const fullResults = data.results as Array<{ domain: DomainKey; payload: any }>;

  const domains: Record<DomainKey, DomainProfile> = {} as any;
  const facets: Record<string, number> = {};

  for (const domainKey of DOMAIN_KEYS) {
    const result = fullResults.find(r => r.domain === domainKey);
    const facetScores = result?.payload?.phase2?.A_raw || {};
    domains[domainKey] = calculateDomainProfile(facetScores);
    for (const facet in facetScores) {
      facets[`${domainKey}:${facet}`] = facetScores[facet];
    }
  }
  
  const profile: GZProfile = {
    rid,
    profile_hash: await sha256(JSON.stringify(data.results)),
    domains,
    facets,
    archetype: data.who?.deterministic?.archetype || { id: 'unknown', confidence: 0 }
  };

  return profile;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ridA = url.searchParams.get('ridA');
    const ridB = url.searchParams.get('ridB');
    const origin = `${url.protocol}//${url.host}`;

    if (!ridA || !ridB) {
      return NextResponse.json({ error: 'ridA and ridB required' }, { status: 400 });
    }

    const [profileA, profileB] = await Promise.all([
      loadFullProfile(ridA, origin),
      loadFullProfile(ridB, origin),
    ]);

    const bankFile = await fs.readFile(path.join(process.cwd(), 'gz-final', 'bankv1.json'), 'utf-8');
    const rulesFile = await fs.readFile(path.join(process.cwd(), 'arctyps rules.json'), 'utf-8');
    const bank_hash = await sha256(bankFile);
    const rules_hash = await sha256(rulesFile);
    const compare_hash = await sha256(`${ridA}|${ridB}|${bank_hash}|${rules_hash}|compat_algo_v1`);

    const { compat, prescriptions } = computeCompatibility(profileA, profileB);

    const responseJson = {
      version: 'gz-compat-v1',
      generated_at_iso: new Date().toISOString(),
      compare_hash,
      bank_hash,
      rules_hash,
      algo: {
        id: 'compat_algo_v1',
        notes: [
          'deterministic; no RNG',
          'domain order O,C,E,A,N',
          'facet aliasing applied (e.g., Values Openness→Liberalism)',
        ],
      },
      a: profileA,
      b: profileB,
      compat: compat,
      prescriptions: prescriptions,
      ui: {
        badges: ['Deterministic', 'Reproducible'],
        cta: [
          { id: 'get_override_pack', label: 'Deep Compatibility Override', price_usd: 7 },
          { id: 'you_vs_them', label: 'You vs Them cards', price_usd: 1.5 },
        ],
        export: { pdf: true, json: true },
      },
    };

    return NextResponse.json(responseJson);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'fail' }, { status: 500 });
  }
}


