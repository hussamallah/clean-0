// Circuits.ts → Big Five (no text lines)

// Domains: E,N,C,O,A. Circuits: vitality, signal, time, attachment, seeking.
export type Domain = "E" | "N" | "C" | "O" | "A";
export type Bucket = "High" | "Medium" | "Low";

export interface Circuits {
  vitality: number;   // Life(+1) ↔ Death(-1)
  signal: number;     // Signal(+1) ↔ Silence(-1)
  time: number;       // Time(+1) ↔ Space(-1)
  attachment: number; // Love/Security(+1) ↔ Despair/Rupture(-1)
  seeking: number;    // Seeking(+1) ↔ Pain/Avoid(-1)
}

export interface Scores { E:number; N:number; C:number; O:number; A:number; }
export interface Buckets { E:Bucket; N:Bucket; C:Bucket; O:Bucket; A:Bucket; }
export interface Result {
  W_VERSION: string;
  v: Circuits;
  z: Scores;          // latent [-1,1]
  scores: Scores;     // [1,5]
  buckets: Buckets;   // H/M/L
  id: string;         // E_H|N_M|C_L|O_H|A_L
  auditHash: string;  // SHA-256 of payload (stable JSON)
}

export const DOMAINS: Domain[] = ["E","N","C","O","A"];
export const W_VERSION = "W_2025-10-02_r1";

// Weight matrix rows = domains E,N,C,O,A ; cols = [vitality,signal,time,attachment,seeking]
export const W: Record<Domain, number[]> = {
  E:[+0.35,+0.20,+0.05,+0.00,+0.40],
  N:[-0.35,-0.10,-0.05,-0.30,-0.40],
  C:[+0.10,+0.05,+0.70,+0.05,+0.10],
  O:[+0.05,+0.45,-0.60,+0.05,+0.05],
  A:[+0.10,+0.15,+0.05,+0.60,-0.10],
};

const clamp = (x:number,a=-1,b=1)=>Math.max(a,Math.min(b,x));
const dot = (w:number[],v:number[])=>w.reduce((s,wi,i)=>s+wi*v[i],0);

export function scoreBucketsFromCircuits(v: Circuits): { scores: Scores; buckets: Buckets; z: Scores } {
  const vec = [v.vitality, v.signal, v.time, v.attachment, v.seeking];
  const z: any = {E:0,N:0,C:0,O:0,A:0};
  const scores: any = {E:0,N:0,C:0,O:0,A:0};
  (DOMAINS as Domain[]).forEach(d=>{
    const zi = clamp(dot(W[d], vec), -1, 1);
    z[d] = zi;
    scores[d] = 3 + 2*zi; // [1,5]
  });
  const bucket = (s:number):Bucket => s>=3.67 ? "High" : (s<=2.33 ? "Low" : "Medium");
  const buckets: any = {E:bucket(scores.E), N:bucket(scores.N), C:bucket(scores.C), O:bucket(scores.O), A:bucket(scores.A)};
  return { scores, buckets, z };
}

// Deterministic profile ID like "E_H|N_M|C_L|O_H|A_L"
export function profileIdFromBuckets(b: Buckets): string {
  const t = (x:Bucket)=> x==="High"?"H":(x==="Medium"?"M":"L");
  return `E_${t(b.E)}|N_${t(b.N)}|C_${t(b.C)}|O_${t(b.O)}|A_${t(b.A)}`;
}

// Stable stringify for hashing (sorted keys)
export function stableStringify(x:any): string {
  const seen = new WeakSet();
  const stringify = (obj:any):string=>{
    if (obj===null || typeof obj!=="object") return JSON.stringify(obj);
    if (seen.has(obj)) throw new Error("circular");
    seen.add(obj);
    if (Array.isArray(obj)) return "["+obj.map(e=>stringify(e)).join(",")+"]";
    const keys = Object.keys(obj).sort();
    return "{"+keys.map(k=>JSON.stringify(k)+":"+stringify(obj[k])).join(",")+"}";
  };
  return stringify(x);
}

// SHA-256: browser first, Node fallback
export async function sha256(input: string): Promise<string> {
  // @ts-ignore
  if (typeof crypto!=="undefined" && crypto.subtle) {
    // @ts-ignore
    const buf = new TextEncoder().encode(input);
    // @ts-ignore
    const hash = await crypto.subtle.digest("SHA-256", buf);
    return Array.from(new Uint8Array(hash)).map(b=>b.toString(16).padStart(2,"0")).join("");
  }
  const nodeCrypto = await import("crypto");
  return nodeCrypto.createHash("sha256").update(input).digest("hex");
}

// Circuits → scored payload (no text content)
export async function compute(v: Circuits): Promise<Result> {
  const {scores, buckets, z} = scoreBucketsFromCircuits(v);
  const id = profileIdFromBuckets(buckets);
  const payload = { W_VERSION, v, z, scores, buckets, id };
  const auditHash = await sha256(stableStringify(payload));
  return { ...payload, auditHash };
}

/* Example:
(async ()=>{
  const v: Circuits = { vitality:0.7, signal:0.4, time:0.3, attachment:0.2, seeking:0.8 };
  console.log(await compute(v));
})();
*/
// signals → Circuits (compatible with gzero_engine_core.ts)
export type Signal = { vec: [number,number,number,number,number]; weight?: number; note?:string };

const clip1 = (x:number)=> Math.max(-1, Math.min(1, x));

export function aggregateSignals(signals: Signal[], defaultWeight = 1): Circuits {
  let sumW = 0;
  const acc = [0,0,0,0,0];
  for (const s of signals) {
    const w = s.weight ?? defaultWeight;
    sumW += w;
    for (let i=0;i<5;i++) acc[i] += (s.vec[i] ?? 0) * w;
  }
  if (sumW <= 0) return { vitality:0, signal:0, time:0, attachment:0, seeking:0 };
  const avg = acc.map(x => clip1(x / sumW)) as [number,number,number,number,number];
  return { vitality: avg[0], signal: avg[1], time: avg[2], attachment: avg[3], seeking: avg[4] };
}
