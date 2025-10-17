import type { DomainKey } from "./constants";

// helper z
const z = (x:number)=> Math.max(0, Math.min(1, (x-1)/4));

const NEG = new Set(['Anxiety','Anger','Depression','Immoderation','Vulnerability']);

export interface FacetData {
  domain: DomainKey;
  facet: string;
  raw: number;
  bucket: 'High' | 'Medium' | 'Low';
}

export interface ConflictPair {
  left: string;
  right: string;
  id: number; // index in catalog
}

export interface SelectedCard {
  type: 'high' | 'low' | 'conflict' | 'social' | 'values';
  facet: string; // for conflict use "Conflict Pair — A × B"
  domain?: DomainKey;
  bucket?: 'High' | 'Medium' | 'Low';
  raw?: number;
  description: string; // multi-line copy for conflict
  conflict?: ConflictPair;
  leftPct?: number;  // left bar percent
  rightPct?: number; // right bar percent
  explanation?: string;
  friction?: string;
  how_can_both_be_true?: string;
}

// Conflict catalog — expanded with polarity and thresholds (H by default)
type Pol = 'up'|'down';
type Thr = 'H'|'M'|'L';
interface CatalogEntry {
  id:string;
  a:{ trait:string; pol:Pol; thr:Thr };
  b:{ trait:string; pol:Pol; thr:Thr };
  copy?: {
    title: string;
    explanation: string;
    friction: string;
    how_can_both_be_true: string;
  }
}

const H=0.60, M=0.50, L=0.40;

const CATALOG: CatalogEntry[] = [
  {
    id: 'oc_ideas_vs_routine',
    a: { trait: 'Openness', pol: 'up', thr: 'H' },
    b: { trait: 'Orderliness', pol: 'down', thr: 'H' },
    copy: {
      title: 'Ideas vs. Structure',
      explanation: "You are highly imaginative and intellectually curious (High Openness), but you resist rigid structures and detailed plans (Low Orderliness).",
      friction: "This creates a gap between your visionary ideas and your ability to execute them systematically. You might generate brilliant concepts but lose energy when it comes to the tedious work of organizing and implementing them.",
      how_can_both_be_true: "You're a classic innovator who thrives in the chaos of creation. You don't need rigid, top-down plans; you need flexible systems that capture your ideas without constraining them. Your strength is in starting things, not finishing them in a linear way. Partner with someone who loves details to bring your visions to life."
    }
  },
  {
    id: 'oc_explore_check',
    a: { trait: 'Openness', pol: 'up', thr: 'H' },
    b: { trait: 'Cautiousness', pol: 'up', thr: 'H' },
    copy: {
      title: 'Exploration vs. Caution',
      explanation: "You have a strong desire to explore new ideas and possibilities (High Openness), but you also have a deep-seated need to avoid risks and ensure safety (High Cautiousness).",
      friction: "This puts you in a constant state of 'approach/avoid.' You're drawn to the unknown, but your inner risk-assessor slams the brakes. This can lead to analysis paralysis, where you research endlessly but hesitate to commit to a new path.",
      how_can_both_be_true: "You are a thoughtful explorer. Your caution isn't a weakness; it's a feature that ensures your explorations are well-considered. You're not meant for reckless abandon. You thrive when you can de-risk novelty through small experiments, prototyping, and gathering data before taking a big leap."
    }
  },
  {
    id: 'cn_capability_dread',
    a: { trait: 'Self-Efficacy', pol: 'up', thr: 'H' },
    b: { trait: 'Depression', pol: 'up', thr: 'H' },
    copy: {
      title: 'Capability vs. Dread',
      explanation: "You possess a strong belief in your own ability to succeed and overcome challenges (High Self-Efficacy), yet you are also prone to periods of low mood, sadness, and loss of motivation (High Depression).",
      friction: "This is the conflict of knowing you *can* do it, but feeling like you *can't*. Your capability tells you the task is manageable, but your emotional state drains your energy and makes even simple steps feel monumental. This can lead to guilt and frustration.",
      how_can_both_be_true: "Your self-efficacy is a resilient resource, but your mood is a variable state. The key is to separate your identity from your emotional weather. You're not incapable; you're just operating with low energy. Acknowledge the feeling without believing its story. Use your capability to break work into tiny, achievable wins that can pierce through the dread."
    }
  },
  {
    id: 'cn_ambition_overwhelm',
    a: { trait: 'Achievement-Striving', pol: 'up', thr: 'H' },
    b: { trait: 'Vulnerability', pol: 'up', thr: 'H' },
    copy: {
      title: 'Ambition vs. Overwhelm',
      explanation: "You have a powerful drive to set and hit ambitious goals (High Achievement-Striving), but you're also sensitive to stress and can feel overwhelmed by pressure (High Vulnerability).",
      friction: 'This creates a cycle of pushing hard, then feeling swamped. You excel when the path is clear, but struggle with open-ended challenges that can trigger feelings of inadequacy.',
      how_can_both_be_true: "You're a high-performer who needs well-defined boundaries to feel safe. Your ambition is the engine, but your vulnerability is the governor. Without clear sub-goals and recovery time, the engine can overheat. You thrive when you can channel your intense drive into manageable sprints."
    }
  },
  {
    id: 'en_drive_strain',
    a: { trait: 'Assertiveness', pol: 'up', thr: 'H' },
    b: { trait: 'Anxiety', pol: 'up', thr: 'H' },
    copy: {
      title: 'Drive vs. Strain',
      explanation: "You are driven to take charge and express your opinions confidently (High Assertiveness), but you also experience significant worry and tension, especially about the future and potential negative outcomes (High Anxiety).",
      friction: "This creates a 'gas pedal and brake' dynamic. You push forward to take control of a situation, but your anxiety makes you second-guess your decisions and worry about the consequences. You might appear confident on the outside while battling internal turmoil.",
      how_can_both_be_true: "Your assertiveness is a tool to manage your anxiety. You take charge to create a sense of certainty and control in an uncertain world. The key is to use that drive not just to act, but to gather information. Your anxiety is flagging potential risks; your assertiveness can be used to address them directly."
    }
  },
  {
    id: 'en_go_fragile',
    a: { trait: 'Activity Level', pol: 'up', thr: 'H' },
    b: { trait: 'Vulnerability', pol: 'up', thr: 'H' },
    copy: {
      title: 'Action vs. Overwhelm',
      explanation: "You have a high-energy, fast-paced approach to life and work (High Activity Level), but you are also sensitive and can feel easily overwhelmed by stress or pressure (High Vulnerability).",
      friction: "Your default is to be 'on'—moving, doing, and engaging. However, when stress mounts, this high-energy state can quickly crash into a state of feeling overwhelmed and unable to cope. This can feel like going from 100 to 0 unexpectedly.",
      how_can_both_be_true: "You're a sprinter, not a marathon runner. Your high energy is a powerful asset for short bursts of intense activity. Your vulnerability is a signal that you need to schedule deliberate recovery periods. You thrive in environments where you can alternate between high-intensity sprints and periods of rest and safety."
    }
  },
  {
    id: 'ae_lead_sync',
    a: { trait: 'Cooperation', pol: 'down', thr: 'H' },
    b: { trait: 'Assertiveness', pol: 'up', thr: 'H' },
    copy: {
      title: 'Command vs. Consensus',
      explanation: "You are naturally assertive and comfortable taking the lead to make decisions (High Assertiveness), but you are less inclined to build consensus or compromise your position for the sake of group harmony (Low Cooperation).",
      friction: "This makes you effective at driving results but can alienate team members who value collaboration. You see the direct path forward, but others may perceive you as dominant or dismissive of their input, leading to buy-in challenges.",
      how_can_both_be_true: "You are a natural leader with a strong sense of direction. Your instinct is to provide clarity and decisiveness, which is valuable. You don't need to abandon your directness, but you can learn to sequence it. State your position, then explicitly invite challenges. Frame it as 'Here's my proposal, now help me find the flaws.'"
    }
  },
  {
    id: 'ae_warm_guarded',
    a: { trait: 'Trust', pol: 'down', thr: 'H' },
    b: { trait: 'Gregariousness', pol: 'up', thr: 'H' },
    copy: {
      title: 'Sociable vs. Skeptical',
      explanation: "You are outgoing, friendly, and enjoy being around people (High Gregariousness), yet you are naturally skeptical of others' intentions and slow to place your trust in them (Low Trust).",
      friction: "This creates a social dissonance. You draw people in with your warmth and energy, but you keep them at a distance emotionally. People might feel a connection with you that isn't fully reciprocated, leading to confusion or a sense of being held at arm's length.",
      how_can_both_be_true: "You separate social enjoyment from deep vulnerability. Being with people energizes you, but you understand that connection and trust are two different things. Your warmth is genuine, but your trust is earned. You can be open without giving everything away. This allows you to enjoy a wide social circle while protecting your inner world."
    }
  },
  {
    id: 'an_guarded_reactive',
    a: { trait: 'Trust', pol: 'down', thr: 'H' },
    b: { trait: 'Anger', pol: 'up', thr: 'H' },
    copy: {
      title: 'Guarded vs. Reactive',
      explanation: "You are fundamentally skeptical of others' motives (Low Trust) and you are quick to feel and express anger when you feel provoked or wronged (High Anger).",
      friction: "This combination can create a defensive and volatile interpersonal style. Your default assumption is that people might take advantage of you, and your anger is a rapid defense mechanism against that perceived threat. This can lead to escalating conflicts over minor issues.",
      how_can_both_be_true: "Your anger is a shield to protect your guarded core. Because you don't readily trust, you're on high alert for signs of betrayal or disrespect. The anger is a powerful, albeit costly, way to enforce your boundaries. To manage this, focus on defining your boundaries proactively, so you don't have to defend them reactively."
    }
  },
  {
    id: 'an_understate_push',
    a: { trait: 'Modesty', pol: 'up', thr: 'H' },
    b: { trait: 'Assertiveness', pol: 'up', thr: 'H' },
    copy: {
      title: 'Humble vs. Forceful',
      explanation: "You are naturally modest and prefer not to draw attention to yourself (High Modesty), but you are also direct, forceful, and comfortable taking charge when necessary (High Assertiveness).",
      friction: "This can be confusing for others. You may downplay your contributions in one moment and then strongly advocate for a position in the next. This can come across as inconsistent or even as false modesty if not handled carefully.",
      how_can_both_be_true: "You separate your personal identity from your professional opinion. Your modesty is about who you are; your assertiveness is about what needs to be done. You don't need personal credit, but you feel a responsibility to ensure the right outcome. Frame your assertions as being in service of the goal, not for personal gain."
    }
  },
  {
    id: 'e_solo_driver',
    a: { trait: 'Assertiveness', pol: 'up', thr: 'H' },
    b: { trait: 'Gregariousness', pol: 'down', thr: 'H' },
    copy: {
      title: 'Solo Driver',
      explanation: "You are highly assertive and prefer to take charge and make decisions independently (High Assertiveness), and you have less need for social interaction and perform well when working alone (Low Gregariousness).",
      friction: "While this makes you incredibly efficient on solo projects, it can create challenges in team-based environments. You may unintentionally steamroll group discussions or forget to build the social capital needed for long-term collaboration.",
      how_can_both_be_true: "You are a focused, results-oriented individual. Your social energy is a finite resource, so you apply it purposefully. You're not anti-social; you're selectively social. For you, interaction is a means to an end, not an end in itself. Be deliberate about your check-ins and updates to keep the team aligned with your focused efforts."
    }
  },
  {
    id: 'c_neat_inconsistent',
    a: { trait: 'Orderliness', pol: 'up', thr: 'H' },
    b: { trait: 'Self-Discipline', pol: 'down', thr: 'H' },
    copy: {
      title: 'Organized vs. Inconsistent',
      explanation: "You appreciate structure, plans, and well-organized spaces (High Orderliness), but you struggle with the consistent, day-to-day follow-through required to maintain those systems (Low Self-Discipline).",
      friction: "This leads to cycles of intense organization followed by a slow slide back into chaos. You're great at setting up the perfect system but find the monotonous routine of upkeep draining. This can be frustrating, as you know what good looks like but can't always enforce it.",
      how_can_both_be_true: "You're a system architect, not a system operator. Your talent lies in designing efficient processes, not necessarily in executing them endlessly. You thrive on the novelty of creating order from chaos. To succeed, use tools and automation to handle the upkeep, or build reset rituals (like a weekly cleanup) into your schedule."
    }
  },
  {
    id: 'a_truth_vs_care',
    a: { trait: 'Morality', pol: 'down', thr: 'H' },
    b: { trait: 'Sympathy', pol: 'up', thr: 'H' },
    copy: {
      title: 'Truth vs. Care',
      explanation: "You are deeply compassionate and attuned to the feelings of others (High Sympathy), but you also have a pragmatic approach to rules and believe in being candid, even if it's uncomfortable (Low Morality/High Candor).",
      friction: "This creates a powerful internal conflict between your desire to be kind and your commitment to being honest. You feel the pain of the person you're talking to, but you also feel a duty to tell them the unvarnished truth. Delivering hard feedback can be agonizing.",
      how_can_both_be_true: "Your candor is an act of care. You believe that clear, direct feedback is ultimately kinder than allowing someone to proceed on a flawed path. You're not blunt for its own sake; you're honest because you're invested. Lead with your sympathetic intent: 'I'm telling you this because I care about your success.'"
    }
  },
  {
    id: 'on_curiosity_risk',
    a: { trait: 'Openness', pol: 'up', thr: 'H' },
    b: { trait: 'Anxiety', pol: 'up', thr: 'H' },
    copy: {
      title: 'Curiosity vs. Anxiety',
      explanation: "You are highly curious and drawn to new, complex information (High Openness), but you are also prone to worry and a sense of unease about potential negative outcomes (High Anxiety).",
      friction: "Your curiosity pulls you toward the unknown, while your anxiety screams at you to retreat to safety. This can result in a pattern of starting new things with enthusiasm, only to become paralyzed by worry as the stakes or uncertainty grow.",
      how_can_both_be_true: "Your anxiety is your brain's risk-management system trying to protect your curiosity. It's not trying to stop you from exploring; it's asking for a plan. You thrive when you can channel your curiosity into structured investigations. Use 'what if' scenarios not as a source of fear, but as a checklist for preparation."
    }
  },
  {
    id: 'oe_depth_vs_novelty',
    a: { trait: 'Intellect', pol: 'up', thr: 'H' },
    b: { trait: 'Excitement-Seeking', pol: 'up', thr: 'H' },
    copy: {
      title: 'Depth vs. Novelty',
      explanation: "You love diving deep into complex, abstract ideas (High Intellect), but you also have a strong craving for novelty, stimulation, and excitement (High Excitement-Seeking).",
      friction: "This creates a tension between the slow, patient work of deep thinking and the fast-paced thrill of the new. You might get bored during the long 'trough of sorrow' in a difficult project and be tempted to jump to the next exciting thing.",
      how_can_both_be_true: "You are a 'polymathic explorer.' You need both intellectual depth and novel stimulation to feel engaged. The key is to manage your focus in blocks. Dedicate protected time for deep work, and then reward yourself with periods of exploration and novelty. Frame your deep work as a series of exciting discoveries rather than a long slog."
    }
  },
  {
    id: 'ce_checklists_thrills',
    a: { trait: 'Cautiousness', pol: 'up', thr: 'H' },
    b: { trait: 'Excitement-Seeking', pol: 'up', thr: 'H' },
    copy: {
      title: 'Caution vs. Thrills',
      explanation: "You are careful, deliberate, and prefer to avoid risk (High Cautiousness), but you are also drawn to excitement, novelty, and high-stimulation activities (High Excitement-Seeking).",
      friction: "This is a classic 'safe but boring' vs. 'exciting but risky' dilemma. You crave the thrill but are held back by a strong inner voice warning you of all the things that could go wrong. You might find yourself planning adventures you never take.",
      how_can_both_be_true: "You are an expert at 'calculated risk.' You're not an adrenaline junkie; you're an adventure planner. Your cautious nature allows you to enjoy thrilling experiences by meticulously planning for them and mitigating the risks. You find the thrill not in pure danger, but in successfully navigating a high-stakes challenge through careful preparation."
    }
  },
];

// --- helpers ---
const domainKeys: DomainKey[] = ['O','C','E','A','N'] as any;
function domainMeans(facets:FacetData[]){
  const by: Record<DomainKey, number[]> = {O:[],C:[],E:[],A:[],N:[]};
  for (const f of facets) by[f.domain].push(f.raw ?? 3);
  const means: Record<DomainKey, number> = {O:3,C:3,E:3,A:3,N:3};
  for (const d of domainKeys){
    const arr = by[d];
    means[d] = arr.length ? arr.reduce((a,b)=>a+b,0)/arr.length : 3;
  }
  return means;
}

// Map a trait string to either a domain mean or a facet value
function traitZ(trait:string, facets:FacetData[], zMap:Map<string,number>): number | null {
  const domainMap: Record<string, DomainKey> = {
    Openness:'O', Conscientiousness:'C', Extraversion:'E', Agreeableness:'A', Neuroticism:'N'
  };
  const domainKey = domainMap[trait];
  if (domainKey){
    const mean = domainMeans(facets)[domainKey];
    return z(mean);
  }
  const hit = facets.find(f=> f.facet.toLowerCase() === trait.toLowerCase());
  if (!hit) return null;
  return zMap.get(`${hit.domain}:${hit.facet}`) ?? z(hit.raw);
}

function passThreshold(val:number, pol:Pol, thr:Thr): number {
  const t = thr==='H' ? H : thr==='M' ? M : L;
  const score = pol==='up' ? val : (1 - val);
  return score >= t ? score : -1;
}

// pick multiple conflicts (H tier, then M) - up to 4 conflicts
function selectConflictPairsDetailed(facets: FacetData[], zMap: Map<string, number>, maxConflicts: number = 4){
  function evalTier(minThr: Thr){
    const conflicts: any[] = [];
    for (let i=0;i<CATALOG.length;i++){
      const entry = CATALOG[i];
      const aVal = traitZ(entry.a.trait, facets, zMap);
      const bVal = traitZ(entry.b.trait, facets, zMap);
      if (aVal==null || bVal==null) continue;
      const aThr = minThr==='M' && entry.a.thr==='H' ? 'M' : entry.a.thr;
      const bThr = minThr==='M' && entry.b.thr==='H' ? 'M' : entry.b.thr;
      const aScore = passThreshold(aVal, entry.a.pol, aThr);
      const bScore = passThreshold(bVal, entry.b.pol, bThr);
      if (aScore<0 || bScore<0) continue;
      const score = Math.min(aScore, bScore);
      conflicts.push({ entry, score, aVal, bVal, idx:i });
    }
    // Sort by score (highest first) and return top conflicts
    return conflicts.sort((a,b) => b.score - a.score).slice(0, maxConflicts);
  }
  const hConflicts = evalTier('H');
  const mConflicts = evalTier('M');
  return [...hConflicts, ...mConflicts].slice(0, maxConflicts);
}

// build multiple conflict SelectedCards
function buildConflictCards(facets:FacetData[], zMap:Map<string,number>, maxConflicts: number = 4): SelectedCard[] {
  const conflicts = selectConflictPairsDetailed(facets, zMap, maxConflicts);
  const cards: SelectedCard[] = [];
  
  for (const sel of conflicts) {
    const { entry, aVal, bVal, idx } = sel;
    const aPct = Math.round(aVal*100);
    const bPct = Math.round(bVal*100);
    const copy = entry.copy || { title: 'Conflict', explanation: 'Gas pedal meets brake.', friction: 'This tension helps you with fast probes and crisis work but can hurt you during long periods of ambiguity.', how_can_both_be_true: 'Tip: pause 2 counts; set a binary next step.' };
    
    // Debug logging for conflict generation
    console.log('Conflict Generation Debug:', {
      entryId: entry.id,
      aTrait: entry.a.trait,
      bTrait: entry.b.trait,
      aVal: aVal,
      bVal: bVal,
      aPct: aPct,
      bPct: bPct,
      copy: copy,
      hasCopy: !!entry.copy
    });
    
    // Derive H/M/L labels for each side based on percentile strength relative to its polarity
    const level = (v:number)=> v>=0.70 ? 'High' : v>=0.40 ? 'Medium' : 'Low';
    const norm = (val:number, pol:Pol)=> pol==='up' ? val : (1 - val);
    const aLabel = level(norm(aVal, entry.a.pol));
    const bLabel = level(norm(bVal, entry.b.pol));
    cards.push({
      type: 'conflict',
      facet: `Conflict Pattern: ${copy.title}`,
      description: `${copy.explanation} ${copy.friction}`,
      explanation: copy.explanation,
      friction: copy.friction,
      how_can_both_be_true: copy.how_can_both_be_true,
      conflict: { left: entry.a.trait, right: entry.b.trait, id: idx },
      leftPct: aPct,
      rightPct: bPct
    });
  }

  // If no conflicts found, add fallback: Pursuit vs Threat from domain means
  if (cards.length === 0) {
    const means = domainMeans(facets);
    const O = means.O, C = means.C, E = means.E, N = means.N;
    const T = z(N);
    const P = z(0.40*O + 0.35*E + 0.25*C);
    const pLabel = P >= 0.5 ? 'High' : 'Low';
    const tLabel = T >= 0.5 ? 'High' : 'Low';
    const strengthLabel = (v:number)=> v>=0.7 ? 'Strong' : v>=0.4 ? 'Moderate' : 'Slight';
    const pStrength = strengthLabel(pLabel==='High' ? P : (1 - P));
    const tStrength = strengthLabel(tLabel==='High' ? T : (1 - T));
    cards.push({
      type: 'conflict',
      facet: `Conflict Pair — Pursuit ${pLabel} (${pStrength}) × Threat ${tLabel} (${tStrength})`,
      description: 'Gas pedal meets brake.\n\nThis tension helps you with fast probes and crisis work but can hurt you during long periods of ambiguity.\n\nTip: pause 2 counts; set a binary next step.',
      conflict: { left: 'Pursuit', right: 'Threat', id: -1 },
      leftPct: Math.round(P*100),
      rightPct: Math.round(T*100)
    });
  }
  
  return cards;
}

export function selectFiveCards(facets: FacetData[]): SelectedCard[] {
  const cards: SelectedCard[] = [];
  const used = new Set<string>();

  // compute z for all facets
  const zMap = new Map<string, number>(); // key domain:facet
  facets.forEach(f=> zMap.set(`${f.domain}:${f.facet}`, z(f.raw)));
  
  // Debug logging for all facets and z-scores
  console.log('All Facets Debug:', facets.map(f => ({
    domain: f.domain,
    facet: f.facet,
    raw: f.raw,
    bucket: f.bucket,
    zScore: zMap.get(`${f.domain}:${f.facet}`)
  })));

  // 1. Strongest High (authority)
  const highs = facets
    .filter(f => f.bucket==='High' && !NEG.has(f.facet))
    .sort((a,b)=> (zMap.get(`${b.domain}:${b.facet}`)! - zMap.get(`${a.domain}:${a.facet}`)!));
  console.log('High Cards Candidates:', highs.map(h => ({ facet: h.facet, zScore: zMap.get(`${h.domain}:${h.facet}`) })));
  if (highs.length > 0) {
    const strongest = highs[0];
    const highCard: SelectedCard = {
      type: 'high',
      facet: strongest.facet,
      domain: strongest.domain,
      bucket: strongest.bucket,
      raw: strongest.raw,
      description: `You have strong ${strongest.facet.toLowerCase()} that serves as a reliable foundation.`
    };
    console.log('Selected High Card:', highCard);
    cards.push(highCard);
    used.add(`${strongest.domain}:${strongest.facet}`);
  }

  // 2. Strongest Low (tension) — highest risk
  let strongestLow: FacetData | undefined;
  let bestRisk = -1;
  const lowCandidates = [];
  for (const f of facets){
    const zv = zMap.get(`${f.domain}:${f.facet}`)!;
    const risk = NEG.has(f.facet) ? zv : (1 - zv);
    lowCandidates.push({ facet: f.facet, risk, used: used.has(`${f.domain}:${f.facet}`) });
    if (!used.has(`${f.domain}:${f.facet}`) && risk > bestRisk){ bestRisk = risk; strongestLow = f; }
  }
  console.log('Low Cards Candidates:', lowCandidates);
  if (strongestLow){
    const lowCard: SelectedCard = {
      type:'low',
      facet:strongestLow.facet,
      domain:strongestLow.domain,
      bucket:strongestLow.bucket,
      raw:strongestLow.raw,
      description:`Your ${strongestLow.facet.toLowerCase()} may need attention, especially under pressure.`
    };
    console.log('Selected Low Card:', lowCard);
    used.add(`${strongestLow.domain}:${strongestLow.facet}`);
    cards.push(lowCard);
  }

  // 3-6. Conflict Pairs (up to 4 conflicts) — full cards
  const conflictCards = buildConflictCards(facets, zMap, 4);
  console.log('Selected Conflict Cards:', conflictCards.length, conflictCards.map(c => ({ type: c.type, facet: c.facet, leftPct: c.leftPct, rightPct: c.rightPct })));
  cards.push(...conflictCards);

  // 4. Social trait (prime social upsells)
  const socialFacets = ['Trust','Cooperation','Friendliness','Morality'];
  const socialCandidates = facets
    .filter(f=> socialFacets.includes(f.facet) && !used.has(`${f.domain}:${f.facet}`))
    .sort((a,b)=> Math.abs((zMap.get(`${b.domain}:${b.facet}`)!)-0.5) - Math.abs((zMap.get(`${a.domain}:${a.facet}`)!)-0.5));
  console.log('Social Cards Candidates:', socialCandidates.map(s => ({ facet: s.facet, zScore: zMap.get(`${s.domain}:${s.facet}`) })));
  if (socialCandidates.length > 0) {
    const social = socialCandidates[0];
    const socialCard: SelectedCard = {
      type: 'social',
      facet: social.facet,
      domain: social.domain,
      bucket: social.bucket,
      raw: social.raw,
      description: `Your ${social.facet.toLowerCase()} shapes how others experience you in relationships.`
    };
    console.log('Selected Social Card:', socialCard);
    used.add(`${social.domain}:${social.facet}`);
    cards.push(socialCard);
  }

  // 5. Values/Boundary trait (prime Override)
  const valuesFacets = ['Morality','Dutifulness'];
  let valuesCard = facets.find(f => valuesFacets.includes(f.facet) && !used.has(`${f.domain}:${f.facet}`));
  if (!valuesCard) {
    valuesCard = facets
      .filter(f => !used.has(`${f.domain}:${f.facet}`))
      .sort((a, b) => Math.abs(b.raw - 3) - Math.abs(a.raw - 3))[0];
  }
  console.log('Values Card Candidates:', facets.filter(f => valuesFacets.includes(f.facet)).map(v => ({ facet: v.facet, used: used.has(`${v.domain}:${v.facet}`) })));
  if (valuesCard) {
    const finalValuesCard: SelectedCard = {
      type: 'values',
      facet: valuesCard.facet,
      domain: valuesCard.domain,
      bucket: valuesCard.bucket,
      raw: valuesCard.raw,
      description: `Your ${valuesCard.facet.toLowerCase()} reflects your core boundaries and decision-making style.`
    };
    console.log('Selected Values Card:', finalValuesCard);
    cards.push(finalValuesCard);
  }

  const finalCards = cards.slice(0, 8); // Allow up to 8 cards (1 high + 1 low + 4 conflicts + 1 social + 1 values)
  console.log('Final 5 Cards Summary:', finalCards.map(c => ({ type: c.type, facet: c.facet, bucket: c.bucket })));
  return finalCards;
}
