import { generateStructured } from "./provider";
import type { CandidateAiAnalysis } from "./schemas";

const SYSTEM = `Tu analyses un CV pour assister un recruteur. Tu ne prends jamais de décision de recrutement et tu n'infères jamais de donnée sensible ou personnelle absente du document. Toute affirmation doit être fondée sur le texte fourni. Distingue explicitement: explicit (preuve directe), probable (preuve sémantique forte), unconfirmed (non démontré), contradicted (mention explicitement négative/limitée). Une absence de preuve n'est jamais une incompatibilité. Retourne uniquement un objet JSON avec: summary, currentRole, seniority, sectors, skills, management, languages, strengths, uncertainties. Chaque élément skills/languages et management utilise {label,status,confidence,evidence}. confidence est entre 0 et 1. Cite une preuve courte issue du CV dans evidence.`;

export async function analyzeCandidateWithAi(rawText: string) {
  const text = rawText.slice(0, 30000);
  return generateStructured<CandidateAiAnalysis>(SYSTEM, `CV:\n${text}`);
}
