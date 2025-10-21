'use client';
import Link from 'next/link';
import { useState, Suspense } from 'react';
import PrivacyAndMethodology from './privacy-and-methodology';

function LandingPageContent() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRetrieve, setShowRetrieve] = useState(false);
  const [resultCode, setResultCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRetrieve = async () => {
    if (!resultCode.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Test if the result exists first
      const response = await fetch(`/api/who/${encodeURIComponent(resultCode.trim())}`);
      
      if (response.ok) {
        // Result found, navigate
        window.location.href = `/your-id?rid=${encodeURIComponent(resultCode.trim())}`;
      } else {
        // Show error message from server
        const data = await response.json();
        setError(data.message || 'Result not found. Please check your code and try again.');
        setLoading(false);
      }
    } catch (err) {
      setError('Unable to retrieve results. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white antialiased">
      {/* MENU BUTTON */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="fixed top-4 left-4 z-50 flex items-center justify-center h-12 px-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border-2 border-yellow-500/60 hover:border-yellow-400 transition-all backdrop-blur-sm shadow-lg hover:shadow-yellow-500/50"
        style={{
          boxShadow: '0 0 20px rgba(234, 179, 8, 0.4), 0 0 40px rgba(234, 179, 8, 0.2), 0 4px 16px rgba(0,0,0,0.3)'
        }}
        aria-label="Menu"
      >
        <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {menuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
        <span className="ml-2 text-sm font-semibold text-yellow-200">Menu</span>
      </button>

      {/* MENU OVERLAY */}
      {menuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 h-full w-80 bg-[#0f1419] border-r border-yellow-500/20 z-50 shadow-2xl" style={{
            boxShadow: '0 0 40px rgba(234, 179, 8, 0.15), 4px 0 20px rgba(0,0,0,0.5)'
          }}>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6 text-yellow-300">Menu</h2>
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    setShowRetrieve(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-amber-600/20 hover:from-yellow-500/30 hover:to-amber-600/30 border-2 border-yellow-500/50 hover:border-yellow-400/70 transition-all shadow-lg"
                  style={{
                    boxShadow: '0 0 15px rgba(234, 179, 8, 0.3), 0 4px 10px rgba(0,0,0,0.2)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-yellow-100 font-semibold">Retrieve Results</span>
                  </div>
                </button>
                <Link
                  href="/full"
                  className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-white/90">Start Assessment</span>
                  </div>
                </Link>
                <a
                  href="#how"
                  className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white/90">How It Works</span>
                  </div>
                </a>
                <a
                  href="#privacy"
                  className="block w-full text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                  onClick={() => setMenuOpen(false)}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-white/90">Privacy & Methodology</span>
                  </div>
                </a>
              </nav>
            </div>
          </div>
        </>
      )}

      {/* RETRIEVE RESULTS MODAL */}
      {showRetrieve && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={() => setShowRetrieve(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 p-4">
            <div className="bg-gradient-to-br from-[#1a1510] to-[#0f1419] border-2 border-yellow-500/40 rounded-2xl shadow-2xl p-6 relative overflow-hidden" style={{
              boxShadow: '0 0 40px rgba(234, 179, 8, 0.3), 0 0 80px rgba(234, 179, 8, 0.15), 0 10px 40px rgba(0,0,0,0.5)'
            }}>
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-amber-500/10 to-yellow-500/5 animate-pulse pointer-events-none" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-yellow-300 flex items-center gap-2">
                    <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Retrieve Your Results
                  </h2>
                  <button
                    onClick={() => setShowRetrieve(false)}
                    className="text-yellow-300/60 hover:text-yellow-300 transition"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-yellow-100/70 mb-4">
                  Enter your result code to view your saved assessment results. You received this code after completing your assessment.
                </p>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={resultCode}
                    onChange={(e) => {
                      setResultCode(e.target.value);
                      setError(''); // Clear error when typing
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleRetrieve()}
                    placeholder="Paste your result code here..."
                    disabled={loading}
                    className="w-full px-4 py-3 bg-black/60 border-2 border-yellow-500/30 rounded-xl text-yellow-100 placeholder-yellow-300/30 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30 font-mono text-sm shadow-inner disabled:opacity-50"
                    style={{
                      boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3), 0 0 10px rgba(234, 179, 8, 0.1)'
                    }}
                  />
                  
                  {error && (
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                      <p className="text-sm text-red-300">{error}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleRetrieve}
                    disabled={!resultCode.trim() || loading}
                    className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 disabled:from-gray-700 disabled:to-gray-800 disabled:text-white/40 disabled:cursor-not-allowed rounded-xl font-bold transition-all text-black shadow-lg"
                    style={{
                      boxShadow: (resultCode.trim() && !loading)
                        ? '0 0 20px rgba(234, 179, 8, 0.5), 0 4px 15px rgba(0,0,0,0.3)' 
                        : 'none'
                    }}
                  >
                    {loading ? 'Retrieving...' : 'View Results'}
                  </button>
                </div>
                <div className="mt-4 pt-4 border-t border-yellow-500/20">
                  <p className="text-xs text-yellow-100/50">
                    Don't have a result code yet?{' '}
                    <Link href="/full" className="text-yellow-400 hover:text-yellow-300 font-semibold">
                      Take the assessment
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-300/5 to-transparent pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-8 pb-12 sm:px-6 sm:pt-16 sm:pb-20 lg:px-8 lg:pt-20">
          {/* Owl Image */}
          <div className="flex justify-center mb-8 relative">
            {/* Glowing background effect */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full blur-xl" style={{
                background: 'radial-gradient(circle, rgba(251, 191, 36, 0.36) 0%, rgba(245, 158, 11, 0.24) 50%, transparent 100%)'
              }}></div>
            </div>
            <img 
              src="/the-axis.png" 
              alt="The Axis" 
              className="h-32 w-32 sm:h-40 sm:w-40 object-contain relative z-10"
            />
          </div>
          <div className="flex flex-col items-center text-center">
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Ground Zero — Your Deterministic Identity Blueprint
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-yellow-200/90 px-2 font-medium">
              Ground Zero is not just a test—it's an identity engine. By blending psychology, determinism, and design, it delivers a reproducible way to see who you are, how you operate, and what tensions shape your life. With its dual-results approach, it offers both traditional psychometric clarity and practical identity blueprints.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Link href="/full" className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-3 text-base font-semibold text-black shadow-lg shadow-yellow-500/20 transition hover:from-yellow-400 hover:to-amber-500 w-full sm:w-auto">
                Start assessment
                <svg className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </Link>
              <a href="#how" className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-base font-semibold text-white hover:bg-white/10 w-full sm:w-auto">
                How it works
              </a>
            </div>
            {/* proof strip */}
            <div className="mt-8 sm:mt-12 grid w-full max-w-3xl grid-cols-3 gap-2 sm:gap-3 text-center text-sm text-white/70 px-2">
              {[
                {k: 'Runs this week', v: '1,514+'},
                {k: 'Reproducible', v: '100%'},
                {k: 'Archetypes', v: '12'},
              ].map((x) => (
                <div key={x.k} className="rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4">
                  <div className="text-base sm:text-lg font-semibold text-white">{x.v}</div>
                  <div className="mt-1 text-[10px] sm:text-xs text-white/60">{x.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="text-center">
          <h3 className="text-lg sm:text-xl font-semibold text-white/90">How It Works</h3>
          <div className="mx-auto mt-4 sm:mt-6 grid max-w-4xl gap-4 sm:gap-6 md:grid-cols-3 px-2">
            {[
              {n:'1. Input', d:'Take our 7-minute dynamic assessment, designed to measure your core behavioral patterns.'},
              {n:'2. Analysis', d:'Our system analyzes your responses across 30+ vectors to build your unique operational model.'},
              {n:'3. Output', d:'Receive your living blueprint—a detailed, actionable guide to your internal world.'},
            ].map((s) => (
              <div key={s.n} className="rounded-xl border border-white/10 bg-white/5 p-4 sm:p-5">
                <div className="text-sm font-semibold text-indigo-300">{s.n}</div>
                <p className="mt-2 text-xs sm:text-sm text-white/70">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS SNEAK PEEK */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="text-center px-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Your Personalized Identity Blueprint</h2>
          <p className="mx-auto mt-2 max-w-2xl text-xs sm:text-sm text-white/70">Get specific, actionable insights into the core tensions that drive your behavior.</p>
        </div>
        <div className="mx-auto mt-6 sm:mt-8 max-w-3xl rounded-xl sm:rounded-2xl border border-yellow-500/30 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 p-4 sm:p-6 shadow-xl">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-200">Conflict Pattern: Autonomy vs. Belonging</h3>
          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-white/80">
            You value <strong>independence and self-direction</strong> (Low Agreeableness, High Openness), yet you also crave 
            <strong> structure and reliable support</strong> (High Conscientiousness). This creates friction: you resist being managed, 
            but you need clear goals to perform at your best.
          </p>
          <div className="mt-3 sm:mt-4 rounded-lg border border-white/10 bg-black/20 p-3 sm:p-4">
            <p className="text-xs font-medium text-white/60">How can both be true?</p>
            <p className="mt-2 text-xs sm:text-sm text-white/90">
              You're wired for autonomy <em>within</em> a framework. You don't want a micromanager—you want a clear mission, 
              then freedom to execute. In relationships, you need partners who respect your space but show up consistently.
            </p>
          </div>
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs text-white/60">
            <span className="rounded-full bg-green-500/20 px-2 py-1 text-green-300">✓ Real insight from your results</span>
          </div>
        </div>
      </section>

      {/* ARCHETYPE PREVIEW */}
      <section id="archetypes" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 px-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Twelve archetypes, one clear mirror</h2>
          <a href="/full" className="text-xs sm:text-sm text-indigo-300 hover:text-indigo-200">Take the assessment →</a>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {["Sovereign","Rebel","Visionary","Guardian","Navigator","Seeker","Vessel","Partner","Diplomat","Spotlight","Architect","Provider"].map((name) => (
            <div key={name} className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4 hover:bg-white/10 transition">
              <div className="flex h-28 sm:h-32 flex-col items-center justify-center gap-1.5 sm:gap-2">
                <img src={`/${name.toLowerCase()}.png`} alt={name} className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
                <div className="text-[10px] sm:text-xs font-medium text-white/80 text-center">{name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {t: 'Deterministic & transparent', d: 'Reproducible results with visible rules and a hash receipt.'},
            {t: 'Operational playbook', d: 'Daily actions, cycles, guardrails and stress moves tailored to you.'},
            {t: 'Existential circuits', d: 'Energy, Structure, Clarity, Bond and more — with risks and moves.'},
            {t: 'Conflict patterns', d: 'Identify friction points with practical tips to navigate tension and align teams.'},
          ].map((f) => (
            <div key={f.t} className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-xs sm:text-sm text-white/70">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h2 className="text-center text-xl sm:text-2xl font-semibold px-2">What Our Users Are Discovering</h2>
        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 md:grid-cols-3">
          {[
            {q:"I've done every personality test out there. This was the first one that gave me an actual playbook for my stress. Game-changing.", a:'Alex D.'},
            {q:"The 'Conflict Patterns' section was shockingly accurate. It felt like it read my mind and explained a tension I've felt for years but couldn't put into words.", a:'Sarah P.'},
            {q:"Finally, a system that doesn't just put you in a box. It shows you how all your different parts work together. It's like a user manual for your own brain.", a:'Michael R.'},
          ].map((t, i) => (
            <div key={i} className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <p className="text-xs sm:text-sm italic text-white/80">"{t.q}"</p>
              <p className="mt-3 sm:mt-4 text-xs font-medium text-indigo-300">— {t.a}</p>
            </div>
          ))}
        </div>
      </section>


      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h2 className="text-xl sm:text-2xl font-semibold px-2">FAQ</h2>
        <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 md:grid-cols-2">
          {[{
            q:'Is this randomized?',
            a:'No. Scores and archetypes are computed via explicit domain + facet rules. Every run is reproducible.'
          },{
            q:'Can I verify my result?',
            a:'Yes. Each run outputs a verification hash you can store or share.'
          },{
            q:'How long does it take?',
            a:'About 5–7 minutes for the core assessment.'
          },{
            q:'What if my scores are close?',
            a:'The mini tie‑breaker asks a few preference matchups to confirm your best fit.'
          }].map((f) => (
            <div key={f.q} className="rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <div className="text-sm sm:text-base font-medium">{f.q}</div>
              <p className="mt-2 text-xs sm:text-sm text-white/70">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20 lg:px-8">
        <div className="flex justify-center">
          <Link href="/full" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-3 text-sm sm:text-base text-black shadow-lg shadow-yellow-500/20 transition hover:from-yellow-400 hover:to-amber-500 w-full sm:w-auto">
            Start assessment
          </Link>
        </div>
      </section>

      <PrivacyAndMethodology />

      <footer className="border-t border-white/10 py-8 sm:py-10 text-center text-xs text-white/60 px-4">
        © {new Date().getFullYear()} Ground Zero. Deterministic Identity Engine.
      </footer>
    </main>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
