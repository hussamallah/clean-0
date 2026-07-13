import fs from 'fs';

const kt = fs.readFileSync(
  'C:/project 2.0/ground zero app2.0/app/src/main/java/com/example/groundzero/results/CompatibilityReportCopy.kt',
  'utf8',
);

function extractToQuotedPairs(text) {
  const out = {};
  const re = /"([^"]+)"\s+to\s*\n\s+"([\s\S]*?)"/g;
  let m;
  while ((m = re.exec(text))) {
    out[m[1]] = m[2];
  }
  return out;
}

const domain = {};
for (const d of ['O', 'C', 'E', 'A', 'N']) {
  const re = new RegExp(`"${d}" to mapOf\\(([\\s\\S]*?)\\n        \\)`, 'm');
  const sm = kt.match(re);
  if (sm) domain[d] = extractToQuotedPairs(sm[1]);
}

const conflictBlock = kt.match(
  /facetConflictDescriptions: Map<String, String> = mapOf\(([\s\S]*?)\n    \)\n\n    fun facetConflictDescription/,
);
const alignBlock = kt.match(
  /facetAlignDescriptions: Map<String, String> = mapOf\(([\s\S]*?)\n    \)\n\n    fun facetAlignDescription/,
);

const intros = {
  howItWorksIntro:
    kt.match(/howItWorksIntro: String =\s*\n\s*"([\s\S]*?)"/)?.[1]?.replace(/\s+/g, ' ').trim() ?? '',
  keyDynamicsIntro:
    kt.match(/keyDynamicsIntro: String =\s*\n\s*"([\s\S]*?)"/)?.[1]?.replace(/\s+/g, ' ').trim() ?? '',
  playbooksIntro:
    kt.match(/playbooksIntro: String =\s*\n\s*"([\s\S]*?)"/)?.[1]?.replace(/\s+/g, ' ').trim() ?? '',
  scenariosIntro:
    kt.match(/scenariosIntro: String =\s*\n\s*"([\s\S]*?)"/)?.[1]?.replace(/\s+/g, ' ').trim() ?? '',
};

const payload = {
  domainSynergy: domain,
  facetConflict: conflictBlock ? extractToQuotedPairs(conflictBlock[1]) : {},
  facetAlign: alignBlock ? extractToQuotedPairs(alignBlock[1]) : {},
  intros,
};

fs.writeFileSync(
  'c:/clean-0-master/clean-0-master/lib/data/compatibility_report_copy.json',
  JSON.stringify(payload, null, 2),
);
console.log(
  'ok',
  Object.keys(domain.O || {}).length,
  Object.keys(payload.facetConflict).length,
  Object.keys(payload.facetAlign).length,
  intros.howItWorksIntro.slice(0, 40),
);
