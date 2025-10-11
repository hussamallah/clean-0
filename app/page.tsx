import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0b0f17] text-white antialiased">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 via-violet-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8 lg:pt-28">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Deterministic · Audit‑Ready · Big Five
            </span>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Ground Zero — Your Deterministic Identity Blueprint
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-base text-white/70 px-2">
              A transparent Big Five assessment that turns your signals into an archetype, an operating playbook, and
              existential circuits. No randomness. No hidden weights. Hash‑verified.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
              <Link href="/full" className="group inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 w-full sm:w-auto">
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

      {/* PROBLEM / SOLUTION */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-6 sm:p-8 lg:p-12">
          <h2 className="text-center text-2xl sm:text-3xl font-semibold">Stop Guessing. Start Operating.</h2>
          <p className="mx-auto mt-3 sm:mt-4 max-w-3xl text-center text-sm sm:text-base text-white/80 px-2">
            Ever feel like you're fighting against yourself? Why is it so easy to start projects but so hard to finish them? 
            Why do you thrive in chaos one day and burn out the next?
          </p>
          <div className="mx-auto mt-6 sm:mt-8 max-w-3xl rounded-xl sm:rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 sm:p-6">
            <p className="text-sm sm:text-base text-white/90">
              Ground Zero goes beyond generic labels to give you a <strong className="text-white">high-fidelity map of your mind</strong>. 
              We pinpoint your unique tensions, reveal your operational strengths, and give you a practical playbook to navigate your life with intention.
            </p>
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

      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <h2 className="text-center text-xl sm:text-2xl font-semibold px-2">Simple, honest pricing</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-xs sm:text-sm text-white/70 px-2">Start free. Unlock deeper guidance or comparisons when you're ready.</p>
        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {n:'Core Assessment', p:'Free', b:['30 items · OCEAN facets','Archetype + narrative','Hash verification'], c:'/full'},
            {n:'Override Premium', p:'$7', b:['Behavior change kit','Daily moves & cycles','Stress‑move library'], c:'#'},
            {n:'Compare Pack', p:'$1.50', b:['You vs Them (1 card)','Compatibility (2 cards)','Side‑by‑side OCEAN view'], c:'#'},
          ].map((x, i) => (
            <div key={x.n} className={`rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 ${i===1?'ring-2 ring-indigo-400/50':''}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-base sm:text-lg font-semibold">{x.n}</h3>
                <div className="text-lg sm:text-xl font-semibold">{x.p}</div>
              </div>
              <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-white/70">
                {x.b.map((l)=> <li key={l}>• {l}</li>)}
              </ul>
              <a href={x.c} className="mt-4 sm:mt-6 inline-flex rounded-xl bg-white/10 px-4 py-2 text-xs sm:text-sm font-medium hover:bg-white/15">{i===0?'Start free':'Get it'}</a>
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
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-sky-500/20 p-6 sm:p-8">
          <div className="absolute -inset-1 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-2xl" />
          <div className="relative">
            <h3 className="text-xl sm:text-2xl font-semibold">Start your deterministic run</h3>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm text-white/80">Take the free assessment and unlock a clear operating playbook you can use today.</p>
            <div className="mt-4 sm:mt-5">
              <Link href="/full" className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-5 py-3 text-sm sm:text-base text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 w-full sm:w-auto">
                Start assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 sm:py-10 text-center text-xs text-white/60 px-4">
        © {new Date().getFullYear()} Ground Zero. Deterministic Identity Engine.
      </footer>
    </main>
  );
}
