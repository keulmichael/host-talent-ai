export function splitList(value: string): string[] {
  return value.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
}

export function normalize(value: string): string {
  return value.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[’']/g, " ").replace(/[^a-z0-9+#.\s-]/g, " ").replace(/\s+/g, " ").trim();
}

type SkillGroup = { label: string; aliases: string[] };

export const SKILL_GROUPS: SkillGroup[] = [
  { label: "Intelligence artificielle générative", aliases: ["intelligence artificielle generative", "ia generative", "genai", "generative ai"] },
  { label: "Automatisation des processus", aliases: ["automatisation des processus", "automatisation de processus", "automatisation", "workflow automatise", "workflows automatises", "automation"] },
  { label: "Analyse des besoins métiers", aliases: ["analyse des besoins metiers", "recueil des besoins", "besoins metiers", "cadrage fonctionnel", "expression des besoins"] },
  { label: "Assistants / Agents IA", aliases: ["assistant ia", "assistants ia", "agent ia", "agents ia", "assistant conversationnel"] },
  { label: "Gestion de projet digital", aliases: ["gestion de projet digital", "chef de projet digital", "cheffe de projet digital", "pilotage de projets web", "pilotage de projet digital", "product owner"] },
  { label: "n8n", aliases: ["n8n"] },
  { label: "API REST", aliases: ["api rest", "rest api"] },
  { label: "OpenAI / LLM", aliases: ["openai", "llm", "large language model", "gpt"] },
  { label: "TypeScript", aliases: ["typescript"] },
  { label: "JavaScript", aliases: ["javascript"] },
  { label: "Next.js", aliases: ["next.js", "nextjs"] },
  { label: "React", aliases: ["react"] },
  { label: "Node.js", aliases: ["node.js", "nodejs"] },
  { label: "Python", aliases: ["python"] },
  { label: "Java", aliases: ["java developer", "java spring", "java jee", "java/j2ee"] },
  { label: "PHP", aliases: ["php"] },
  { label: "Salesforce", aliases: ["salesforce"] },
  { label: "SAP", aliases: ["sap"] },
  { label: "SEO", aliases: ["seo", "referencement naturel"] },
  { label: "GEO", aliases: ["generative engine optimization", "optimisation geo"] },
  { label: "Google Ads", aliases: ["google ads", "adwords"] },
  { label: "HubSpot", aliases: ["hubspot"] },
  { label: "CRM", aliases: ["crm"] },
  { label: "Power BI", aliases: ["power bi", "powerbi"] },
  { label: "SQL", aliases: ["sql"] },
  { label: "AWS", aliases: ["aws", "amazon web services"] },
  { label: "Azure", aliases: ["azure"] },
  { label: "Docker", aliases: ["docker"] },
  { label: "Kubernetes", aliases: ["kubernetes"] },
  { label: "Figma", aliases: ["figma"] },
  { label: "SaaS B2B", aliases: ["saas b2b", "saas"] },
  { label: "Anglais professionnel", aliases: ["anglais professionnel", "english professional", "professional english"] }
];

const NEGATION_PATTERNS = [
  /aucune?\s+(?:experience|pratique|maitrise)/,
  /pas\s+d\s+(?:experience|expertise|pratique)/,
  /sans\s+(?:experience|expertise|pratique|maitrise)/,
  /experience\s+(?:limitee|faible|minimale)/,
  /notions?\s+(?:seulement|uniquement)/,
  /(?:non|peu)\s+(?:maitrise|maitrise|experimente|experimentee|operationnel|operationnelle)/,
  /veille\s+(?:sur|autour de)/
];

function occurrences(text: string, needle: string): number[] {
  const out: number[] = [];
  let start = 0;
  while (true) {
    const i = text.indexOf(needle, start);
    if (i < 0) break;
    out.push(i);
    start = i + Math.max(1, needle.length);
  }
  return out;
}

export function aliasEvidence(rawText: string, aliasRaw: string): { positive: boolean; negated: boolean } {
  const text = ` ${normalize(rawText)} `;
  const alias = normalize(aliasRaw);
  if (!alias) return { positive: false, negated: false };
  const hits = occurrences(text, alias);
  if (!hits.length) return { positive: false, negated: false };
  let negated = false;
  for (const idx of hits) {
    const before = text.slice(Math.max(0, idx - 90), idx);
    const after = text.slice(idx + alias.length, Math.min(text.length, idx + alias.length + 55));
    const context = `${before} ${after}`;
    if (NEGATION_PATTERNS.some((p) => p.test(context))) negated = true;
    else return { positive: true, negated };
  }
  return { positive: false, negated };
}

export function detectSkills(rawText: string): string[] {
  return SKILL_GROUPS.filter(({ aliases }) => aliases.some((a) => aliasEvidence(rawText, a).positive)).map((x) => x.label);
}

export function detectNegatedSkills(rawText: string): string[] {
  return SKILL_GROUPS.filter(({ aliases }) => {
    const evidence = aliases.map((a) => aliasEvidence(rawText, a));
    return evidence.some((e) => e.negated) && !evidence.some((e) => e.positive);
  }).map((x) => x.label);
}

export function extractCandidate(rawText: string) {
  const text = rawText.replace(/\s+/g, " ").trim();
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const yearsMatches = [...text.matchAll(/(\d{1,2})\s*(?:ans|annees|années)\s+(?:d['’]?experience|d’expérience|d'experience)/gi)].map((m) => Number(m[1])).filter(Number.isFinite);
  const years = yearsMatches.length ? Math.max(...yearsMatches) : null;
  const skills = detectSkills(text);
  const summary = text.length > 650 ? text.slice(0, 650) + "…" : text;
  return { email, years, skills, summary };
}
