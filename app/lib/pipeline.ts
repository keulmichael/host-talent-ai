export const PIPELINE_STAGES = [
  { value: "NEW", label: "À examiner" },
  { value: "SHORTLIST", label: "Short-list" },
  { value: "CONTACTED", label: "Contacté" },
  { value: "INTERVIEW", label: "Entretien" },
  { value: "CLIENT", label: "Présenté client" },
  { value: "OFFER", label: "Offre" },
  { value: "HIRED", label: "Recruté" },
  { value: "HOLD", label: "En attente" },
  { value: "REJECTED", label: "Non retenu" }
] as const;

export function stageLabel(value: string) {
  return PIPELINE_STAGES.find((s) => s.value === value)?.label || value;
}
