const LAST_RID_KEY = 'gz_last_rid';
const FULL_RESULTS_KEY = 'gz_full_results';
const ANSWER_CODE_KEY = 'gz_answer_code';

export function saveRunLocally(rid: string, results: unknown, answerCode?: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LAST_RID_KEY, rid);
    localStorage.setItem(FULL_RESULTS_KEY, JSON.stringify(results));
    if (answerCode) localStorage.setItem(ANSWER_CODE_KEY, answerCode);
    document.cookie = `${LAST_RID_KEY}=${encodeURIComponent(rid)}; path=/; max-age=31536000; SameSite=Lax`;
  } catch {
    /* ignore quota errors */
  }
}

export function getLastRid(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const fromStorage = localStorage.getItem(LAST_RID_KEY);
    if (fromStorage) return fromStorage;
    const match = document.cookie.match(/(?:^|;\s*)gz_last_rid=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function getSavedAnswerCode(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ANSWER_CODE_KEY);
  } catch {
    return null;
  }
}

export function getSavedResults(): unknown[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FULL_RESULTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function clearSavedRun(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LAST_RID_KEY);
    localStorage.removeItem(FULL_RESULTS_KEY);
    localStorage.removeItem(ANSWER_CODE_KEY);
    document.cookie = `${LAST_RID_KEY}=; path=/; max-age=0; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}
