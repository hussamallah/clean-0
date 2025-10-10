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
  // First try existing specific templates
  for (const t of tie.triad_templates){
    const overlap=triad.filter(id=>t.when_candidates_any.includes(id));
    if (overlap.length>=2){
      const labels:Record<string,string>={};
      for (const id of triad) labels[id]=t.hints[id] || id;
      return { question:t.question, labels };
    }
  }
  
  // Generate comprehensive triad templates for any combination
  const comprehensiveTriadTemplates = generateComprehensiveTriadTemplates(triad);
  
  // Find the best template based on archetype characteristics
  let bestTemplate = null;
  let bestScore = -1;
  
  for (const template of comprehensiveTriadTemplates) {
    const score = calculateTriadTemplateScore(triad, template);
    if (score > bestScore) {
      bestScore = score;
      bestTemplate = template;
    }
  }
  
  if (bestTemplate) {
    return bestTemplate;
  }
  
  // This should never happen with comprehensive templates
  throw new Error(`No suitable triad template found for: ${triad.join(', ')}`);
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

// Comprehensive archetype-specific question templates
function generateComprehensiveTemplates(aId: string, bId: string, a: Archetype, b: Archetype, rules: RulesJSON): BinaryTemplate[] {
  const templates: BinaryTemplate[] = [];
  
  // Domain-based templates (existing logic enhanced)
  const domainTemplates = [
    {
      axis: "C_vs_E",
      question: "In a crunch, what's your first move?",
      left_bucket: "C" as DomainKey,
      left_hint: "Impose order and standards",
      right_bucket: "E" as DomainKey,
      right_hint: "Rally people and drive action"
    },
    {
      axis: "A_vs_O",
      question: "How do you show care first?",
      left_bucket: "A" as DomainKey,
      left_hint: "Duty and reliability",
      right_bucket: "O" as DomainKey,
      right_hint: "Empathy and creative connection"
    },
    {
      axis: "E_vs_N",
      question: "Under pressure, which is closer?",
      left_bucket: "E" as DomainKey,
      left_hint: "Move outward and engage",
      right_bucket: "N" as DomainKey,
      right_hint: "Withdraw and stabilize"
    },
    {
      axis: "C_vs_O",
      question: "What do you trust more to get results?",
      left_bucket: "C" as DomainKey,
      left_hint: "Structure and standards",
      right_bucket: "O" as DomainKey,
      right_hint: "Ideas and exploration"
    },
    {
      axis: "A_vs_E",
      question: "When helping others, you prefer to:",
      left_bucket: "A" as DomainKey,
      left_hint: "Support quietly and consistently",
      right_bucket: "E" as DomainKey,
      right_hint: "Motivate and energize them"
    },
    {
      axis: "C_vs_N",
      question: "When facing uncertainty, you:",
      left_bucket: "C" as DomainKey,
      left_hint: "Create plans and systems",
      right_bucket: "N" as DomainKey,
      right_hint: "Adapt and stay flexible"
    }
  ];
  
  templates.push(...domainTemplates);
  
  // Archetype-specific templates for high-contrast pairs
  const archetypeSpecificTemplates = getArchetypeSpecificTemplates(aId, bId);
  templates.push(...archetypeSpecificTemplates);
  
  // Leadership style templates
  const leadershipTemplates = [
    {
      axis: "Leadership_Structure_vs_Energy",
      question: "As a leader, you naturally:",
      left_bucket: "C" as DomainKey,
      left_hint: "Set clear structure and expectations",
      right_bucket: "E" as DomainKey,
      right_hint: "Inspire through energy and vision"
    },
    {
      axis: "Leadership_Control_vs_Freedom",
      question: "Your leadership approach is:",
      left_bucket: "C" as DomainKey,
      left_hint: "Guide with clear direction",
      right_bucket: "O" as DomainKey,
      right_hint: "Encourage exploration and creativity"
    },
    {
      axis: "Leadership_Authority_vs_Collaboration",
      question: "When making decisions, you:",
      left_bucket: "E" as DomainKey,
      left_hint: "Take charge and move forward",
      right_bucket: "A" as DomainKey,
      right_hint: "Seek input and build consensus"
    }
  ];
  
  templates.push(...leadershipTemplates);
  
  // Problem-solving style templates
  const problemSolvingTemplates = [
    {
      axis: "Problem_Systematic_vs_Intuitive",
      question: "When solving problems, you:",
      left_bucket: "C" as DomainKey,
      left_hint: "Analyze systematically and methodically",
      right_bucket: "O" as DomainKey,
      right_hint: "Follow intuition and creative insights"
    },
    {
      axis: "Problem_Action_vs_Reflection",
      question: "Your problem-solving style is:",
      left_bucket: "E" as DomainKey,
      left_hint: "Jump in and learn by doing",
      right_bucket: "N" as DomainKey,
      right_hint: "Think deeply before acting"
    },
    {
      axis: "Problem_Independent_vs_Collaborative",
      question: "You prefer to solve problems:",
      left_bucket: "O" as DomainKey,
      left_hint: "Independently with your own approach",
      right_bucket: "A" as DomainKey,
      right_hint: "Through collaboration and discussion"
    }
  ];
  
  templates.push(...problemSolvingTemplates);
  
  return templates;
}

function getArchetypeSpecificTemplates(aId: string, bId: string): BinaryTemplate[] {
  const templates: BinaryTemplate[] = [];
  
  // High-contrast archetype pairs get specific questions
  const highContrastPairs = [
    { pair: ['sovereign', 'rebel'], question: "When rules conflict with your values, you:", left: "Follow the rules anyway", right: "Break the rules for what's right" },
    { pair: ['guardian', 'spotlight'], question: "Your ideal team environment is:", left: "Structured and disciplined", right: "Fun and spontaneous" },
    { pair: ['visionary', 'partner'], question: "You're most energized by:", left: "Big ideas and possibilities", right: "Stable relationships and consistency" },
    { pair: ['seeker', 'diplomat'], question: "When seeking truth, you:", left: "Question everything independently", right: "Consider everyone's perspective" },
    { pair: ['architect', 'navigator'], question: "Your approach to change is:", left: "Plan and design carefully", right: "Adapt and explore as you go" },
    { pair: ['provider', 'vessel'], question: "Your care style is:", left: "Take action and responsibility", right: "Offer peace and emotional support" },
    { pair: ['sovereign', 'spotlight'], question: "In leadership, you prioritize:", left: "Authority and control", right: "Energy and inspiration" },
    { pair: ['rebel', 'guardian'], question: "When facing injustice, you:", left: "Challenge the system directly", right: "Protect others within the system" },
    { pair: ['visionary', 'seeker'], question: "Your learning style is:", left: "Connect ideas across domains", right: "Dive deep into specific topics" },
    { pair: ['architect', 'diplomat'], question: "Your creative process involves:", left: "Systematic design and structure", right: "Emotional connection and empathy" },
    { pair: ['navigator', 'partner'], question: "Your ideal adventure is:", left: "Exploring new places and people", right: "Sharing familiar experiences" },
    { pair: ['provider', 'spotlight'], question: "Your contribution style is:", left: "Reliable support behind the scenes", right: "Visible inspiration and motivation" },
    // Add more specific pairs for better coverage
    { pair: ['architect', 'provider'], question: "Your approach to helping others is:", left: "Design systems and structures", right: "Take direct action and responsibility" },
    { pair: ['navigator', 'diplomat'], question: "When working with people, you:", left: "Guide them through exploration", right: "Connect through empathy and understanding" },
    { pair: ['seeker', 'vessel'], question: "Your ideal environment is:", left: "Intellectually stimulating and independent", right: "Peaceful and emotionally supportive" },
    { pair: ['visionary', 'guardian'], question: "Your leadership style is:", left: "Inspire through big ideas", right: "Protect and energize the team" },
    { pair: ['sovereign', 'provider'], question: "When making decisions, you:", left: "Take authority and control", right: "Consider everyone's needs first" },
    { pair: ['rebel', 'spotlight'], question: "Your energy comes from:", left: "Breaking constraints and patterns", right: "Inspiring and energizing others" }
  ];
  
  for (const pair of highContrastPairs) {
    // Check both directions of the pair
    if ((pair.pair[0] === aId && pair.pair[1] === bId) || (pair.pair[0] === bId && pair.pair[1] === aId)) {
      const isReversed = pair.pair[0] === bId;
      templates.push({
        axis: `Archetype_${aId}_vs_${bId}`,
        question: pair.question,
        left_bucket: "C" as DomainKey, // Placeholder - scoring will be based on domain differences
        left_hint: isReversed ? pair.right : pair.left,
        right_bucket: "E" as DomainKey, // Placeholder - scoring will be based on domain differences  
        right_hint: isReversed ? pair.left : pair.right
      });
    }
  }
  
  return templates;
}

function getArchetypeRelevanceScore(aId: string, bId: string, template: BinaryTemplate): number {
  // Score based on how well the template matches the specific archetype pair
  let score = 0;
  
  // Higher score for archetype-specific templates
  if (template.axis.startsWith('Archetype_')) {
    score += 2.0;
  }
  
  // Medium score for leadership/problem-solving templates
  if (template.axis.startsWith('Leadership_') || template.axis.startsWith('Problem_')) {
    score += 1.0;
  }
  
  // Lower score for generic domain templates
  if (template.axis.includes('_vs_') && !template.axis.startsWith('Archetype_')) {
    score += 0.5;
  }
  
  return score;
}

// Comprehensive triad template generation
function generateComprehensiveTriadTemplates(triad: string[]): Array<{question: string, labels: Record<string, string>}> {
  const templates: Array<{question: string, labels: Record<string, string>}> = [];
  
  // Leadership style triads
  const leadershipTriads = [
    {
      question: "When leading a team, you naturally:",
      labels: {
        sovereign: "Set clear authority and structure",
        guardian: "Protect and energize the group", 
        spotlight: "Inspire through energy and fun"
      }
    },
    {
      question: "Your leadership philosophy is:",
      labels: {
        architect: "Design systems that work",
        navigator: "Guide through exploration",
        partner: "Stabilize and support everyone"
      }
    }
  ];
  
  // Problem-solving style triads
  const problemSolvingTriads = [
    {
      question: "When facing a complex challenge, you:",
      labels: {
        seeker: "Analyze deeply and independently",
        diplomat: "Consider all perspectives first",
        vessel: "Create calm and safe space"
      }
    },
    {
      question: "Your approach to innovation is:",
      labels: {
        visionary: "Connect ideas across domains",
        rebel: "Break existing patterns",
        provider: "Build practical solutions"
      }
    }
  ];
  
  // Relationship and care style triads
  const relationshipTriads = [
    {
      question: "How do you show you care?",
      labels: {
        provider: "Take action and responsibility",
        diplomat: "Offer empathy and understanding",
        vessel: "Provide peace and emotional safety"
      }
    },
    {
      question: "Your ideal collaboration style is:",
      labels: {
        architect: "Design together systematically",
        navigator: "Explore and adapt together",
        partner: "Work steadily side by side"
      }
    }
  ];
  
  // Work style triads
  const workStyleTriads = [
    {
      question: "Your ideal work environment is:",
      labels: {
        sovereign: "Structured with clear hierarchy",
        spotlight: "Dynamic and energizing",
        seeker: "Quiet and intellectually stimulating"
      }
    },
    {
      question: "When working on a project, you:",
      labels: {
        guardian: "Take charge and drive momentum",
        visionary: "Generate creative possibilities",
        vessel: "Maintain harmony and balance"
      }
    }
  ];
  
  // Check which templates apply to the current triad
  const allTriadTemplates = [
    ...leadershipTriads,
    ...problemSolvingTriads, 
    ...relationshipTriads,
    ...workStyleTriads
  ];
  
  for (const template of allTriadTemplates) {
    const matchingArchetypes = triad.filter(id => template.labels[id]);
    if (matchingArchetypes.length >= 2) {
      // Create labels for all triad members
      const labels: Record<string, string> = {};
      for (const id of triad) {
        labels[id] = template.labels[id] || getGenericArchetypeHint(id);
      }
      templates.push({
        question: template.question,
        labels
      });
    }
  }
  
  // Generic fallback templates for any combination
  const genericTemplates = [
    {
      question: "Which approach feels most natural to you?",
      labels: {}
    },
    {
      question: "In this moment, which resonates most?",
      labels: {}
    },
    {
      question: "Which best describes your current energy?",
      labels: {}
    }
  ];
  
  for (const template of genericTemplates) {
    const labels: Record<string, string> = {};
    for (const id of triad) {
      labels[id] = getGenericArchetypeHint(id);
    }
    templates.push({
      question: template.question,
      labels
    });
  }
  
  return templates;
}

function getGenericArchetypeHint(archetypeId: string): string {
  const hints: Record<string, string> = {
    sovereign: "Lead with authority and structure",
    rebel: "Challenge and break constraints",
    visionary: "Create and connect ideas",
    navigator: "Guide through exploration",
    guardian: "Protect and energize others",
    seeker: "Analyze and discover truth",
    architect: "Design and build systems",
    spotlight: "Inspire and energize people",
    diplomat: "Connect through empathy",
    partner: "Stabilize and support",
    provider: "Take care and responsibility",
    vessel: "Offer peace and balance"
  };
  return hints[archetypeId] || archetypeId;
}

function calculateTriadTemplateScore(triad: string[], template: {question: string, labels: Record<string, string>}): number {
  let score = 0;
  
  // Score based on how many archetypes have specific labels
  const matchingLabels = triad.filter(id => template.labels[id] && template.labels[id] !== id);
  score += matchingLabels.length * 2.0;
  
  // Bonus for templates that match all three archetypes
  if (matchingLabels.length === triad.length) {
    score += 1.0;
  }
  
  // Prefer more specific questions over generic ones
  if (template.question.includes("naturally") || template.question.includes("philosophy")) {
    score += 0.5;
  }
  
  return score;
}

function pickBinaryTemplate(aId:string,bId:string,rules:RulesJSON){
  const tie=rules.tie_layer;
  const Amap=Object.fromEntries(rules.archetypes.map(x=>[x.id,x])) as Record<string,Archetype>;
  const a=Amap[aId], b=Amap[bId];
  
  // Generate comprehensive question templates for all possible archetype combinations
  const comprehensiveTemplates = generateComprehensiveTemplates(aId, bId, a, b, rules);
  
  // Choose the best template by maximizing domain differences and archetype-specific relevance
  let bestT: BinaryTemplate | null = null;
  let bestScore = -1;
  
  for (const tt of comprehensiveTemplates){
    const lx = reqBucketNum(a, tt.left_bucket)  ?? 1;
    const rx = reqBucketNum(a, tt.right_bucket) ?? 1;
    const ly = reqBucketNum(b, tt.left_bucket)  ?? 1;
    const ry = reqBucketNum(b, tt.right_bucket) ?? 1;
    const domainScore = Math.abs(lx-ly) + Math.abs(rx-ry);
    
    // Add archetype-specific relevance score
    const relevanceScore = getArchetypeRelevanceScore(aId, bId, tt);
    const totalScore = domainScore + relevanceScore;
    
    if (totalScore > bestScore){ 
      bestScore = totalScore; 
      bestT = tt; 
    }
  }
  
  if (bestT){
    return {
      question: bestT.question,
      left:  { id:aId, label: bestT.left_hint  },
      right: { id:bId, label: bestT.right_hint }
    };
  }
  
  // This should never happen with comprehensive templates, but defensive fallback
  throw new Error(`No suitable template found for archetype pair: ${aId} vs ${bId}`);
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
  const Amap=Object.fromEntries(rules.archetypes.map(x=>[x.id,x])) as Record<string,Archetype>;
  const leftTitle  = Amap[aId]?.gz || aId;
  const rightTitle = Amap[bId]?.gz || bId;
  
  // Debug logging
  console.log(`BinaryPairWinner: ${aId} vs ${bId}, stage: ${stage}, fromLeft: ${fromLeft}, fromRight: ${fromRight}`);
  
  // Use comprehensive question selection - no fallbacks needed
  let question = bin.question;
  
  // Add context for final rounds to make it clearer
  if (fromLeft?.length || fromRight?.length) {
    const leftContext = fromLeft?.length ? `Winner of ${fromLeft.join(' vs ')}` : aId;
    const rightContext = fromRight?.length ? `Winner of ${fromRight.join(' vs ')}` : bId;
    question = `${bin.question}\n\n${leftContext} vs ${rightContext}`;
  }
    
  const probe:BinaryProbe={
    type:'binary',
    question,
    // Final: labels are the winners' names; Pair: labels are ids for image mapping
    left:  { id:aId, label: isPair ? aId : (Amap[aId]?.gz || aId) },
    right: { id:bId, label: isPair ? bId : (Amap[bId]?.gz || bId) },
    meta: { stage, present: isPair ? 'image_pair' : 'binary', from: { left: fromLeft||[], right: fromRight||[] }, hints: { left: bin.left.label, right: bin.right.label } }
  };
  const pick=await ask(probe);
  console.log(`BinaryPairWinner result: ${pick} (chose between ${aId} and ${bId})`);
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

function pickMostDivergentWildCard(currentPool: string[], remainingArchetypes: string[], Amap: Record<string, Archetype>): string {
  let bestWildCard = remainingArchetypes[0];
  let bestScore = -1;
  
  for (const wildCard of remainingArchetypes) {
    // Calculate how different this wild card is from the current pool
    let totalDivergence = 0;
    for (const currentArchetype of currentPool) {
      totalDivergence += pairDiv(Amap[wildCard], Amap[currentArchetype]);
    }
    
    // Prefer wild cards that are most different from the current pool
    if (totalDivergence > bestScore) {
      bestScore = totalDivergence;
      bestWildCard = wildCard;
    }
  }
  
  console.log(`Selected wild card: ${bestWildCard} (divergence score: ${bestScore})`);
  return bestWildCard;
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
  
  // Add wild card if odd number to ensure even tournament
  if (pool.length % 2 === 1) {
    const allArchetypes = rules.archetypes.map(x => x.id);
    const remainingArchetypes = allArchetypes.filter(id => !pool.includes(id));
    
    if (remainingArchetypes.length > 0) {
      // Pick the most divergent wild card from remaining archetypes
      const wildCard = pickMostDivergentWildCard(pool, remainingArchetypes, Amap);
      pool.push(wildCard);
      console.log(`Added wild card: ${wildCard}. New pool: ${pool.join(', ')}`);
    }
  }

  while (pool.length>1){
    console.log(`Binary brackets round starting with pool: ${pool.join(', ')}`);
    const next:string[]=[];
    let i=0;
    
    // Pure binary tournament - always pair archetypes 2 by 2
    while (i<pool.length){
      const remain = pool.length - i;
      if (remain>=2){
        const a=pool[i], b=pool[i+1];
        console.log(`Processing binary pair: ${a} vs ${b}`);
        
        // Use 'pair' stage for bird images in early rounds, 'final' for text questions in final round
        const isFinalRound = pool.length === 2;
        const stage = isFinalRound ? 'final' : 'pair';
        
        const w = await binaryPairWinner(a, b, ask, rules, stage, [a], [b]);
        console.log(`Binary pair winner: ${w}`);
        next.push(w); i+=2; continue;
      }
      // remain===1 → advance
      console.log(`Advancing single archetype: ${pool[i]}`);
      next.push(pool[i]); i+=1;
    }
    pool = next;
    console.log(`Round complete. Next pool: ${pool.join(', ')}`);
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
