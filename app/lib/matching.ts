import { detectSkills, normalize, splitList } from "./extract";

type CandidateLike = {
  rawText: string;
  skills: string;
  experienceYears: number | null;
  location: string | null;
};

type JobLike = {
  mustHave: string;
  shouldHave: string;
  optional: string;
  location: string | null;
};

const SYNONYMS: Record<string, string[]> = {
  "intelligence artificielle generative": ["ia generative", "genai", "openai", "llm"],
  "automatisation des processus": ["automatisation", "workflow automatise", "workflows automatises", "n8n"],
  "analyse des besoins metiers": ["recueil des besoins", "besoins metiers", "cadrage fonctionnel"],
  "conception d assistants ou agents ia": ["assistant ia", "assistants ia", "agent ia", "agents ia", "assistant conversationnel"],
  "gestion de projet digital": ["chef de projet digital", "cheffe de projet digital", "pilotage de projets web", "pilotage de projet digital", "product owner"],
  "creation de workflows": ["workflow", "workflows", "n8n", "automatisation"],
  "conseil aupres d entreprises": ["consultant", "conseil", "accompagnement de pme", "accompagnement clients", "ateliers clients"],
  "integration d outils saas": ["saas", "hubspot", "crm", "api rest", "integration"]
};

function criterionHit(criterion: string, rawText: string): boolean {
  const text = ` ${normalize(rawText)} `;
  const c = normalize(criterion.replace(/\b\d+\s+ans.*$/i, "").trim());
  if (!c) return true;
  if (text.includes(c)) return true;

  const aliases = SYNONYMS[c] ?? [];
  if (aliases.some((a) => text.includes(normalize(a)))) return true;

  const tokens = c
    .split(" ")
    .filter((t) => t.length >= 4 && !["avec", "dans", "pour", "plus", "experience", "professionnel", "professionnelle"].includes(t));
  if (tokens.length >= 2) {
    const hits = tokens.filter((t) => text.includes(t)).length;
    if (hits / tokens.length >= 0.67) return true;
  }
  return false;
}

export function explainMatch(job: JobLike, candidate: CandidateLike) {
  const rawText = `${candidate.rawText} ${candidate.location ?? ""}`;
  const detectedSkills = detectSkills(candidate.rawText);

  const must = splitList(job.mustHave);
  const should = splitList(job.shouldHave);
  const optional = splitList(job.optional);

  const evalCriteria = (items: string[]) =>
    items.map((criterion) => ({ criterion, hit: criterionHit(criterion, rawText) }));

  const mustEval = evalCriteria(must);
  const shouldEval = evalCriteria(should);
  const optionalEval = evalCriteria(optional);

  const matched = [...mustEval, ...shouldEval, ...optionalEval].filter((x) => x.hit);
  const missing = [...mustEval, ...shouldEval].filter((x) => !x.hit);

  const ratio = (items: { hit: boolean }[]) => items.length ? items.filter((x) => x.hit).length / items.length : 1;
  const mustRatio = ratio(mustEval);
  const shouldRatio = ratio(shouldEval);
  const optionalRatio = ratio(optionalEval);

  let score = Math.round(mustRatio * 65 + shouldRatio * 25 + optionalRatio * 10);

  const requiredYears = Number(job.mustHave.match(/\b(\d+)\s+ans/i)?.[1] || 0);
  if (requiredYears > 0) {
    if (candidate.experienceYears == null) score = Math.max(0, score - 5);
    else if (candidate.experienceYears < requiredYears) score = Math.min(score, 69);
  }

  score = Math.max(0, Math.min(100, score));

  const questions = missing.slice(0, 5).map((m) => `Pouvez-vous préciser votre expérience concernant : ${m.criterion} ?`);
  const explanation =
    `Critères indispensables ${Math.round(mustRatio * 100)} %, souhaitables ${Math.round(shouldRatio * 100)} %, ` +
    `optionnels ${Math.round(optionalRatio * 100)} %. Compétences détectées : ${detectedSkills.join(", ") || "aucune compétence structurée détectée"}. ` +
    `Ce score est une aide au tri et ne constitue jamais une décision automatique.`;

  return {
    score,
    matched: matched.map((x) => x.criterion),
    missing: missing.map((x) => x.criterion),
    questions,
    explanation,
    detectedSkills
  };
}
