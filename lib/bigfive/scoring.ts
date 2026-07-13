/** Deterministic facet scoring — mirrors Android GroundZeroAssessmentScreen + ArchRulesEngine. */

/** Likert 1–5 (Strongly Disagree → Strongly Agree) → raw 1.0–5.0 on the No branch. */
export const LIKERT_TO_RAW: Record<number, number> = {
  5: 1.0,
  4: 2.0,
  3: 3.0,
  2: 4.0,
  1: 5.0,
};

export type MeanBucket = 'High' | 'Medium' | 'Low';

export function sanitizeScore(raw: number): number {
  if (!Number.isFinite(raw)) return 3;
  return Math.max(1, Math.min(5, raw));
}

/** No + Likert → 1.0–5.0 */
export function scoreFromNoLikert(likert1to5: number): number {
  return sanitizeScore(LIKERT_TO_RAW[likert1to5] ?? 3);
}

/** Yes + Likert → same + 0.5 (max 5.0) */
export function scoreFromYesLikert(likert1to5: number): number {
  return sanitizeScore((LIKERT_TO_RAW[likert1to5] ?? 3) + 0.5);
}

export function scoreFromLikert(likert1to5: number, binYes: boolean): number {
  return binYes ? scoreFromYesLikert(likert1to5) : scoreFromNoLikert(likert1to5);
}

/** Facet buckets: High ≥4.0 · Low ≤2.0 · else Medium */
export function facetToBucket(raw: number): MeanBucket {
  const v = sanitizeScore(raw);
  if (v >= 4.0) return 'High';
  if (v <= 2.0) return 'Low';
  return 'Medium';
}

/** Domain buckets: High ≥3.75 · Low ≤2.25 · else Medium */
export function domainMeanBucket(mean: number): MeanBucket {
  if (mean >= 3.75) return 'High';
  if (mean <= 2.25) return 'Low';
  return 'Medium';
}

/** Domain mean = average of 6 facets */
export function domainMeanFromFacets(raws: number[]): number {
  if (raws.length === 0) return 3;
  const sum = raws.reduce((a, c) => a + sanitizeScore(c), 0);
  return Math.round((sum / raws.length) * 100) / 100;
}
