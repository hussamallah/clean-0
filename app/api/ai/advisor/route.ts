import { NextRequest, NextResponse } from 'next/server';
import {
  ADVISOR_IDS,
  buildAdvisorSystemPrompt,
  buildKnownFacts,
  buildOceanProfile,
  loadWhoBundle,
  type AdvisorId,
} from '@/lib/gemini/advisorContext';
import { getDeepSeekApiKey } from '@/lib/gemini/config';
import { generateDeepSeekText } from '@/lib/gemini/client';

const SESSION_START =
  'The user opened a new advisor session. Introduce yourself in one short sentence, then ask your first question.';

const FINALIZE_HINT =
  '\n\n[SYSTEM NOTE] You now have enough signal from OCEAN + answers. Produce the final OUTPUT FORMAT now. Do not ask another question unless one critical gap remains.';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const advisor = String(body?.advisor || '').trim() as AdvisorId;
    const rid = String(body?.rid || '').trim();
    const rawMessage = String(body?.message || '').trim();
    const isSessionStart = rawMessage === '[SESSION_START]';
    const message = isSessionStart ? SESSION_START : rawMessage;

    if (!ADVISOR_IDS.includes(advisor)) {
      return NextResponse.json({ error: 'Invalid advisor' }, { status: 400 });
    }
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
    const bundle = await loadWhoBundle(rid, origin);
    const whoData = bundle?.who;
    const results = Array.isArray(bundle?.results) ? bundle.results : [];
    const extraFacts = Array.isArray(body?.knownFacts)
      ? body.knownFacts.map((f: unknown) => String(f || '').trim()).filter(Boolean)
      : [];

    const oceanProfile = buildOceanProfile(whoData, results);
    const knownFacts = buildKnownFacts(whoData, results, extraFacts);
    const systemPrompt = buildAdvisorSystemPrompt(advisor, oceanProfile, knownFacts);
    const history = Array.isArray(body?.history) ? body.history : [];

    // Prior user answers already in history + this turn (unless session start)
    const priorUserTurns = history.filter((h: any) => h?.role === 'user').length;
    const userTurnsAfter = priorUserTurns + (isSessionStart ? 0 : 1);

    // Non-thinking for Q&A; thinking for personalized final report
    const forceFinalize = Boolean(body?.finalize) || userTurnsAfter >= 3;
    const thinking = !isSessionStart && forceFinalize ? 'enabled' : 'disabled';
    const userPrompt =
      thinking === 'enabled' && !isSessionStart ? `${message}${FINALIZE_HINT}` : message;

    const text = await generateDeepSeekText(apiKey, {
      systemPrompt,
      userPrompt,
      history,
      thinking,
      reasoningEffort: thinking === 'enabled' ? 'high' : undefined,
      maxTokens: thinking === 'enabled' ? 4096 : 1024,
    });

    return NextResponse.json({ text, thinking });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Advisor chat failed' }, { status: 500 });
  }
}
