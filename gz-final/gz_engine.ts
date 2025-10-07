/*
 Ground Zero — Quiz Engine (MVP v1.3)
 Deterministic. No RNG. Compatible with bank version "gz_item_bank_v1.3_full".
 
 Exported API:
 - class GZEngine
 - types for integration

 Usage sketch:
   const engine = new GZEngine(BANK_JSON, { allowVeryHighUnpicked: false });
   let next = engine.getNextItem();
   // render next → collect answers → feed back via submit...
   engine.submitPhase1(["O","C","E"]);
   // then loop:
   //   const item = engine.getNextItem();
   //   if (item.kind === "binary") engine.submitBinary(item.id, value); // value: 1|0
   //   if (item.kind === "likert") engine.submitLikert(item.id, value); // value: 1..5
   // when done:
   const results = engine.getResults();
   const hash = await engine.getRunHash();
*/

// -----------------------------
// Types
// -----------------------------
export type DomainKey = "O" | "C" | "E" | "A" | "N";
export type Bin = 0 | 1;
export type Lik = 1 | 2 | 3 | 4 | 5;

export interface BankItem {
  id: string;
  facet: string;
  q: string;
}

export interface DomainBank {
  picked_binary: BankItem[]; // 6 items
  picked_likert: BankItem[]; // 6 items
  unpicked_stage1_binary: BankItem[]; // 3 items
  unpicked_stage2_likert: BankItem[]; // 3 items
}

export interface ItemBankV1_3 {
  version: string; // "gz_item_bank_v1.3_full"
  scales: { binary: ["Yes", "No"]; likert: string };
  domains: Record<DomainKey, DomainBank>;
}

export interface EngineOpts {
  allowVeryHighUnpicked?: boolean; // default false
  domainOrder?: DomainKey[]; // default ["O","C","E","A","N"]
}

export type NextItem =
  | { kind: "phase1"; prompt: string; choices: DomainKey[]; min: number; max: number }
  | { kind: "binary"; id: string; domain: DomainKey; facet: string; q: string }
  | { kind: "likert"; id: string; domain: DomainKey; facet: string; q: string; scaleHint: string }
  | { kind: "done" };

export interface DomainScore {
  picked: boolean;
  S: number; // 0..1
  bucket: "Very High" | "High" | "Medium" | "Low" | "Very Low";
  V?: number; // yes count for picked domains (0..6)
  B?: number; // mean of binaries (picked: /6, unpicked stage1: /3)
  L?: number; // mean of likerts (normalized 0..1)
  stageUsed?: 1 | 2; // unpicked: 1 or 2
  flags: string[]; // badges (Declared & Verified, etc.)
}

export interface Results {
  version: string;
  policy: { allowVeryHighUnpicked: boolean };
  selectedDomains: DomainKey[]; // from Phase 1
  domainScores: Record<DomainKey, DomainScore>;
  answeredCount: number;
  totalShown: number; // equals answeredCount in linear flows
  runJsonForHash: any; // canonical structure used for hashing (already key-sorted when stringified)
}

// -----------------------------
// Utilities: stable stringify + hashing
// -----------------------------
function stableStringify(obj: any): string {
  const isObj = (v: any) => v && typeof v === "object" && !Array.isArray(v);
  const sorter = (v: any): any => {
    if (Array.isArray(v)) return v.map(sorter);
    if (isObj(v)) {
      const out: any = {};
      Object.keys(v)
        .sort()
        .forEach((k) => {
          out[k] = sorter(v[k]);
        });
      return out;
    }
    return v;
  };
  return JSON.stringify(sorter(obj));
}

async function sha256Hex(input: string): Promise<string> {
  // Browser WebCrypto
  // @ts-ignore
  const subtle = (globalThis.crypto && globalThis.crypto.subtle) || undefined;
  if (subtle) {
    const enc = new TextEncoder();
    const buf = await subtle.digest("SHA-256", enc.encode(input));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Node.js fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createHash } = require("crypto");
    return createHash("sha256").update(input).digest("hex");
  } catch {
    throw new Error("SHA-256 not available in this environment");
  }
}

// -----------------------------
// Scoring helpers (from MVP v1.3)
// -----------------------------
const normLik = (x: Lik) => (x - 1) / 4; // 0..1

function bucket(S: number): DomainScore["bucket"] {
  if (S >= 0.90) return "Very High";
  if (S >= 0.75) return "High";
  if (S >= 0.45) return "Medium";
  if (S >= 0.25) return "Low";
  return "Very Low";
}

function scorePicked(
  P: 0 | 1,
  y: Bin[],
  l: Lik[] | undefined
): { S: number; V: number; B: number; L?: number; usedLikert: boolean } {
  const V = y.reduce((a, b) => a + b, 0);
  const B = V / 6; // {0,1/6,...,1}
  const needLikert = B === 1 / 3 || B === 2 / 3 || (P === 1 && B < 2 / 3);
  if (!needLikert || !l) {
    const S = 0.3 * P + 0.7 * B;
    return { S, V, B, usedLikert: false };
  }
  const L = l.map(normLik).reduce((a, b) => a + b, 0) / l.length;
  const S = 0.25 * P + 0.6 * B + 0.15 * L;
  return { S, V, B, L, usedLikert: true };
}

function scoreUnpicked(
  stage1: Bin[],
  stage2: Lik[] | undefined,
  allowVeryHighUnpicked: boolean
): { S: number; B3: number; L3?: number; stageUsed: 1 | 2 } {
  const S0 = 0.5;
  const B3 = stage1.reduce((a, b) => a + b, 0) / 3; // {0, 1/3, 2/3, 1}
  if (B3 === 0) return { S: 0.12, B3, stageUsed: 1 };
  if (B3 < 2 / 3) return { S: 0.6 * S0 + 0.4 * B3, B3, stageUsed: 1 };
  // Stage-2 path
  if (!stage2) return { S: 0.6 * S0 + 0.4 * B3, B3, stageUsed: 1 };
  const L3 = stage2.map(normLik).reduce((a, b) => a + b, 0) / stage2.length;
  const E = (B3 + L3) / 2;
  const S = allowVeryHighUnpicked ? 0.3 * S0 + 0.7 * E : 0.5 * S0 + 0.5 * E;
  return { S, B3, L3, stageUsed: 2 };
}

// -----------------------------
// Engine
// -----------------------------
export class GZEngine {
  private bank: ItemBankV1_3;
  private opts: Required<EngineOpts>;

  private phase: "phase1" | "picked" | "unpicked" | "done" = "phase1";
  private selected: DomainKey[] = [];

  // iteration order
  private domainOrder: DomainKey[];
  private pickedQueue: DomainKey[] = [];
  private unpickedQueue: DomainKey[] = [];
  private currentDomain: DomainKey | null = null;

  // per-domain answer state
  private pickedAnswers: Record<DomainKey, { bin: Record<string, Bin>; lik?: Record<string, Lik> }> = {
    O: { bin: {} },
    C: { bin: {} },
    E: { bin: {} },
    A: { bin: {} },
    N: { bin: {} },
  };
  private unpickedAnswers: Record<DomainKey, { stage1: Record<string, Bin>; stage2?: Record<string, Lik> }> = {
    O: { stage1: {} },
    C: { stage1: {} },
    E: { stage1: {} },
    A: { stage1: {} },
    N: { stage1: {} },
  };

  // progress
  private answeredCount = 0;

  constructor(bank: ItemBankV1_3, opts: EngineOpts = {}) {
    this.bank = bank;
    this.opts = {
      allowVeryHighUnpicked: opts.allowVeryHighUnpicked ?? false,
      domainOrder: opts.domainOrder ?? ["O", "C", "E", "A", "N"],
    };
    this.domainOrder = [...this.opts.domainOrder];
  }

  // -------------------------
  // Phase 1
  // -------------------------
  getNextItem(): NextItem {
    if (this.phase === "phase1") {
      return {
        kind: "phase1",
        prompt: "When it’s real and you must act, which 2 or 3 domains do you lean on?",
        choices: this.domainOrder,
        min: 2,
        max: 3,
      };
    }

    if (this.phase === "picked") {
      const d = this.currentDomain as DomainKey;
      const db = this.bank.domains[d];
      // 1) pending picked binaries
      for (const item of db.picked_binary) {
        if (this.pickedAnswers[d].bin[item.id] === undefined) {
          return { kind: "binary", id: item.id, domain: d, facet: item.facet, q: item.q };
        }
      }
      // 2) decide if Likert needed
      const binVals = db.picked_binary.map((it) => this.pickedAnswers[d].bin[it.id] ?? 0);
      const V = binVals.reduce((a, b) => a + b, 0);
      const B = V / 6;
      const needLikert = B === 1 / 3 || B === 2 / 3 || B < 2 / 3; // P=1 always when in picked phase
      if (needLikert) {
        // ask Likerts if any missing
        for (const item of db.picked_likert) {
          const lrec = this.pickedAnswers[d].lik || (this.pickedAnswers[d].lik = {});
          if (lrec[item.id] === undefined) {
            return {
              kind: "likert",
              id: item.id,
              domain: d,
              facet: item.facet,
              q: item.q,
              scaleHint: this.bank.scales.likert,
            };
          }
        }
      }
      // domain complete → move to next picked or unpicked
      this.advanceDomainPointer();
      return this.getNextItem();
    }

    if (this.phase === "unpicked") {
      const d = this.currentDomain as DomainKey;
      const db = this.bank.domains[d];
      // Stage-1 binaries first
      for (const item of db.unpicked_stage1_binary) {
        if (this.unpickedAnswers[d].stage1[item.id] === undefined) {
          return { kind: "binary", id: item.id, domain: d, facet: item.facet, q: item.q };
        }
      }
      // Decide if Stage-2 needed
      const b3Vals = db.unpicked_stage1_binary.map((it) => this.unpickedAnswers[d].stage1[it.id] ?? 0);
      const B3 = b3Vals.reduce((a, b) => a + b, 0) / 3;
      const needStage2 = B3 >= 2 / 3;
      if (needStage2) {
        for (const item of db.unpicked_stage2_likert) {
          const stage2 = this.unpickedAnswers[d].stage2 || (this.unpickedAnswers[d].stage2 = {});
          if (stage2[item.id] === undefined) {
            return {
              kind: "likert",
              id: item.id,
              domain: d,
              facet: item.facet,
              q: item.q,
              scaleHint: this.bank.scales.likert,
            };
          }
        }
      }
      // domain complete → next
      this.advanceDomainPointer();
      return this.getNextItem();
    }

    return { kind: "done" };
  }

  submitPhase1(domains: DomainKey[]) {
    if (this.phase !== "phase1") throw new Error("Phase 1 already completed");
    const uniq = Array.from(new Set(domains));
    if (uniq.length < 2 || uniq.length > 3) throw new Error("Pick 2 or 3 domains");
    // Validate keys
    uniq.forEach((d) => {
      if (!this.bank.domains[d]) throw new Error(`Unknown domain ${d}`);
    });
    this.selected = uniq;
    this.answeredCount += 1; // phase1 multi-select counts as 1 answer action

    // Prepare queues: picked first in selected order, then unpicked in domainOrder
    this.pickedQueue = [...uniq];
    this.unpickedQueue = this.domainOrder.filter((d) => !uniq.includes(d));

    // start with first picked domain
    this.currentDomain = this.pickedQueue.shift() ?? null;
    this.phase = this.currentDomain ? "picked" : "unpicked";
    if (!this.currentDomain) {
      // edge case: no picked (should not happen)
      this.currentDomain = this.unpickedQueue.shift() ?? null;
    }
  }

  submitBinary(id: string, value: Bin) {
    if (this.phase !== "picked" && this.phase !== "unpicked") throw new Error("Not collecting binaries now");
    const d = this.currentDomain as DomainKey;
    const db = this.bank.domains[d];
    const inPicked = db.picked_binary.some((it) => it.id === id);
    const inUnpicked = db.unpicked_stage1_binary.some((it) => it.id === id);
    if (!inPicked && !inUnpicked) throw new Error(`Binary id not in current domain: ${id}`);
    if (inPicked) this.pickedAnswers[d].bin[id] = value;
    else this.unpickedAnswers[d].stage1[id] = value;
    this.answeredCount += 1;
  }

  submitLikert(id: string, value: Lik) {
    if (this.phase !== "picked" && this.phase !== "unpicked") throw new Error("Not collecting likerts now");
    const d = this.currentDomain as DomainKey;
    const db = this.bank.domains[d];
    const inPicked = db.picked_likert.some((it) => it.id === id);
    const inUnpicked = db.unpicked_stage2_likert.some((it) => it.id === id);
    if (!inPicked && !inUnpicked) throw new Error(`Likert id not in current domain: ${id}`);
    if (inPicked) {
      const lrec = this.pickedAnswers[d].lik || (this.pickedAnswers[d].lik = {});
      lrec[id] = value;
    } else {
      const s2 = this.unpickedAnswers[d].stage2 || (this.unpickedAnswers[d].stage2 = {});
      s2[id] = value;
    }
    this.answeredCount += 1;
  }

  private advanceDomainPointer() {
    // move within picked → next picked; when done → unpicked; when done → done
    if (this.phase === "picked") {
      this.currentDomain = this.pickedQueue.shift() ?? null;
      if (!this.currentDomain) {
        this.currentDomain = this.unpickedQueue.shift() ?? null;
        this.phase = this.currentDomain ? "unpicked" : "done";
      }
      return;
    }
    if (this.phase === "unpicked") {
      this.currentDomain = this.unpickedQueue.shift() ?? null;
      if (!this.currentDomain) this.phase = "done";
    }
  }

  // -------------------------
  // Results
  // -------------------------
  getResults(): Results {
    if (this.phase !== "done") {
      // It's fine to call mid-run; we'll compute provisional scores for completed domains only
    }

    const policy = { allowVeryHighUnpicked: this.opts.allowVeryHighUnpicked };
    const selectedDomains = [...this.selected];

    const domainScores: Record<DomainKey, DomainScore> = {
      O: this.scoreDomain("O"),
      C: this.scoreDomain("C"),
      E: this.scoreDomain("E"),
      A: this.scoreDomain("A"),
      N: this.scoreDomain("N"),
    };

    // Flags
    for (const d of this.domainOrder) {
      const ds = domainScores[d];
      const P = selectedDomains.includes(d) ? 1 : 0;
      if (P === 1 && ds.S >= 0.70) ds.flags.push("Declared & Verified");
      if (P === 1 && ds.S < 0.45) ds.flags.push("Claimed but Unverified");
      if (P === 0 && ds.S >= 0.70) ds.flags.push("Unclaimed Strength");
      if (P === 1 && ds.S >= 0.45 && ds.S < 0.70) ds.flags.push("Fragile Claim");
      // Provisional label when stage-2 was needed but missing
      if (!ds.picked && ds.stageUsed === 1) {
        // In unpicked flow, stageUsed=1 could be either final or provisional; detect provisional by trigger condition
        const stage1 = this.unpickedAnswers[d];
        const B3 = this.bank.domains[d].unpicked_stage1_binary
          .map((it) => stage1.stage1[it.id] ?? 0)
          .reduce((a, b) => a + b, 0) / 3;
        if (B3 >= 2 / 3 && Object.keys(stage1.stage2 ?? {}).length === 0) {
          ds.flags.push("Provisional (needs Stage-2)");
        }
      }
    }

    const runJsonForHash = {
      v: this.bank.version,
      policy,
      selectedDomains,
      answers: this.serializeAnswers(),
      domainScores,
    };

    return {
      version: this.bank.version,
      policy,
      selectedDomains,
      domainScores,
      answeredCount: this.answeredCount,
      totalShown: this.answeredCount,
      runJsonForHash,
    };
  }

  private scoreDomain(d: DomainKey): DomainScore {
    const picked = this.selected.includes(d);
    if (picked) {
      const db = this.bank.domains[d];
      const y = db.picked_binary.map((it) => this.pickedAnswers[d].bin[it.id]).filter((v) => v !== undefined) as Bin[];
      const l = db.picked_likert.map((it) => this.pickedAnswers[d].lik?.[it.id]).filter((v) => v !== undefined) as Lik[];
      if (y.length === 0) return { picked: true, S: 0.3, bucket: bucket(0.3), flags: [] }; // minimal prior if no data
      const { S, V, B, L, usedLikert } = scorePicked(1, y, l.length === 6 ? l : undefined);
      return { picked: true, S, bucket: bucket(S), V, B, L, flags: [] };
    }
    // unpicked
    const db = this.bank.domains[d];
    const s1 = db.unpicked_stage1_binary.map((it) => this.unpickedAnswers[d].stage1[it.id]).filter((v) => v !== undefined) as Bin[];
    if (s1.length === 0) {
      const S = 0.5; // prior Medium
      return { picked: false, S, bucket: bucket(S), B: 0, stageUsed: 1, flags: [] };
    }
    const s2 = db.unpicked_stage2_likert.map((it) => this.unpickedAnswers[d].stage2?.[it.id]).filter((v) => v !== undefined) as Lik[];
    const { S, B3, L3, stageUsed } = scoreUnpicked(s1, s2.length === 3 ? s2 : undefined, this.opts.allowVeryHighUnpicked);
    return { picked: false, S, bucket: bucket(S), B: B3, L: L3, stageUsed, flags: [] };
  }

  private serializeAnswers() {
    const out: { id: string; v: number }[] = [];
    // Phase 1 selection is captured separately; here we capture item answers in deterministic order
    for (const d of this.domainOrder) {
      const db = this.bank.domains[d];
      for (const it of db.picked_binary) {
        const v = this.pickedAnswers[d].bin[it.id];
        if (v !== undefined) out.push({ id: it.id, v });
      }
      for (const it of db.picked_likert) {
        const v = this.pickedAnswers[d].lik?.[it.id];
        if (v !== undefined) out.push({ id: it.id, v });
      }
      for (const it of db.unpicked_stage1_binary) {
        const v = this.unpickedAnswers[d].stage1[it.id];
        if (v !== undefined) out.push({ id: it.id, v });
      }
      for (const it of db.unpicked_stage2_likert) {
        const v = this.unpickedAnswers[d].stage2?.[it.id];
        if (v !== undefined) out.push({ id: it.id, v });
      }
    }
    return out;
  }

  async getRunHash(): Promise<string> {
    const res = this.getResults();
    return sha256Hex(stableStringify(res.runJsonForHash));
  }

  // Progress helper
  getProgress() {
    // Estimated remaining can be computed by counting unanswered items based on gates to date.
    const remaining = this.estimateRemaining();
    return {
      answered: this.answeredCount,
      remaining,
      done: this.phase === "done",
      phase: this.phase,
      currentDomain: this.currentDomain,
    };
  }

  private estimateRemaining(): number {
    let rem = 0;
    if (this.phase === "phase1") return 1; // the phase-1 multi-select

    // For current domain, count outstanding items based on what is already answered
    const countDomain = (d: DomainKey) => {
      const db = this.bank.domains[d];
      if (this.selected.includes(d)) {
        // picked: remaining binaries
        rem += db.picked_binary.filter((it) => this.pickedAnswers[d].bin[it.id] === undefined).length;
        // decide gate on current answers
        const V = db.picked_binary.map((it) => this.pickedAnswers[d].bin[it.id] ?? 0).reduce((a, b) => a + b, 0);
        const B = V / 6;
        const needLikert = B === 1 / 3 || B === 2 / 3 || B < 2 / 3;
        if (needLikert) rem += db.picked_likert.filter((it) => (this.pickedAnswers[d].lik || {})[it.id] === undefined).length;
      } else {
        // unpicked: remaining stage1
        rem += db.unpicked_stage1_binary.filter((it) => this.unpickedAnswers[d].stage1[it.id] === undefined).length;
        const B3 = db.unpicked_stage1_binary
          .map((it) => this.unpickedAnswers[d].stage1[it.id] ?? 0)
          .reduce((a, b) => a + b, 0) / 3;
        if (B3 >= 2 / 3) rem += db.unpicked_stage2_likert.filter((it) => (this.unpickedAnswers[d].stage2 || {})[it.id] === undefined).length;
      }
    };

    // current domain first
    if (this.currentDomain) countDomain(this.currentDomain);

    // remaining domains in queues
    for (const d of this.pickedQueue) countDomain(d);
    for (const d of this.unpickedQueue) countDomain(d);

    return rem;
  }
}
