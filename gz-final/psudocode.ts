type Bin = 0|1;
type Lik = 1|2|3|4|5;
const norm = (x:Lik)=> (x-1)/4;

function scorePicked(P:0|1, y:Bin[], l?:Lik[]): number {
  const V = y.reduce((a,b)=>a+b,0);
  const B = V/6; // {0,1/6,...,1}
  const needLikert = (B===1/3 || B===2/3) || (P===1 && B<2/3);
  if (!needLikert || !l) return 0.30*P + 0.70*B;
  const L = l.map(norm).reduce((a,b)=>a+b,0)/l.length;
  return 0.25*P + 0.60*B + 0.15*L;
}

function scoreUnpicked(stage1:Bin[], stage2?:Lik[], allowVeryHighUnpicked=false): number {
  const S0 = 0.50;
  const B3 = stage1.reduce((a,b)=>a+b,0)/3; // {0,1/3,2/3,1}
  if (B3===0) return 0.12;                  // Very Low
  if (B3<2/3) return 0.6*S0 + 0.4*B3;       // stop
  // B3 ≥ 2/3 ⇒ Stage-2
  if (!stage2) return 0.6*S0 + 0.4*B3;      // provisional
  const L3 = stage2.map(norm).reduce((a,b)=>a+b,0)/stage2.length;
  const E  = (B3 + L3)/2;
  return allowVeryHighUnpicked ? (0.3*S0 + 0.7*E) : (0.5*S0 + 0.5*E);
}

function bucket(S:number){
  if (S >= 0.90) return "Very High";
  if (S >= 0.75) return "High";
  if (S >= 0.45) return "Medium";
  if (S >= 0.25) return "Low";
  return "Very Low";
}
