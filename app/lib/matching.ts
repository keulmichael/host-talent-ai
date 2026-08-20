import { aliasEvidence, detectNegatedSkills, detectSkills, normalize, splitList } from "./extract";

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

type CriterionResult = { criterion: string; hit: boolean; negated: boolean; confidence: "high" | "medium" | "low" };

const SYNONYMS: Record<string, string[]> = {
  "intelligence artificielle generative": ["intelligence artificielle generative", "ia generative", "genai", "openai", "llm", "gpt"],
  "automatisation des processus": ["automatisation des processus", "automatisation", "workflow automatise", "workflows automatises", "n8n", "automation"],
  "analyse des besoins metiers": ["analyse des besoins metiers", "recueil des besoins", "expression des besoins", "cadrage fonctionnel", "besoins metiers"],
  "conception d assistants ou agents ia": ["assistant ia", "assistants ia", "agent ia", "agents ia", "assistant conversationnel"],
  "gestion de projet digital": ["gestion de projet digital", "chef de projet digital", "cheffe de projet digital", "pilotage de projets web", "pilotage de projet digital", "product owner"],
  "n8n": ["n8n"],
  "api rest": ["api rest", "rest api"],
  "openai ou autres llm": ["openai", "llm", "gpt", "large language model"],
  "openai autres llm": ["openai", "llm", "gpt", "large language model"],
  "integration d outils saas": ["integration d outils saas", "saas", "hubspot", "crm", "integration api"],
  "creation de workflows": ["creation de workflows", "workflow", "workflows", "n8n", "automatisation"],
  "conseil aupres d entreprises": ["consultant", "consultante", "conseil", "accompagnement clients", "accompagnement de pme", "ateliers clients"],
  "formation ou accompagnement des utilisateurs": ["formation", "accompagnement des utilisateurs", "accompagnement au changement", "ateliers utilisateurs"],
  "typescript": ["typescript"],
  "next.js": ["next.js", "nextjs"],
  "crm": ["crm", "hubspot", "salesforce"]
};

function stripExperienceConstraint(criterion: string): string {
  return criterion.replace(/\b\d+\s+ans(?:\s+d['’ ]?experience)?/i, "").trim();
}

function criterionEvidence(criterion: string, rawText: string): CriterionResult {
  const normalizedCriterion = normalize(stripExperienceConstraint(criterion));
  if (!normalizedCriterion) return { criterion, hit: true, negated: false, confidence: "high" };

  const aliases = SYNONYMS[normalizedCriterion] ?? [normalizedCriterion];
  const evidences = aliases.map((a) => aliasEvidence(rawText, a));
  if (evidences.some((e) => e.positive)) {
    return { criterion, hit: true, negated: false, confidence: "high" };
  }
  if (evidences.some((e) => e.negated)) {
    return { criterion, hit: false, negated: true, confidence: "high" };
  }

  const text = normalize(rawText);
  const stop = new Set(["avec", "dans", "pour", "plus", "experience", "professionnel", "professionnelle", "autres", "outils", "creation", "conception"]);
  const tokens = normalizedCriterion.split(" ").filter((t) => t.length >= 4 && !stop.has(t));
  if (tokens.length >= 2) {
    const count = tokens.filter((t) => text.includes(t)).length;
    const ratio = count / tokens.length;
    if (ratio >= 0.8) return { criterion, hit: true, negated: false, confidence: "medium" };
  }
  return { criterion, hit: false, negated: false, confidence: "low" };
}

function ratio(items: CriterionResult[]): number {
  return items.length ? items.filter((x) => x.hit).length / items.length : 1;
}

export function explainMatch(job: JobLike, candidate: CandidateLike) {
  const rawText = `${candidate.rawText} ${candidate.location ?? ""}`;
  const detectedSkills = detectSkills(candidate.rawText);
  const negatedSkills = detectNegatedSkills(candidate.rawText);

  const mustEval = splitList(job.mustHave).map((c) => criterionEvidence(c, rawText));
  const shouldEval = splitList(job.shouldHave).map((c) => criterionEvidence(c, rawText));
  const optionalEval = splitList(job.optional).map((c) => criterionEvidence(c, rawText));

  const all = [...mustEval, ...shouldEval, ...optionalEval];
  const matched = all.filter((x) => x.hit);
  const missing = [...mustEval, ...shouldEval].filter((x) => !x.hit);
  const negated = all.filter((x) => x.negated);

  const mustRatio = ratio(mustEval);
  const shouldRatio = ratio(shouldEval);
  const optionalRatio = ratio(optionalEval);
  let score = Math.round(mustRatio * 65 + shouldRatio * 25 + optionalRatio * 10);

  const requiredYears = Number(job.mustHave.match(/\b(\d+)\s+ans/i)?.[1] || 0);
  if (requiredYears > 0) {
    if (candidate.experienceYears == null) score -= 4;
    else if (candidate.experienceYears < requiredYears) score = Math.min(score, 64);
  }

  score -= Math.min(18, negated.length * 6);
  const mediumHits = matched.filter((x) => x.confidence === "medium").length;
  if (mediumHits > 0) score -= Math.min(6, mediumHits * 2);
  score = Math.max(0, Math.min(100, score));

  const questions = missing.slice(0, 5).map((m) => m.negated
    ? `Votre CV semble indiquer une expérience limitée ou absente concernant « ${m.criterion} ». Pouvez-vous confirmer votre niveau réel ?`
    : `Pouvez-vous préciser votre expérience concernant : ${m.criterion} ?`);

  const verdict = score >= 85 ? "Très forte adéquation" : score >= 70 ? "Bonne adéquation" : score >= 55 ? "Adéquation partielle" : score >= 40 ? "Profil à approfondir" : "Faible adéquation apparente";
  const explanation =
    `${verdict}. Critères indispensables ${Math.round(mustRatio * 100)} %, souhaitables ${Math.round(shouldRatio * 100)} %, optionnels ${Math.round(optionalRatio * 100)} %. ` +
    `Compétences positives détectées : ${detectedSkills.join(", ") || "aucune"}. ` +
    `${negatedSkills.length ? `Compétences mentionnées dans un contexte négatif/limité : ${negatedSkills.join(", ")}. ` : ""}` +
    `Le score sert uniquement d'aide à l'examen et ne constitue jamais une décision automatique.`;

  return {
    score,
    matched: matched.map((x) => x.criterion),
    missing: missing.map((x) => x.criterion),
    questions,
    explanation,
    detectedSkills,
    negatedSkills,
    verdict
  };
}
