import { isAnswerCode } from '@/lib/answerCode';

export async function resolveProfileInput(input: string): Promise<string | null> {
  const trimmed = String(input || '').trim();
  if (!trimmed) return null;
  if (/^[a-f0-9]{24}$/i.test(trimmed)) return trimmed;
  try {
    const url = new URL(trimmed);
    const rid = url.searchParams.get('rid');
    if (rid) return rid;
  } catch {
    /* not a url */
  }
  if (isAnswerCode(trimmed)) {
    const res = await fetch('/api/answer-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: trimmed }),
    });
    if (res.ok) {
      const data = await res.json();
      return data?.rid || null;
    }
  }
  const direct = trimmed.match(/([a-f0-9]{24})/i);
  return direct?.[1] || null;
}
