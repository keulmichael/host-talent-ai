import { generateStructured } from "./provider";
import type { MissionFitAnalysis } from "./schemas";

const SYSTEM = `Tu assistes un recruteur dans l'analyse d'adéquation entre un candidat et une mission.
Tu dois uniquement utiliser les informations fournies dans le CV et la mission. N'invente aucun fait.
Tu ne dois jamais prendre de décision de recrutement, de rejet, ni recalculer ou remplacer le score déterministe existant.
Pour chaque critère de mission, distingue strictement :
- explicit : preuve directe et explicite dans le CV ;
- probable : correspondance sémantique crédible mais non littérale ;
- unconfirmed : information absente ou insuffisante ;
- contradicted : information explicitement incompatible ou limitée.
Une absence de preuve n'est jamais une incompatibilité.
Retourne uniquement un objet JSON avec : summary, fitSignals, watchPoints, criteria, interviewQuestions, recruiterConclusion.
criteria est un tableau d'objets contenant exactement : criterion, importance (must|should|optional), status (explicit|probable|unconfirmed|contradicted), confidence (nombre entre 0 et 1 ou null), evidence.
recruiterConclusion doit rester une aide à la revue humaine, sans recommander automatiquement un recrutement ou un rejet.`;

export async function analyzeMissionFitWithAi(input: {
  candidateText: string;
  jobTitle: string;
  jobDescription: string;
  mustHave: string;
  shouldHave: string;
  optional: string;
}) {
  const body = `MISSION
Titre : ${input.jobTitle}
Description : ${input.jobDescription}
Indispensables : ${input.mustHave}
Souhaitables : ${input.shouldHave}
Optionnels : ${input.optional}

CV CANDIDAT
${input.candidateText.slice(0, 30000)}`;

  return generateStructured<MissionFitAnalysis>(SYSTEM, body);
}
