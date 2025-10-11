export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0b0f17] text-white antialiased">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/20 via-violet-500/10 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 pt-24 pb-20 lg:px-8 lg:pt-28">
          <div className="flex flex-col items-center text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Deterministic · Audit‑Ready · Big Five
            </span>
            <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Ground Zero — Your Deterministic Identity Blueprint
            </h1>
            <p className="mt-5 max-w-2xl text-white/70">
              A transparent Big Five assessment that turns your signals into an archetype, an operating playbook, and
              existential circuits. No randomness. No hidden weights. Hash‑verified.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <a href="/full" className="group inline-flex items-center rounded-2xl bg-indigo-500 px-5 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400">
                Start assessment
                <svg className="ml-2 h-4 w-4 transition group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 5l7 7-7 7"/>
                </svg>
              </a>
              <a href="#how" className="inline-flex items-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-base font-semibold text-white hover:bg-white/10">
                How it works
              </a>
            </div>
            {/* proof strip */}
            <div className="mt-12 grid w-full max-w-3xl grid-cols-3 gap-3 text-center text-sm text-white/70">
              {[
                {k: 'Runs this week', v: '1,514+'},
                {k: 'Reproducible', v: '100%'},
                {k: 'Archetypes', v: '12'},
              ].map((x) => (
                <div key={x.k} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="text-lg font-semibold text-white">{x.v}</div>
                  <div className="mt-1 text-xs text-white/60">{x.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {[
            {
              t: 'Phase 1 — Behaviors',
              d: '30 behavioral statements across OCEAN facets. Answer Yes or rate 1–5 (Very Inaccurate to Very Accurate). Deterministic scoring; no randomness.',
            },
            {
              t: 'Phase 2 — Archetype Resolver',
              d: 'Quick tie‑breaker matchups (e.g., Guardian vs Navigator) to confirm your best‑fit archetype from rule‑based candidates.',
            },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.03] p-6 shadow-lg shadow-black/20">
              <h3 className="text-lg font-semibold">{c.t}</h3>
              <p className="mt-2 text-sm text-white/70">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ARCHETYPE PREVIEW */}
      <section id="archetypes" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Twelve archetypes, one clear mirror</h2>
          <a href="/full" className="text-sm text-indigo-300 hover:text-indigo-200">Take the assessment →</a>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {["Sovereign","Rebel","Visionary","Guardian","Navigator","Seeker","Vessel","Partner","Diplomat","Spotlight","Architect","Provider"].map((name) => (
            <div key={name} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition">
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <img src={`/${name.toLowerCase()}.png`} alt={name} className="h-20 w-20 object-contain" />
                <div className="text-xs font-medium text-white/80">{name}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE CARDS */}
      <section id="features" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {[
            {t: 'Deterministic & transparent', d: 'Reproducible results with visible rules and a hash receipt.'},
            {t: 'Operational playbook', d: 'Daily actions, cycles, guardrails and stress moves tailored to you.'},
            {t: 'Existential circuits', d: 'Energy, Structure, Clarity, Bond and more — with risks and moves.'},
            {t: 'Conflict patterns', d: 'Identify friction points with practical tips to navigate tension and align teams.'},
          ].map((f) => (
            <div key={f.t} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">{f.t}</h3>
              <p className="mt-2 text-sm text-white/70">{f.d}</p>
            </div>
          ))}
        </div>
      </section>


      {/* PRICING */}
      <section id="pricing" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <h2 className="text-center text-2xl font-semibold">Simple, honest pricing</h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-white/70">Start free. Unlock deeper guidance or comparisons when you’re ready.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {n:'Core Assessment', p:'Free', b:['30 items · OCEAN facets','Archetype + narrative','Hash verification'], c:'/full'},
            {n:'Override Premium', p:'$7', b:['Behavior change kit','Daily moves & cycles','Stress‑move library'], c:'#'},
            {n:'Compare Pack', p:'$1.50', b:['You vs Them (1 card)','Compatibility (2 cards)','Side‑by‑side OCEAN view'], c:'#'},
          ].map((x, i) => (
            <div key={x.n} className={`rounded-2xl border border-white/10 bg-white/5 p-6 ${i===1?'ring-2 ring-indigo-400/50':''}`}>
              <div className="flex items-baseline justify-between">
                <h3 className="text-lg font-semibold">{x.n}</h3>
                <div className="text-xl font-semibold">{x.p}</div>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                {x.b.map((l)=> <li key={l}>• {l}</li>)}
              </ul>
              <a href={x.c} className="mt-6 inline-flex rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15">{i===0?'Start free':'Get it'}</a>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <h2 className="text-2xl font-semibold">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
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
            <div key={f.q} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="font-medium">{f.q}</div>
              <p className="mt-2 text-sm text-white/70">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-indigo-600/20 via-violet-600/20 to-sky-500/20 p-8">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-emerald-500/10 blur-2xl" />
          <div className="relative">
            <h3 className="text-2xl font-semibold">Start your deterministic run</h3>
            <p className="mt-2 max-w-2xl text-sm text-white/80">Take the free assessment and unlock a clear operating playbook you can use today.</p>
            <div className="mt-5">
              <a href="/full" className="inline-flex items-center rounded-2xl bg-indigo-500 px-5 py-3 text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400">
                Start full assessment
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10 text-center text-xs text-white/60">
        © {new Date().getFullYear()} Ground Zero. Deterministic Identity Engine.
      </footer>
    </main>
  );
}
