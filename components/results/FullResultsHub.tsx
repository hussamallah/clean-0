'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { type DomainKey } from '@/lib/bigfive/constants';
import archetypeRules from '@/arctyps rules.json';
import archetypeAtlas from '@/lib/data/archetype_atlas.json';
import OceanRadarChart from '@/components/results/OceanRadarChart';
import CompatibilityReportView from '@/components/results/CompatibilityReportView';
import ResultsExploreGrid from '@/components/results/ResultsExploreGrid';
import {
  ResultsShell,
  useActiveResultsSection,
} from '@/components/results/ResultsShell';
import { getSavedAnswerCode } from '@/lib/persistence';
import { encodeAnswerCode, isAnswerCode } from '@/lib/answerCode';
import { resolveProfileInput } from '@/lib/compatibility/resolveInput';
import { ADVISOR_META, type AdvisorId } from '@/lib/gemini/advisorContext';
import Link from 'next/link';

const ARCHETYPE_TAGLINES: Record<string, string> = {
  sovereign: 'Decisive authority establishing order from chaos.',
  rebel: 'Shattering fixed limits to create movement.',
  visionary: 'Sprinting toward horizons unseen by others.',
  navigator: 'Steering through fog via constant adaptation.',
  guardian: 'Shielding the vulnerable to preserve safety.',
  seeker: 'Piercing surface illusions to reveal truth.',
  architect: 'Designing enduring frameworks to prevent collapse.',
  spotlight: 'Commanding attention to fuel dynamic action.',
  diplomat: 'Bridging deep divides to secure harmony.',
  partner: 'Forging identity through deep loyal bonds.',
  provider: 'Deriving purpose from fulfilling others\' needs.',
  sentinel: 'Holding the line — vigilance as strategy.',
  vessel: 'Refining every detail to ensure excellence.',
};

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  return Promise.resolve();
}

async function resolveCodeToRid(input: string): Promise<string | null> {
  return resolveProfileInput(input);
}

type AiMode = 'who' | 'inner-war' | 'chat' | AdvisorId | null;

type ChatTurn = { role: 'user' | 'model'; text: string };

function chatStorageKey(mode: Exclude<AiMode, 'who' | 'inner-war' | null>, rid: string) {
  if (mode === 'chat') return `gz_ai_chat_${rid}`;
  if (mode === 'career-architect') return `gz_ai_career_${rid}`;
  return `gz_ai_pressure_${rid}`;
}

function botLabel(mode: Exclude<AiMode, 'who' | 'inner-war' | null>) {
  if (mode === 'chat') return 'Point Zero';
  return ADVISOR_META[mode].label;
}

export default function FullResultsHub({ rid }: { rid: string }) {
  const [loading, setLoading] = useState(true);
  const [whoData, setWhoData] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [answerCode, setAnswerCode] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<AiMode>(null);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatTurn[]>([]);
  const [knownFacts, setKnownFacts] = useState<string[]>([]);
  const [compatB, setCompatB] = useState('');
  const [compatData, setCompatData] = useState<any>(null);
  const [compatLoading, setCompatLoading] = useState(false);
  const [compatError, setCompatError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const archetype = useMemo(() => {
    const archName =
      whoData?.archetype ||
      results.find((r) => r.domain === 'ARCH')?.payload?.winner ||
      '';
    const id = String(archName).toLowerCase();
    const match = (archetypeRules as any).archetypes.find(
      (a: any) => String(a.id).toLowerCase() === id,
    );
    const atlasKey = archName
      ? String(archName).charAt(0).toUpperCase() + String(archName).slice(1).toLowerCase()
      : '';
    const atlas = (archetypeAtlas as any)[atlasKey] || (archetypeAtlas as any).Vessel;
    return {
      id,
      title: match?.gz || archName || 'Unknown',
      color: match?.color?.hex || '#fbbf24',
      icon: id ? `/${id}.png` : '/sovereign.png',
      tagline: ARCHETYPE_TAGLINES[id] || 'Archetype identified.',
      atlas,
    };
  }, [whoData, results]);

  const domainMeans = useMemo(() => {
    const means = whoData?.derived?.domainMeans;
    if (means) return means as Record<DomainKey, number>;
    const out: Record<DomainKey, number> = { O: 3, C: 3, E: 3, A: 3, N: 3 };
    for (const r of results) {
      if (['O', 'C', 'E', 'A', 'N'].includes(r.domain)) {
        out[r.domain as DomainKey] = r.payload?.final?.domain_mean_raw ?? 3;
      }
    }
    return out;
  }, [whoData, results]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/who/${rid}`, { cache: 'no-store' });
        const data = await res.json();
        setWhoData(data?.who ?? null);
        const loaded = Array.isArray(data?.results) ? data.results : [];
        setResults(loaded);
        const savedCode = getSavedAnswerCode();
        if (savedCode) setAnswerCode(savedCode);
        else if (loaded.length) setAnswerCode(encodeAnswerCode(loaded));
      } finally {
        setLoading(false);
      }
    })();
    setAnswerCode(getSavedAnswerCode());
    try {
      const storedFacts = localStorage.getItem(`gz_known_facts_${rid}`);
      if (storedFacts) setKnownFacts(JSON.parse(storedFacts));
    } catch {
      /* ignore */
    }
  }, [rid]);

  const handleCopy = async (label: string, value: string) => {
    await copyText(value);
    setCopyState(label);
    setTimeout(() => setCopyState(null), 2000);
  };

  const loadAiInsight = useCallback(
    async (mode: 'who' | 'inner-war') => {
      setAiMode(mode);
      setAiLoading(true);
      setAiError(null);
      setAiText('');
      const cacheKey = `gz_ai_${mode}_${rid}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          setAiText(cached);
          setAiLoading(false);
          return;
        }
      } catch {
        /* ignore */
      }
      try {
        const res = await fetch(`/api/ai/${mode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rid }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'AI request failed');
        setAiText(data.text);
        try {
          localStorage.setItem(cacheKey, data.text);
        } catch {
          /* ignore */
        }
      } catch (e: any) {
        setAiError(e?.message || 'AI unavailable');
      } finally {
        setAiLoading(false);
      }
    },
    [rid],
  );

  const persistKnownFacts = (facts: string[]) => {
    setKnownFacts(facts);
    try {
      localStorage.setItem(`gz_known_facts_${rid}`, JSON.stringify(facts));
    } catch {
      /* ignore */
    }
  };

  const loadChatHistory = (mode: Exclude<AiMode, 'who' | 'inner-war' | null>) => {
    try {
      const raw = localStorage.getItem(chatStorageKey(mode, rid));
      if (raw) return JSON.parse(raw) as ChatTurn[];
    } catch {
      /* ignore */
    }
    return [];
  };

  const saveChatHistory = (mode: Exclude<AiMode, 'who' | 'inner-war' | null>, history: ChatTurn[]) => {
    try {
      localStorage.setItem(chatStorageKey(mode, rid), JSON.stringify(history));
    } catch {
      /* ignore */
    }
  };

  const sendBotMessage = async (
    mode: Exclude<AiMode, 'who' | 'inner-war' | null>,
    rawMessage?: string,
    historyOverride?: ChatTurn[],
  ) => {
    const isSessionStart = rawMessage === '[SESSION_START]';
    const userMsg = isSessionStart ? '' : (rawMessage ?? chatInput).trim();
    if (!isSessionStart && !userMsg) return;

    const priorHistory = historyOverride ?? chatHistory;
    const apiHistory = isSessionStart ? [] : priorHistory;
    const apiMessage = isSessionStart ? '[SESSION_START]' : userMsg;
    const nextHistory = isSessionStart ? priorHistory : [...priorHistory, { role: 'user' as const, text: userMsg }];

    if (!isSessionStart) setChatInput('');
    setAiLoading(true);
    setAiError(null);

    try {
      const isAdvisor = mode === 'career-architect' || mode === 'pressure-profile';
      const endpoint = isAdvisor ? '/api/ai/advisor' : '/api/ai/chat';
      const body = isAdvisor
        ? {
            rid,
            advisor: mode,
            message: apiMessage,
            history: apiHistory,
            knownFacts,
          }
        : {
            rid,
            message: userMsg,
            history: apiHistory,
          };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Chat failed');

      const updatedHistory: ChatTurn[] = [...nextHistory, { role: 'model', text: data.text }];
      setChatHistory(updatedHistory);
      saveChatHistory(mode, updatedHistory);

      if (!isSessionStart && isAdvisor) {
        const label = ADVISOR_META[mode].label;
        const nextFacts = [...knownFacts, `${label}: ${userMsg}`];
        persistKnownFacts(nextFacts);
      }
    } catch (e: any) {
      setAiError(e?.message || 'Chat unavailable');
    } finally {
      setAiLoading(false);
    }
  };

  const openChatBot = async (mode: Exclude<AiMode, 'who' | 'inner-war' | null>) => {
    setAiMode(mode);
    setAiError(null);
    setAiText('');
    setChatInput('');
    const history = loadChatHistory(mode);
    setChatHistory(history);
    if (history.length === 0) {
      await sendBotMessage(mode, '[SESSION_START]', []);
    }
  };

  const sendChat = () => {
    if (!aiMode || aiMode === 'who' || aiMode === 'inner-war') return;
    void sendBotMessage(aiMode);
  };

  useEffect(() => {
    if (!aiMode || aiMode === 'who' || aiMode === 'inner-war') return;
    const history = loadChatHistory(aiMode);
    setChatHistory(history);
  }, [aiMode, rid]);

  const runCompatibility = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompatLoading(true);
    setCompatError(null);
    setCompatData(null);
    try {
      if (!isAnswerCode(compatB)) {
        throw new Error('Paste a valid Answer Code to compare your profiles.');
      }
      const ridB = await resolveCodeToRid(compatB);
      if (!ridB) throw new Error('That Answer Code could not be loaded.');
      const res = await fetch(`/api/compatibility?ridA=${encodeURIComponent(rid)}&ridB=${encodeURIComponent(ridB)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Compatibility failed');
      setCompatData(data);
    } catch (e: any) {
      setCompatError(e?.message || 'Compatibility failed');
    } finally {
      setCompatLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    setPdfLoading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        backgroundColor: '#F7F5F2',
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`point_zero_${rid}.pdf`);
    } catch {
      setAiError('PDF export failed');
    } finally {
      setPdfLoading(false);
    }
  };

  const activeSection = useActiveResultsSection();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-ink">
        <p className="text-sm text-ink-muted">Loading your results…</p>
      </div>
    );
  }

  return (
    <ResultsShell rid={rid} archetypeTitle={archetype.title} activeSection={activeSection}>
      <main ref={reportRef} className="mx-auto max-w-4xl space-y-12 px-4 py-10 sm:px-6 sm:py-12">
        {/* Overview */}
        <section id="overview" className="scroll-mt-28 text-center">
          <div className="relative mx-auto mb-5 h-28 w-28 sm:h-32 sm:w-32">
            <Image
              src={archetype.icon}
              alt={archetype.title}
              fill
              className="object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {archetype.title}
          </h1>
          <p className="mt-2 text-sm font-medium text-brand-deep sm:text-base">{archetype.tagline}</p>
          {archetype.atlas?.psychologicalProfile ? (
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
              {String(archetype.atlas.psychologicalProfile).split(/(?<=\.)\s+/)[0]}
            </p>
          ) : null}
        </section>

        {/* Traits snapshot */}
        <section id="traits" className="scroll-mt-28 space-y-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">Traits</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Your OCEAN profile</h2>
          </div>
          <div className="rounded-panel border border-line bg-surface p-6 shadow-soft">
            <OceanRadarChart domainMeans={domainMeans} />
          </div>
          <Link
            href={`/results?rid=${encodeURIComponent(rid)}`}
            className="inline-flex text-sm font-semibold text-brand-deep hover:underline"
          >
            Open full facet details →
          </Link>
        </section>

        <ResultsExploreGrid rid={rid} />

        {/* AI Insights */}
        <section id="insights" className="scroll-mt-28 space-y-8">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">Insights</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">AI insights</h2>
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              Instant profile reads and guided advisor sessions — grounded in your scores and archetype.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-semibold text-ink">Profile reads</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => loadAiInsight('who')}
                className={`flex min-h-[160px] flex-col rounded-panel border p-5 text-left shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  aiMode === 'who' ? 'border-brand bg-brand/10' : 'border-line bg-surface'
                }`}
              >
                <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">Instant</span>
                <h4 className="mt-auto pt-6 font-display text-xl font-semibold text-ink">Who you are</h4>
                <p className="mt-2 text-sm text-ink-muted">
                  How you show up by default — work, relationships, and pressure.
                </p>
                <span className="mt-3 text-sm font-semibold text-brand-deep">Generate read →</span>
              </button>
              <button
                type="button"
                onClick={() => loadAiInsight('inner-war')}
                className={`flex min-h-[160px] flex-col rounded-panel border p-5 text-left shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  aiMode === 'inner-war' ? 'border-ocean-N bg-red-50' : 'border-line bg-surface'
                }`}
              >
                <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">Instant</span>
                <h4 className="mt-auto pt-6 font-display text-xl font-semibold text-ink">Inner war</h4>
                <p className="mt-2 text-sm text-ink-muted">
                  Competing drives, the daily cost, and one reframe you can use.
                </p>
                <span className="mt-3 text-sm font-semibold text-brand-deep">Generate read →</span>
              </button>
            </div>

            {aiError && (aiMode === 'who' || aiMode === 'inner-war') ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{aiError}</p>
            ) : null}
            {aiLoading && (aiMode === 'who' || aiMode === 'inner-war') ? (
              <p className="text-sm text-ink-muted animate-pulse">Writing your profile…</p>
            ) : null}
            {aiMode && (aiMode === 'who' || aiMode === 'inner-war') && aiText ? (
              <div className="rounded-panel border border-line bg-surface p-5 text-sm leading-relaxed text-ink whitespace-pre-wrap shadow-soft">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-soft">
                  {aiMode === 'who' ? 'Who you are' : 'Inner war'}
                </p>
                {aiText}
              </div>
            ) : null}
          </div>

          <div className="space-y-4 border-t border-line pt-8">
            <h3 className="text-base font-semibold text-ink">AI advisors</h3>
            <p className="text-sm text-ink-muted">Answer a few questions. Get a report tied to your profile.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => openChatBot('career-architect')}
                className={`flex min-h-[160px] flex-col rounded-panel border p-5 text-left shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  aiMode === 'career-architect' ? 'border-emerald-500 bg-emerald-50' : 'border-line bg-surface'
                }`}
              >
                <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">Chat</span>
                <h4 className="mt-auto pt-6 font-display text-xl font-semibold text-ink">Career Architect</h4>
                <p className="mt-2 text-sm text-ink-muted">
                  Ranked role fits and environments to avoid — tied to your traits.
                </p>
                <span className="mt-3 text-sm font-semibold text-brand-deep">Start session →</span>
              </button>
              <button
                type="button"
                onClick={() => openChatBot('pressure-profile')}
                className={`flex min-h-[160px] flex-col rounded-panel border p-5 text-left shadow-soft transition hover:shadow-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                  aiMode === 'pressure-profile' ? 'border-orange-400 bg-orange-50' : 'border-line bg-surface'
                }`}
              >
                <span className="text-xs font-medium uppercase tracking-wider text-ink-soft">Chat</span>
                <h4 className="mt-auto pt-6 font-display text-xl font-semibold text-ink">Pressure Profile</h4>
                <p className="mt-2 text-sm text-ink-muted">
                  Stress patterns, early warning signs, and coping that fits you.
                </p>
                <span className="mt-3 text-sm font-semibold text-brand-deep">Start session →</span>
              </button>
            </div>

            {aiError && (aiMode === 'career-architect' || aiMode === 'pressure-profile') ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{aiError}</p>
            ) : null}
            {aiLoading && (aiMode === 'career-architect' || aiMode === 'pressure-profile') && chatHistory.length === 0 ? (
              <p className="text-sm text-ink-muted animate-pulse">Opening advisor…</p>
            ) : null}
            {aiMode && (aiMode === 'career-architect' || aiMode === 'pressure-profile') ? (
              <div className="overflow-hidden rounded-panel border border-line bg-surface shadow-soft">
                <div className="flex items-center justify-between gap-2 border-b border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{botLabel(aiMode)}</p>
                    <p className="text-xs text-ink-muted">{ADVISOR_META[aiMode].tagline}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      saveChatHistory(aiMode, []);
                      setChatHistory([]);
                      void sendBotMessage(aiMode, '[SESSION_START]', []);
                    }}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-muted hover:text-ink"
                  >
                    Restart
                  </button>
                </div>
                <div className="max-h-72 space-y-3 overflow-y-auto p-4">
                  {chatHistory.length === 0 && !aiLoading ? (
                    <p className="text-sm text-ink-muted">Starting advisor session…</p>
                  ) : null}
                  {chatHistory.map((m, i) => (
                    <div
                      key={i}
                      className={`rounded-xl px-3.5 py-2.5 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'ml-6 border border-brand/20 bg-brand/10 text-ink'
                          : 'mr-6 border border-line bg-surface-muted text-ink'
                      }`}
                    >
                      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-ink-soft">
                        {m.role === 'user' ? 'You' : botLabel(aiMode)}
                      </p>
                      {m.text}
                    </div>
                  ))}
                  {aiLoading && chatHistory.length > 0 ? (
                    <p className="text-sm text-ink-muted animate-pulse">Thinking…</p>
                  ) : null}
                </div>
                <div className="flex gap-2 border-t border-line p-3">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Type your answer…"
                    className="flex-1 rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={sendChat}
                    disabled={aiLoading || !chatInput.trim()}
                    className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white disabled:opacity-40 hover:bg-brand-deep"
                  >
                    Send
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* Compatibility */}
          <div className="rounded-panel border border-line bg-surface p-6 shadow-soft space-y-5 sm:p-8">
            <div>
              <h3 className="font-display text-xl font-semibold text-ink">Compatibility</h3>
              <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                Paste someone&apos;s Answer Code to compare profiles — alignment, friction, and how to work together.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: 'Natural fit', desc: 'Shared strengths & easy rapport' },
                { label: 'Friction zones', desc: 'Where personalities may clash' },
                { label: 'Playbook', desc: 'How to communicate & collaborate' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-line bg-canvas px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-ink">{item.label}</p>
                  <p className="mt-1 text-sm text-ink-muted">{item.desc}</p>
                </div>
              ))}
            </div>
            <form onSubmit={runCompatibility} className="space-y-2">
              <label htmlFor="compat-answer-code" className="block text-sm font-medium text-ink">
                Their Answer Code
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  id="compat-answer-code"
                  value={compatB}
                  onChange={(e) => setCompatB(e.target.value)}
                  placeholder="Paste their Answer Code"
                  aria-label="Partner Answer Code"
                  className="flex-1 rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button
                  type="submit"
                  disabled={compatLoading || !compatB.trim()}
                  className="rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-40"
                >
                  {compatLoading ? 'Comparing…' : 'Compare'}
                </button>
              </div>
              <p className="text-xs text-ink-soft">Answer Code only — not Run ID.</p>
            </form>
            {compatError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{compatError}</p>
            ) : null}
            {compatData ? (
              <div className="rounded-xl border border-line bg-canvas p-4">
                <CompatibilityReportView data={compatData} compact />
              </div>
            ) : null}
          </div>
        </section>

        {/* Share & export */}
        <section id="share" className="scroll-mt-28 space-y-5 rounded-panel border border-line bg-surface p-6 shadow-soft">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-ink-soft">Share</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-ink">Share & export</h2>
          </div>

          <div className="rounded-xl border border-line bg-canvas p-4 space-y-2">
            <div className="text-xs font-medium uppercase tracking-wider text-ink-soft">Run ID</div>
            <div className="break-all font-mono text-sm text-ink">{rid}</div>
            <p className="text-sm leading-relaxed text-ink-muted">
              Your private fingerprint for this session. Share your <strong className="text-ink">Answer Code</strong> when someone else needs to compare with you.
            </p>
          </div>

          {answerCode ? (
            <div className="space-y-3 rounded-xl border border-brand/30 bg-brand/5 p-5">
              <h3 className="font-display text-lg font-semibold text-ink">Answer Code</h3>
              <p className="text-sm text-ink-muted">
                The portable code others paste into Compatibility to compare with your profile.
              </p>
              <div className="max-h-24 overflow-y-auto rounded-xl border border-line bg-surface p-4 font-mono text-sm text-ink">
                {answerCode}
              </div>
              <button
                type="button"
                onClick={() => handleCopy('code', answerCode)}
                className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep"
              >
                {copyState === 'code' ? 'Copied!' : 'Copy Answer Code'}
              </button>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadPdf}
              disabled={pdfLoading}
              className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-deep disabled:opacity-50"
            >
              {pdfLoading ? 'Generating PDF…' : 'Download report PDF'}
            </button>
            <button
              type="button"
              onClick={() =>
                handleCopy(
                  'link',
                  `${typeof window !== 'undefined' ? window.location.origin : ''}/portal?rid=${rid}`,
                )
              }
              className="rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-muted"
            >
              {copyState === 'link' ? 'Link copied!' : 'Copy results link'}
            </button>
          </div>
        </section>

        <div className="pb-8 text-center">
          <a href="/assessment?restart=1" className="text-sm font-semibold text-brand-deep hover:underline">
            Retake assessment →
          </a>
        </div>
      </main>
    </ResultsShell>
  );
}
