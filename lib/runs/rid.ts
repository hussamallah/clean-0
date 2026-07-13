import { stableStringify } from '@/lib/bigfive/format';
import crypto from 'node:crypto';

export function ridFor(results: Array<{ domain: string; payload: unknown }>): string {
  const normalized = results.map((r) => ({ domain: r.domain, payload: r.payload }));
  const json = stableStringify(normalized);
  return crypto.createHash('sha256').update(Buffer.from(json, 'utf8')).digest('hex').slice(0, 24);
}
