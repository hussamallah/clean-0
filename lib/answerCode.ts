import { stableStringify } from '@/lib/bigfive/format';

export type AnswerCodePayload = {
  v: 1;
  results: Array<{ domain: string; payload: unknown }>;
};

function toBase64Url(text: string): string {
  if (typeof window !== 'undefined') {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  return Buffer.from(text, 'utf8').toString('base64url');
}

function fromBase64Url(code: string): string {
  const padded = code.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  const normalized = padded + pad;
  if (typeof window !== 'undefined') {
    const binary = atob(normalized);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  return Buffer.from(normalized, 'base64').toString('utf8');
}

export function encodeAnswerCode(results: AnswerCodePayload['results']): string {
  const payload: AnswerCodePayload = { v: 1, results };
  return toBase64Url(stableStringify(payload));
}

export function decodeAnswerCode(code: string): AnswerCodePayload | null {
  const trimmed = String(code || '').trim();
  if (!trimmed) return null;
  try {
    const json = fromBase64Url(trimmed);
    const parsed = JSON.parse(json) as AnswerCodePayload;
    if (parsed?.v !== 1 || !Array.isArray(parsed.results) || parsed.results.length === 0) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isAnswerCode(input: string): boolean {
  const trimmed = String(input || '').trim();
  if (trimmed.length < 16) return false;
  if (/^[a-f0-9]{24}$/i.test(trimmed)) return false;
  return decodeAnswerCode(trimmed) !== null;
}
