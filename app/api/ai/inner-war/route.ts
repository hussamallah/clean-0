import { NextRequest, NextResponse } from 'next/server';
import { AI_PROMPTS, getDeepSeekApiKey } from '@/lib/gemini/config';
import { generateDeepSeekText } from '@/lib/gemini/client';
import { canonicalFacets, type DomainKey } from '@/lib/bigfive/constants';
import { selectFiveCards } from '@/lib/bigfive/fiveCardSelector';

async function loadProfileContext(rid: string, origin: string) {
  const res = await fetch(`${origin}/api/who/${rid}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Profile not found');
  const data = await res.json();
  const who = data?.who;
  const results = data?.results || [];
  const arch = results.find((r: any) => r.domain === 'ARCH')?.payload?.winner;

  const facets: Array<{ domain: DomainKey; facet: string; raw: number; bucket: 'High' | 'Medium' | 'Low' }> = [];
  for (const d of ['O', 'C', 'E', 'A', 'N'] as DomainKey[]) {
    const payload = results.find((r: any) => r.domain === d)?.payload;
    if (!payload) continue;
    const A_raw = (payload?.phase2?.A_raw || {}) as Record<string, number>;
    const bucket = (payload?.final?.bucket || {}) as Record<string, 'High' | 'Medium' | 'Low'>;
    for (const f of canonicalFacets(d)) {
      facets.push({
        domain: d,
        facet: f,
        raw: Number(A_raw?.[f] ?? 3),
        bucket: bucket[f] || 'Medium',
      });
    }
  }
  const conflicts = selectFiveCards(facets).filter((c: any) => c.type === 'conflict').slice(0, 3);
  const conflictText = conflicts
    .map((c: any) => `${c.facet}: ${c.explanation || ''} ${c.friction || ''}`)
    .join('\n');

  return `Archetype: ${arch || 'unknown'}
Conflict patterns:
${conflictText || 'No strong conflict signals.'}
Inner conflict theme from atlas may apply.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rid = String(body?.rid || '').trim();
    if (!rid) return NextResponse.json({ error: 'rid required' }, { status: 400 });

    const apiKey = getDeepSeekApiKey(body?.apiKey);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepSeek API key missing. Set DEEPSEEK_API_KEY on the server.' },
        { status: 400 },
      );
    }

    const origin = new URL(req.url).origin;
    const profile = await loadProfileContext(rid, origin);
    const text = await generateDeepSeekText(apiKey, {
      systemPrompt: AI_PROMPTS.innerWar,
      userPrompt: profile,
      thinking: 'enabled',
      reasoningEffort: 'high',
      maxTokens: 4096,
    });
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'AI failed' }, { status: 500 });
  }
}
