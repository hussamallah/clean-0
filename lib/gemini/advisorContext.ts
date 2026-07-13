import { type DomainKey } from '@/lib/bigfive/constants';
import { toPercentFromRaw } from '@/lib/bigfive/format';
import { AI_PROMPTS, type AdvisorPromptKey } from '@/lib/gemini/config';

export type AdvisorId = 'career-architect' | 'pressure-profile';

export const ADVISOR_IDS: AdvisorId[] = ['career-architect', 'pressure-profile'];

export const ADVISOR_META: Record<
  AdvisorId,
  { label: string; promptKey: AdvisorPromptKey; tagline: string; accent: string }
> = {
  'career-architect': {
    label: 'Career Architect',
    promptKey: 'careerArchitect',
    tagline: 'Ranked role fits & red-flag environments',
    accent: 'emerald',
  },
  'pressure-profile': {
    label: 'Pressure Profile',
    promptKey: 'pressureProfile',
    tagline: 'Stress patterns, warning signs & coping',
    accent: 'orange',
  },
};

export async function loadWhoBundle(rid: string, origin: string) {
  const res = await fetch(`${origin}/api/who/${rid}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Profile not found');
  return res.json();
}

export function buildOceanProfile(whoData: any, results: any[]): string {
  const means = whoData?.derived?.domainMeans || {};
  const domains: Record<string, { mean: number; percentile: number }> = {};

  for (const d of ['O', 'C', 'E', 'A', 'N'] as DomainKey[]) {
    const payload = results.find((r: any) => r.domain === d)?.payload;
    const mean = Number(means[d] ?? payload?.final?.domain_mean_raw ?? 3);
    const percentile = Number(payload?.final?.domain_mean_pct ?? toPercentFromRaw(mean));
    domains[d] = {
      mean: Math.round(mean * 100) / 100,
      percentile: Math.round(percentile * 10) / 10,
    };
  }

  const archetype = results.find((r: any) => r.domain === 'ARCH')?.payload?.winner;
  const narrative = Array.isArray(whoData?.narrative) ? whoData.narrative.join(' ') : '';

  return JSON.stringify(
    {
      archetype: archetype || 'unknown',
      domain_scores: domains,
      narrative_summary: narrative,
    },
    null,
    2,
  );
}

export function buildKnownFacts(whoData: any, results: any[], extraFacts: string[] = []): string {
  const facts: string[] = [];
  const archetype = results.find((r: any) => r.domain === 'ARCH')?.payload?.winner;
  if (archetype) facts.push(`Archetype: ${archetype}`);

  const narrative = Array.isArray(whoData?.narrative) ? whoData.narrative[0] : null;
  if (narrative) facts.push(`Profile narrative: ${narrative}`);

  for (const fact of extraFacts) {
    const trimmed = String(fact || '').trim();
    if (trimmed && !facts.includes(trimmed)) facts.push(trimmed);
  }

  return facts.length ? facts.map((f, i) => `${i + 1}. ${f}`).join('\n') : 'None yet.';
}

export function substituteAdvisorPrompt(
  template: string,
  oceanProfile: string,
  knownFacts: string,
): string {
  return template
    .replace(/\{ocean_profile\}/g, oceanProfile)
    .replace(/\{known_facts\}/g, knownFacts)
    .replace(/\[PRODUCT\]/g, 'Point Zero');
}

export function buildAdvisorSystemPrompt(
  advisor: AdvisorId,
  oceanProfile: string,
  knownFacts: string,
): string {
  const { promptKey } = ADVISOR_META[advisor];
  return substituteAdvisorPrompt(AI_PROMPTS[promptKey], oceanProfile, knownFacts);
}
