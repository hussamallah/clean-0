import { NextRequest, NextResponse } from 'next/server';
import { AI_PROMPTS, getDeepSeekApiKey } from '@/lib/gemini/config';
import { generateDeepSeekText } from '@/lib/gemini/client';

async function loadProfileContext(rid: string, origin: string) {
  const res = await fetch(`${origin}/api/who/${rid}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Profile not found');
  const data = await res.json();
  const who = data?.who;
  const results = data?.results || [];
  const arch = results.find((r: any) => r.domain === 'ARCH')?.payload?.winner;
  const means = who?.derived?.domainMeans || {};
  const narrative = Array.isArray(who?.narrative) ? who.narrative.join(' ') : '';
  return `Archetype: ${arch || 'unknown'}
Domain means (1-5): O=${means.O}, C=${means.C}, E=${means.E}, A=${means.A}, N=${means.N}
Narrative: ${narrative}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rid = String(body?.rid || '').trim();
    const message = String(body?.message || '').trim();
    if (!rid || !message) {
      return NextResponse.json({ error: 'rid and message required' }, { status: 400 });
    }

    const apiKey = getDeepSeekApiKey(body?.apiKey);
    if (!apiKey) {
      return NextResponse.json(
        { error: 'DeepSeek API key missing. Set DEEPSEEK_API_KEY on the server.' },
        { status: 400 },
      );
    }

    const origin = new URL(req.url).origin;
    const profile = await loadProfileContext(rid, origin);
    const history = Array.isArray(body?.history) ? body.history : [];
    const text = await generateDeepSeekText(apiKey, {
      systemPrompt: AI_PROMPTS.chat,
      userPrompt: `Profile:\n${profile}\n\nUser message:\n${message}`,
      history,
      thinking: 'disabled',
      maxTokens: 2048,
    });
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Chat failed' }, { status: 500 });
  }
}
