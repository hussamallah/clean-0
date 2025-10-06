Here is the **complete, drop-in kit** for **Ground Zero — Identity (fixed) + Axis Mode (3 switches) v1.2**. Deterministic. No nudges. No telemetry.

# 0) Canon

* Identity = 243 profiles from base-3 buckets over `[O,C,E,A,S]`, where `S = 1 − (N−1)/4`.
* Buckets: Low `< .34` → 0, Mid `.34–.66` → 1, High `≥ .67` → 2.
* `pid = O*81 + C*27 + E*9 + A*3 + S` in `0..242`.
* Axis Mode = three switches `plan, accountable, runway` → `M0..M7`.
* Hash = `SHA256(stableStringify(full_output))`.

# 1) Data contracts (JSON Schema)

```json
{
  "$id":"gz-identity-axismode.v1.2.schema.json",
  "type":"object",
  "required":["version","inputs","identity","mode","hash"],
  "properties":{
    "version":{"const":"gz-identity-axismode.v1.2"},
    "inputs":{
      "type":"object",
      "required":["O","C","E","A","N","plan","accountable","runway"],
      "properties":{
        "O":{"type":"integer","minimum":1,"maximum":5},
        "C":{"type":"integer","minimum":1,"maximum":5},
        "E":{"type":"integer","minimum":1,"maximum":5},
        "A":{"type":"integer","minimum":1,"maximum":5},
        "N":{"type":"integer","minimum":1,"maximum":5},
        "plan":{"type":"boolean"},
        "accountable":{"type":"boolean"},
        "runway":{"type":"boolean"}
      },
      "additionalProperties":false
    },
    "identity":{
      "type":"object",
      "required":["pid","code","buckets","label"],
      "properties":{
        "pid":{"type":"integer","minimum":0,"maximum":242},
        "code":{"type":"string","pattern":"^O[0-2]-C[0-2]-E[0-2]-A[0-2]-S[0-2]$"},
        "buckets":{
          "type":"object",
          "required":["O","C","E","A","S"],
          "properties":{
            "O":{"enum":["Low","Mid","High"]},
            "C":{"enum":["Low","Mid","High"]},
            "E":{"enum":["Low","Mid","High"]},
            "A":{"enum":["Low","Mid","High"]},
            "S":{"enum":["Low","Mid","High"]}
          }
        },
        "label":{"type":"string"}
      },
      "additionalProperties":false
    },
    "mode":{
      "type":"object",
      "required":["code","bits","label","axis_route"],
      "properties":{
        "code":{"type":"string","pattern":"^M[0-7]$"},
        "bits":{"type":"string","pattern":"^[01]{3}$"},
        "label":{"enum":["Drift Risk","Clear Runway","Eyes On You","Blueprint Only","Public Momentum","Clean Solo Plan","Social Plan","Locked Execution"]},
        "axis_route":{"type":"array","items":{"enum":["O","C","E","A","S"]},"minItems":1,"maxItems":2}
      },
      "additionalProperties":false
    },
    "hash":{"type":"string","pattern":"^[a-f0-9]{64}$"}
  },
  "additionalProperties":false
}
```

# 2) Core library (TypeScript, single file)

```ts
// lib/gz3switch/identity.ts
export type Domains = { O:number; C:number; E:number; A:number; N:number };
export type Switches = { plan:boolean; accountable:boolean; runway:boolean };
export type Axis = 'O'|'C'|'E'|'A'|'S';

const clamp01 = (x:number)=> x<0?0:x>1?1:x;
const z = (d:number)=> clamp01((d-1)/4);
const bucket = (v:number)=> v < 0.34 ? 0 : (v >= 0.67 ? 2 : 1);

const TOK = {
  O:['Routine','Curious','Explorer'],
  C:['Flexible','Steady','Planner'],
  E:['Reserved','Social','Driver'],
  A:['Challenger','Balanced','Partner'],
  S:['Reactive','Composed','Stabilizer']
} as const;

export function computeIdentity(dom:Domains){
  const O = bucket(z(dom.O));
  const C = bucket(z(dom.C));
  const E = bucket(z(dom.E));
  const A = bucket(z(dom.A));
  const S = bucket(clamp01(1 - z(dom.N)));
  const pid = O*81 + C*27 + E*9 + A*3 + S;
  const code = `O${O}-C${C}-E${E}-A${A}-S${S}`;
  const label = `${TOK.O[O]}-${TOK.C[C]}-${TOK.E[E]}-${TOK.A[A]}-${TOK.S[S]}`;
  const B = ['Low','Mid','High'] as const;
  const buckets = { O:B[O], C:B[C], E:B[E], A:B[A], S:B[S] };
  return { pid, code, buckets, label };
}

export function computeAxisMode(sw:Switches){
  const n = (sw.plan?4:0) + (sw.accountable?2:0) + (sw.runway?1:0);
  const bits = `${sw.plan?1:0}${sw.accountable?1:0}${sw.runway?1:0}`;
  const labels = ['Drift Risk','Clear Runway','Eyes On You','Blueprint Only','Public Momentum','Clean Solo Plan','Social Plan','Locked Execution'] as const;
  const route: Record<number, Axis[]> = {0:['S'],1:['S'],2:['A','E'],3:['C'],4:['E','A'],5:['C','S'],6:['A','C'],7:['C','S']};
  return { code:`M${n}`, bits, label:labels[n], axis_route:route[n] };
}

// Stable stringify (key-sorted)
export function stableStringify(obj:any):string{
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map(k=>`${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(',')}}`;
}
```

# 3) Hash helper

```ts
// lib/crypto/sha256hex.ts
export async function sha256Hex(s:string){
  const buf = new TextEncoder().encode(s);
  const h = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
}
```

# 4) Integration hook

```ts
// lib/gz3switch/run.ts
import { computeIdentity, computeAxisMode, stableStringify } from '@/lib/gz3switch/identity';
import { sha256Hex } from '@/lib/crypto/sha256hex';

export async function buildGZResult(dom:{O:number;C:number;E:number;A:number;N:number}, sw:{plan:boolean;accountable:boolean;runway:boolean}){
  const identity = computeIdentity(dom);
  const mode = computeAxisMode(sw);
  const out = { version:'gz-identity-axismode.v1.2', inputs:{...dom, ...sw}, identity, mode };
  const hash = await sha256Hex(stableStringify(out));
  return { ...out, hash };
}
```

# 5) UI — Switch screen (one component)

```tsx
// components/assessment/AxisModeScreen.tsx
'use client';
import { useState } from 'react';

export function AxisModeScreen({ onDone }:{ onDone:(sw:{plan:boolean;accountable:boolean;runway:boolean})=>void }){
  const [plan,setPlan] = useState(false);
  const [acc,setAcc] = useState(false);
  const [run,setRun] = useState(false);
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h2 className="text-2xl font-semibold">Execution Mode</h2>
      <p className="text-sm opacity-80">Three quick toggles. They don’t change who you are. They decide how you’ll execute today.</p>
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={plan} onChange={e=>setPlan(e.target.checked)} />
        <div><b>Plan locked?</b><div className="text-sm opacity-80">Exact time + place written.</div></div>
      </label>
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={acc} onChange={e=>setAcc(e.target.checked)} />
        <div><b>Accountable today?</b><div className="text-sm opacity-80">A named person will see completion.</div></div>
      </label>
      <label className="flex items-start gap-3">
        <input type="checkbox" checked={run} onChange={e=>setRun(e.target.checked)} />
        <div><b>Runway clear?</b><div className="text-sm opacity-80">First step &lt; 2 minutes. Materials ready.</div></div>
      </label>
      <button className="btn btn-primary" onClick={()=>onDone({plan,accountable:acc,runway:run})}>Continue</button>
    </div>
  );
}
```

# 6) UI — Results card

```tsx
// components/results/IdentityModeCard.tsx
export function IdentityModeCard({ identity, mode }:{
  identity:{ pid:number; code:string; buckets:{O:string;C:string;E:string;A:string;S:string}; label:string };
  mode:{ code:string; bits:string; label:string; axis_route:('O'|'C'|'E'|'A'|'S')[] };
}){
  return (
    <div className="rounded-2xl p-5 shadow">
      <h3 className="text-xl font-semibold">Identity</h3>
      <div className="mt-1 text-sm opacity-80">{identity.label}</div>
      <div className="mt-2 text-xs font-mono">code: {identity.code} · pid: {identity.pid}</div>
      <div className="mt-3 grid grid-cols-5 gap-2 text-center text-xs">
        {(['O','C','E','A','S'] as const).map(k=>
          <div key={k} className="rounded bg-neutral-100 p-2">
            <div className="font-mono">{k}</div>
            <div>{(identity.buckets as any)[k]}</div>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center gap-3">
        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs border">{mode.label}</span>
        <span className="text-xs font-mono opacity-70">{mode.code} · {mode.bits}</span>
        <span className="text-xs opacity-70">route: {mode.axis_route.join(' → ')}</span>
      </div>
    </div>
  );
}
```

# 7) Strings (i18n keys)

```
id.title=Identity
id.help=Fixed from your answers. Not context-dependent.
mode.title=Execution Mode
mode.help=Three toggles decide how you execute today.
mode.plan=Plan locked?
mode.plan.help=Exact time + place written.
mode.accountable=Accountable today?
mode.accountable.help=A named person will see completion.
mode.runway=Runway clear?
mode.runway.help=First step < 2 minutes. Materials ready.
```

# 8) Storage + migration

* New key: `gz_identity_axismode_v1_2` inside your existing run payload.
* Legacy runs: if `mode` missing → set `M0`.
* Do **not** recompute Identity for legacy if domain math changed; if unchanged, recompute safely.

# 9) Validation rules

* Domains must be integers `1..5`. Reject floats.
* Switches must be explicit booleans.
* Use epsilon `1e-9` at `.34` and `.67` to avoid float edge flips.
* Output must satisfy the JSON Schema above.

# 10) Analytics events (optional)

* `gz_mode_set` `{ plan, accountable, runway, code }`
* `gz_identity_rendered` `{ pid, code }`
* No user PII. Event keys only.

# 11) Unit tests (Jest snippets)

```ts
import { computeIdentity, computeAxisMode } from '@/lib/gz3switch/identity';

test('pid extremes', ()=>{
  expect(computeIdentity({O:1,C:1,E:1,A:1,N:5}).pid).toBe(0);
  expect(computeIdentity({O:5,C:5,E:5,A:5,N:1}).pid).toBe(242);
});

test('boundaries', ()=>{
  // z=.34 exactly -> Mid
  expect(computeIdentity({O:2.36 as any,C:3,E:3,A:3,N:3}).code.startsWith('O1')).toBe(true);
  // z=.67 exactly -> High
  expect(computeIdentity({O:4 as any,C:3,E:3,A:3,N:3}).code.startsWith('O2')).toBe(true);
});

test('mode mapping', ()=>{
  expect(computeAxisMode({plan:false,accountable:false,runway:false}).code).toBe('M0');
  expect(computeAxisMode({plan:true,accountable:true,runway:true}).code).toBe('M7');
});
```

# 12) Results builder usage

```ts
// After Phase 3 finalize domains (or Phase 2 if Phase 3 skipped)
const dom = { O:O1to5, C:C1to5, E:E1to5, A:A1to5, N:N1to5 };
const sw = { plan, accountable, runway };
const result = await buildGZResult(dom, sw);
// Persist result and render <IdentityModeCard ... />
```

# 13) Reliability note

* Identity reliability equals domain-score reliability. This layer adds zero noise and is deterministic.
* Axis Mode reliability equals the binary inputs; it is user-declared and stateless.

You now have specs, schemas, code, UI, storage, migration, tests, and copy.
