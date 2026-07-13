import copyData from '@/lib/data/compatibility_report_copy.json';

type Synergy = 'Align' | 'Complement' | 'Tension' | 'Watch';

const FACET_COPY_ALIASES: Record<string, string> = {
  'O:Liberalism': 'O:Values Openness',
  'C:Achievement': 'C:Achievement-Striving',
};

function resolveFacetKey(facetKey: string): string {
  return FACET_COPY_ALIASES[facetKey] || facetKey;
}

export function domainSynergyParagraph(domainKey: string, synergy: string): string {
  const map = (copyData as any).domainSynergy?.[domainKey] as Record<string, string> | undefined;
  return map?.[synergy] || 'A notable dynamic in this area worth discussing openly.';
}

export function facetConflictDescription(facetKey: string): string {
  const key = resolveFacetKey(facetKey);
  const map = (copyData as any).facetConflict as Record<string, string>;
  return (
    map?.[key] ||
    'These two traits pull in opposite directions — one partner scores high, the other low. Name it early: when it surfaces in behaviour, it rarely looks like a trait difference and more like a character flaw.'
  );
}

export function facetAlignDescription(facetKey: string): string {
  const key = resolveFacetKey(facetKey);
  const map = (copyData as any).facetAlign as Record<string, string>;
  return (
    map?.[key] ||
    'You reinforce each other on this trait — shared intensity lowers day-to-day friction, but the same blind spot can show up twice.'
  );
}

export function alignmentHighlightsLine(facetLabels: string[]): string {
  if (!facetLabels.length) {
    return 'No shared trait extremes detected. Your alignment lives in the mid-range — adaptable, but without the strong pull of matching intensity.';
  }
  return `You share strong alignment on: ${facetLabels.join(', ')}. Where you both score at the same extreme, you're naturally reinforcing each other — these are your lowest-friction areas.`;
}

export const SECTION_INTROS = {
  howItWorks: (copyData as any).intros?.howItWorksIntro || '',
  keyDynamics: (copyData as any).intros?.keyDynamicsIntro || '',
  playbooks: (copyData as any).intros?.playbooksIntro || '',
  scenarios: (copyData as any).intros?.scenariosIntro || '',
};

export const DOMAIN_LABELS: Record<string, string> = {
  O: 'Openness',
  C: 'Conscientiousness',
  E: 'Extraversion',
  A: 'Agreeableness',
  N: 'Neuroticism',
};

export function synergyColor(synergy: Synergy | string): string {
  switch (synergy) {
    case 'Tension':
      return '#ef4444';
    case 'Watch':
      return '#fbbf24';
    case 'Align':
      return '#22c55e';
    default:
      return '#e5e7eb';
  }
}
