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
  const buckets = { O:B[O], C:B[C], E:B[E], A:B[A], S:B[S] } as const;
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
