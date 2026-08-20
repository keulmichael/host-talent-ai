export function splitList(value: string): string[] {
  return value
    .split(/[,;\n]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SKILL_GROUPS: Array<{ label: string; aliases: string[] }> = [
  { label: "Intelligence artificielle générative", aliases: ["intelligence artificielle generative", "ia generative", "genai", "generative ai"] },
  { label: "Automatisation des processus", aliases: ["automatisation des processus", "automatisation de processus", "workflow automatise", "workflows automatises", "automation"] },
  { label: "Analyse des besoins métiers", aliases: ["analyse des besoins metiers", "recueil des besoins", "besoins metiers", "cadrage fonctionnel"] },
  { label: "Assistants / Agents IA", aliases: ["assistant ia", "assistants ia", "agent ia", "agents ia", "assistant conversationnel"] },
  { label: "Gestion de projet digital", aliases: ["gestion de projet digital", "chef de projet digital", "cheffe de projet digital", "pilotage de projets web", "pilotage de projet digital"] },
  { label: "n8n", aliases: ["n8n"] },
  { label: "API REST", aliases: ["api rest", "rest api"] },
  { label: "OpenAI / LLM", aliases: ["openai", "llm", "large language model"] },
  { label: "TypeScript", aliases: ["typescript"] },
  { label: "JavaScript", aliases: ["javascript"] },
  { label: "Next.js", aliases: ["next.js", "nextjs"] },
  { label: "React", aliases: ["react"] },
  { label: "Node.js", aliases: ["node.js", "nodejs"] },
  { label: "Python", aliases: ["python"] },
  { label: "Java", aliases: [" java ", "java developer", "java spring"] },
  { label: "PHP", aliases: ["php"] },
  { label: "Salesforce", aliases: ["salesforce"] },
  { label: "SAP", aliases: ["sap"] },
  { label: "SEO", aliases: ["seo", "referencement naturel"] },
  { label: "GEO", aliases: ["geo", "generative engine optimization"] },
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

function isNegated(text: string, alias: string): boolean {
  const idx = text.indexOf(alias);
  if (idx < 0) return false;
  const before = text.slice(Math.max(0, idx - 65), idx);
  return /(pas d experience|pas d’expérience|aucune experience|aucune expérience|sans experience|sans expérience|experience limitee|expérience limitée|pas de pratique|non maitrise|non maîtrisé)/i.test(before);
}

export function detectSkills(rawText: string): string[] {
  const n = ` ${normalize(rawText)} `;
  return SKILL_GROUPS
    .filter(({ aliases }) => aliases.some((a) => {
      const alias = normalize(a);
      return n.includes(alias) && !isNegated(n, alias);
    }))
    .map((x) => x.label);
}

export function extractCandidate(rawText: string) {
  const text = rawText.replace(/\s+/g, " ").trim();
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const yearsMatches = [...text.matchAll(/(\d{1,2})\s*(?:ans|annees|années)\s+(?:d['’]?experience|d’expérience|d'experience)/gi)]
    .map((m) => Number(m[1]))
    .filter(Number.isFinite);
  const years = yearsMatches.length ? Math.max(...yearsMatches) : null;
  const skills = detectSkills(text);
  const summary = text.length > 520 ? text.slice(0, 520) + "…" : text;

  return { email, years, skills, summary };
}
