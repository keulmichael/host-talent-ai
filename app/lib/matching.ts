import { normalize, splitList } from "./extract";

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

export function explainMatch(job: JobLike, candidate: CandidateLike) {
  const text = normalize(`${candidate.rawText} ${candidate.skills} ${candidate.location ?? ""}`);

  const must = splitList(job.mustHave);
  const should = splitList(job.shouldHave);
  const optional = splitList(job.optional);

  const evalCriteria = (items: string[]) =>
    items.map((criterion) => ({
      criterion,
      hit: text.includes(normalize(criterion.replace(/\b\d+\s+ans.*$/i, "").trim()))
    }));

  const mustEval = evalCriteria(must);
  const shouldEval = evalCriteria(should);
  const optionalEval = evalCriteria(optional);

  const matched = [...mustEval, ...shouldEval, ...optionalEval].filter((x) => x.hit);
  const missing = mustEval.filter((x) => !x.hit);

  const mustRatio = mustEval.length ? mustEval.filter(x => x.hit).length / mustEval.length : 1;
  const shouldRatio = shouldEval.length ? shouldEval.filter(x => x.hit).length / shouldEval.length : 1;
  const optionalRatio = optionalEval.length ? optionalEval.filter(x => x.hit).length / optionalEval.length : 1;

  let score = Math.round(mustRatio * 65 + shouldRatio * 25 + optionalRatio * 10);
  if (candidate.experienceYears && /\b(\d+)\s+ans/i.test(job.mustHave)) {
    const required = Number(job.mustHave.match(/\b(\d+)\s+ans/i)?.[1] || 0);
    if (candidate.experienceYears < required) score = Math.min(score, 69);
  }
  score = Math.max(0, Math.min(100, score));

  const questions = missing.map((m) => `Pouvez-vous préciser votre expérience concernant : ${m.criterion} ?`);

  const explanation =
    `Le score est explicable : critères indispensables ${Math.round(mustRatio*100)} %, ` +
    `souhaitables ${Math.round(shouldRatio*100)} %, optionnels ${Math.round(optionalRatio*100)} %. ` +
    `Ce résultat est une aide au tri, jamais une décision automatique.`;

  return {
    score,
    matched: matched.map(x => x.criterion),
    missing: missing.map(x => x.criterion),
    questions,
    explanation
  };
}
