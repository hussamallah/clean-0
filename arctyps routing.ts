// gz-rounds-routing.ts — no repeat within a round
import rulesJson from './arctyps rules.json';
type DomainKey = 'O'|'C'|'E'|'A'|'N';
type Bucket = 'Low'|'Medium'|'High';

interface FacetClusterRequire { require: Array<{facet:string; bucket:Bucket}> }
interface FacetClusterMinHigh { min_high:number; facets:string[] }
interface FacetClusterAnyHigh { any_high:string[] }
interface FacetClusterAnyLow  { any_low:string[] }
type FacetCluster = FacetClusterRequire | FacetClusterMinHigh | FacetClusterAnyHigh | FacetClusterAnyLow;

interface Archetype {
  id: string;
  gz: string;
  color: { name:string; hex:string };
  rules: {
    domains?: Partial<Record<DomainKey, Bucket>>;
    facet_clusters?: Partial<Record<DomainKey, FacetCluster>>;
  };
}

interface TriadTemplate {
  id: string;
  when_candidates_any: string[];
  question: string;
  hints: Record<string,string>;
}
interface BinaryTemplate {
  axis: string;
  question: string;
  left_bucket: DomainKey;
  left_hint: string;
  right_bucket: DomainKey;
  right_hint: string;
}
interface TieLayer {
  version: string;
  mode: 'triad_rounds_ko' | 'binary_brackets_4';
  group_size: number;
  no_repeat_in_round: boolean;
  bye_policy: 'auto';
  max_rounds: number | null;
  triad_templates: TriadTemplate[];
  binary_templates: BinaryTemplate[];
  fallbacks: { triad_question:string; binary_question:string };
}
interface RulesJSON {
  version: string;
  buckets: { low:number; high:number };
  domains: Record<DomainKey, {label:string; facets:string[]}>;
  operators: Record<string,string>;
  archetypes: Archetype[];
  tie_layer: TieLayer;
}

type TriadProbe = { type:'single_choice'; question:string; options:Array<{id:string; label:string}> };
type BinaryProbe = { type:'binary'; question:string; left:{id:string; label:string}; right:{id:string; label:string}; meta?:{ stage?:'pair'|'final'; present?:'image_pair'|'binary'; from?:{ left:string[]; right:string[] }, hints?:{ left:string; right:string } } };
type AnyProbe = TriadProbe | BinaryProbe;
type AskFn = (probe: AnyProbe) => Promise<string>;

const BUCKET_NUM: Record<Bucket, number> = { Low:0, Medium:1, High:2 };

function reqBucketNum(a:Archetype, d:DomainKey){ const b=a.rules.domains?.[d]; return b?BUCKET_NUM[b]:null }
function facetOppScore(a:Archetype,b:Archetype,d:DomainKey){
  const A=a.rules.facet_clusters?.[d], B=b.rules.facet_clusters?.[d]; if(!A||!B) return 0;
  const sA=JSON.stringify(A), sB=JSON.stringify(B);
  if (sA.includes('any_high') && sB.includes('any_low')) return .5;
  if (sA.includes('any_low')  && sB.includes('any_high')) return .5;
  return sA===sB ? 0 : .25;
}
function pairDiv(a:Archetype,b:Archetype){
  const D:DomainKey[]=['O','C','E','A','N']; let diff=0;
  for (const d of D){ const ra=reqBucketNum(a,d), rb=reqBucketNum(b,d);
    if (ra==null && rb==null) {} else if (ra==null || rb==null) diff+=.5; else diff+=Math.abs(ra-rb);
    diff+=facetOppScore(a,b,d);
  }
  return diff;
}

// exact best triad by max sum divergence (no reuse)
function bestTriad(ids:string[], A:Record<string,Archetype>): string[] {
  if (ids.length<=3) return [...ids];
  let best=['','',''], bestScore=-1;
  for (let i=0;i<ids.length;i++){
    for (let j=i+1;j<ids.length;j++){
      for (let k=j+1;k<ids.length;k++){
        const a=A[ids[i]], b=A[ids[j]], c=A[ids[k]];
        const s=pairDiv(a,b)+pairDiv(a,c)+pairDiv(b,c);
        if (s>bestScore){ best=[ids[i],ids[j],ids[k]]; bestScore=s; }
      }
    }
  }
  return best;
}

// build disjoint groups for one round; no candidate appears twice
function formRoundGroups(S:string[], A:Record<string,Archetype>, groupSize=3): string[][] {
  const pool=[...S];
  const groups:string[][]=[];
  while (pool.length>0){
    if (pool.length>=groupSize){
      const triad=bestTriad(pool, A);
      groups.push(triad);
      // remove triad from pool
      for (const id of triad){ const i=pool.indexOf(id); if (i>=0) pool.splice(i,1); }
    } else if (pool.length===2){
      groups.push([pool[0], pool[1]]);
      pool.length=0;
    } else {
      groups.push([pool[0]]); // bye
      pool.length=0;
    }
  }
  return groups;
}

function pickTriadTemplate(triad:string[], tie:TieLayer){
  for (const t of tie.triad_templates){
    const overlap=triad.filter(id=>t.when_candidates_any.includes(id));
    if (overlap.length>=2){
      const labels:Record<string,string>={};
      for (const id of triad) labels[id]=t.hints[id] || id;
      return { question:t.question, labels };
    }
  }
  const labels:Record<string,string>={}; for (const id of triad) labels[id]=id;
  return { question: tie.fallbacks.triad_question, labels };
}

function largestDiffAxis(a:Archetype,b:Archetype): [DomainKey,DomainKey] {
  const D:DomainKey[]=['O','C','E','A','N']; let best:[DomainKey,DomainKey]=['O','C'], gap=-1;
  for (const x of D){ for (const y of D){ if (x===y) continue;
    const gx=(reqBucketNum(a,x)??0)-(reqBucketNum(b,x)??0);
    const gy=(reqBucketNum(a,y)??0)-(reqBucketNum(b,y)??0);
    const g=Math.abs(gx)+Math.abs(gy);
    if (g>gap){ gap=g; best=[x,y]; }
  }}
  return best;
}

function pickBinaryTemplate(aId:string,bId:string,rules:RulesJSON){
  const tie=rules.tie_layer;
  const Amap=Object.fromEntries(rules.archetypes.map(x=>[x.id,x])) as Record<string,Archetype>;
  const a=Amap[aId], b=Amap[bId];
  // Choose the best available axis among templates by maximizing summed bucket differences
  let bestT: BinaryTemplate | null = null;
  let bestScore = -1;
  for (const tt of tie.binary_templates){
    const lx = reqBucketNum(a, tt.left_bucket)  ?? 1;
    const rx = reqBucketNum(a, tt.right_bucket) ?? 1;
    const ly = reqBucketNum(b, tt.left_bucket)  ?? 1;
    const ry = reqBucketNum(b, tt.right_bucket) ?? 1;
    const score = Math.abs(lx-ly) + Math.abs(rx-ry);
    if (score > bestScore){ bestScore = score; bestT = tt; }
  }
  if (bestT){
    return {
      question: bestT.question,
      left:  { id:aId, label: bestT.left_hint  },
      right: { id:bId, label: bestT.right_hint }
    };
  }
  // Fallback (no templates provided)
  return { question: tie.fallbacks.binary_question, left:{id:aId,label:aId}, right:{id:bId,label:bId} };
}

// Public: rounds KO resolver (no repeat within round)
export async function resolveArchetypeRounds(
  candidateIds: string[],
  ask: AskFn,
  rules: RulesJSON
): Promise<string> {
  if (rules.tie_layer?.mode === 'binary_brackets_4'){
    return resolveArchetypeBinaryBrackets(candidateIds, ask, rules);
  }
  let S=[...new Set(candidateIds)];
  if (S.length===0) throw new Error('No candidates');
  if (S.length===1) return S[0];

  const Amap=Object.fromEntries(rules.archetypes.map(x=>[x.id,x])) as Record<string,Archetype>;
  const tie=rules.tie_layer;
  let round=1;

  while (S.length>2){
    const groups=formRoundGroups(S, Amap, tie.group_size); // disjoint groups
    const winners:string[]=[];
    for (const g of groups){
      if (g.length===1){ winners.push(g[0]); continue; }
      if (g.length===2){
        const bin=pickBinaryTemplate(g[0], g[1], rules);
        const probe:BinaryProbe={ type:'binary', question:bin.question, left:bin.left, right:bin.right };
        const pick=await ask(probe);
        winners.push(g.includes(pick)?pick:g[0]); // defensive
        continue;
      }
      // triad
      const tpl=pickTriadTemplate(g, tie);
      const probe:TriadProbe={ type:'single_choice', question:tpl.question, options:g.map(id=>({id, label:tpl.labels[id]})) };
      const pick=await ask(probe);
      winners.push(g.includes(pick)?pick:g[0]); // defensive
    }
    S=winners; // advance winners only; no one is re-asked within the round
    round++;
  }

  if (S.length===1) return S[0];
  const bin=pickBinaryTemplate(S[0], S[1], rules);
  const finalProbe:BinaryProbe={ type:'binary', question:bin.question, left:bin.left, right:bin.right };
  const sel=await ask(finalProbe);
  return S.includes(sel) ? sel : S[0];
}

// ----- Binary Brackets of 4 with bye-on-3 -----
async function binaryPairWinner(aId:string, bId:string, ask:AskFn, rules:RulesJSON, stage:'pair'|'final', fromLeft?:string[], fromRight?:string[]): Promise<string> {
  const bin=pickBinaryTemplate(aId, bId, rules);
  const isPair = stage==='pair';
  const triadFallbackQ = rules.tie_layer?.fallbacks?.triad_question || bin.question;
  const Amap=Object.fromEntries(rules.archetypes.map(x=>[x.id,x])) as Record<string,Archetype>;
  const leftTitle  = Amap[aId]?.gz || aId;
  const rightTitle = Amap[bId]?.gz || bId;
  const probe:BinaryProbe={
    type:'binary',
    question: isPair ? triadFallbackQ : (fromLeft?.length || fromRight?.length
      ? `${bin.question} — Winner of ${fromLeft?.join(' vs ')||aId} vs Winner of ${fromRight?.join(' vs ')||bId}`
      : bin.question),
    // Final: labels are the winners' names; Pair: labels are ids for image mapping
    left:  { id:aId, label: isPair ? aId : (Amap[aId]?.gz || aId) },
    right: { id:bId, label: isPair ? bId : (Amap[bId]?.gz || bId) },
    meta: { stage, present: isPair ? 'image_pair' : 'binary', from: { left: fromLeft||[], right: fromRight||[] }, hints: { left: bin.left.label, right: bin.right.label } }
  };
  const pick=await ask(probe);
  return (pick===aId || pick===bId) ? pick : aId;
}

function pickByeId(ids:string[], A:Record<string,Archetype>): string {
  if (ids.length<=1) return ids[0];
  let best=ids[0], bestScore=-1;
  for (const id of ids){
    let s=0; for (const other of ids){ if (other===id) continue; s+=pairDiv(A[id], A[other]); }
    if (s>bestScore){ bestScore=s; best=id; }
  }
  return best;
}

async function resolveArchetypeBinaryBrackets(
  candidateIds: string[],
  ask: AskFn,
  rules: RulesJSON
): Promise<string> {
  let pool=[...new Set(candidateIds)];
  if (pool.length===0) throw new Error('No candidates');
  if (pool.length===1) return pool[0];

  const Amap=Object.fromEntries(rules.archetypes.map(x=>[x.id,x])) as Record<string,Archetype>;

  while (pool.length>1){
    const next:string[]=[];
    let i=0;
    while (i<pool.length){
      const remain = pool.length - i;
      if (remain>=4){
        const a=pool[i], b=pool[i+1], c=pool[i+2], d=pool[i+3];
        const w1 = await binaryPairWinner(a,b,ask,rules,'pair');
        const w2 = await binaryPairWinner(c,d,ask,rules,'pair');
        const w  = await binaryPairWinner(w1,w2,ask,rules,'final',[a,b],[c,d]);
        next.push(w); i+=4; continue;
      }
      if (remain===3){
        // Bye policy: auto-select one with highest divergence vs others
        const tri = [pool[i], pool[i+1], pool[i+2]];
        const bye = pickByeId(tri, Amap);
        const others = tri.filter(x=>x!==bye);
        const w1 = await binaryPairWinner(others[0], others[1], ask, rules,'pair');
        const w  = await binaryPairWinner(bye, w1, ask, rules,'final',[bye],[others[0], others[1]]);
        next.push(w); i+=3; continue;
      }
      if (remain===2){
        const w = await binaryPairWinner(pool[i], pool[i+1], ask, rules,'final',[pool[i]],[pool[i+1]]);
        next.push(w); i+=2; continue;
      }
      // remain===1 → advance
      next.push(pool[i]); i+=1;
    }
    pool = next;
  }
  return pool[0];
}

// Convenience export: use built-in rules JSON
const ARCTYPS_RULES = rulesJson as unknown as RulesJSON;
export async function resolveWithArctypsRules(
  candidateIds: string[],
  ask: AskFn
): Promise<string> {
  return resolveArchetypeRounds(candidateIds, ask, ARCTYPS_RULES);
}
