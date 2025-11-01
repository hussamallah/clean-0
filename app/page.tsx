'use client';
import Link from 'next/link';
import { Suspense } from 'react';

function LandingPageContent() {
  return (
    <main className="min-h-screen bg-black text-white antialiased">
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
              <Link href="/assessment" className="group inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-3 text-base font-semibold text-black shadow-lg shadow-yellow-500/20 transition hover:from-yellow-400 hover:to-amber-500 w-full sm:w-auto">
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

      {/* ARCHETYPE PREVIEW */}
      <section id="archetypes" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 px-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Twelve archetypes, one clear mirror</h2>
          <a href="/assessment" className="text-xs sm:text-sm text-indigo-300 hover:text-indigo-200">Take the assessment →</a>
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
          <Link href="/assessment" className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-600 px-5 py-3 text-sm sm:text-base text-black shadow-lg shadow-yellow-500/20 transition hover:from-yellow-400 hover:to-amber-500 w-full sm:w-auto">
            Start assessment
          </Link>
        </div>
      </section>

      
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
