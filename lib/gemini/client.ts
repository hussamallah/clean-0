import {
  DEEPSEEK_BASE_URL,
  DEEPSEEK_MODEL_FAST,
  DEEPSEEK_MODEL_THINK,
} from './config';

export type ChatRole = 'user' | 'model' | 'assistant' | 'system';

export type ChatTurn = {
  role: ChatRole;
  text: string;
};

export type ThinkingMode = 'enabled' | 'disabled';

export type GenerateOptions = {
  systemPrompt: string;
  userPrompt: string;
  history?: ChatTurn[];
  thinking?: ThinkingMode;
  reasoningEffort?: 'high' | 'max';
  maxTokens?: number;
  /** Override model; defaults by thinking mode */
  model?: string;
};

function toOpenAIRole(role: ChatRole): 'system' | 'user' | 'assistant' {
  if (role === 'system') return 'system';
  if (role === 'user') return 'user';
  return 'assistant';
}

function extractText(data: any): string {
  const message = data?.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === 'string' && content.trim()) return content.trim();
  if (Array.isArray(content)) {
    const joined = content
      .map((part: any) => (typeof part?.text === 'string' ? part.text : typeof part === 'string' ? part : ''))
      .join('')
      .trim();
    if (joined) return joined;
  }
  throw new Error('Empty DeepSeek response');
}

/**
 * DeepSeek OpenAI-compatible chat completions.
 * - thinking disabled → fast Q&A (v4-flash)
 * - thinking enabled → deep personalized reports (v4-pro, high effort)
 */
export async function generateDeepSeekText(
  apiKey: string,
  options: GenerateOptions,
): Promise<string> {
  const thinking: ThinkingMode = options.thinking ?? 'disabled';
  const model =
    options.model ||
    (thinking === 'enabled' ? DEEPSEEK_MODEL_THINK : DEEPSEEK_MODEL_FAST);

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: options.systemPrompt },
  ];

  for (const turn of options.history || []) {
    messages.push({
      role: toOpenAIRole(turn.role),
      content: turn.text,
    });
  }

  messages.push({ role: 'user', content: options.userPrompt });

  const body: Record<string, unknown> = {
    model,
    messages,
    stream: false,
    thinking: { type: thinking },
    max_tokens: options.maxTokens ?? (thinking === 'enabled' ? 4096 : 1024),
  };

  if (thinking === 'enabled') {
    body.reasoning_effort = options.reasoningEffort || 'high';
  }

  const url = `${DEEPSEEK_BASE_URL.replace(/\/$/, '')}/chat/completions`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `DeepSeek request failed (${res.status})`);
  }

  const data = await res.json();
  return extractText(data);
}

/** Compatibility wrappers used by existing routes */
export async function generateGeminiText(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  history: Array<{ role: 'user' | 'model'; text: string }> = [],
): Promise<string> {
  return generateDeepSeekText(apiKey, {
    systemPrompt,
    userPrompt,
    history,
    thinking: 'enabled',
    reasoningEffort: 'high',
  });
}

export async function generateGeminiChat(
  apiKey: string,
  systemPrompt: string,
  message: string,
  history: Array<{ role: 'user' | 'model'; text: string }> = [],
  maxOutputTokens = 2048,
  thinking: ThinkingMode = 'disabled',
): Promise<string> {
  return generateDeepSeekText(apiKey, {
    systemPrompt,
    userPrompt: message,
    history,
    thinking,
    reasoningEffort: thinking === 'enabled' ? 'high' : undefined,
    maxTokens: maxOutputTokens,
  });
}
