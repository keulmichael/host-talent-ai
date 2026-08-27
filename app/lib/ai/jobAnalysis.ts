import { generateStructured } from "./provider";
import type { JobAiAnalysis } from "./schemas";

const SYSTEM = `Tu structures une fiche de mission pour assister un recruteur. Tu ne dois inventer aucun critère. Sépare les exigences explicitement indispensables, les souhaitables, les optionnelles et le contexte. Quand le texte ne permet pas de classer sûrement une exigence, place-la dans questionsToConfirm plutôt que de l'inventer comme must-have. Retourne uniquement un objet JSON avec: summary, mustHave, shouldHave, optional, context, questionsToConfirm.`;

export async function analyzeJobWithAi(rawText: string) {
  return generateStructured<JobAiAnalysis>(SYSTEM, `MISSION:\n${rawText.slice(0, 30000)}`);
}
