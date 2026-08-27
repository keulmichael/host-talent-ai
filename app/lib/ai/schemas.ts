export type AiEvidence = {
  label: string;
  status: "explicit" | "probable" | "unconfirmed" | "contradicted";
  confidence: number;
  evidence: string;
};

export type CandidateAiAnalysis = {
  summary: string;
  currentRole: string | null;
  seniority: string | null;
  sectors: string[];
  skills: AiEvidence[];
  management: AiEvidence | null;
  languages: AiEvidence[];
  strengths: string[];
  uncertainties: string[];
};

export type JobAiAnalysis = {
  summary: string;
  mustHave: string[];
  shouldHave: string[];
  optional: string[];
  context: string[];
  questionsToConfirm: string[];
};

export type AiResult<T> = {
  enabled: boolean;
  source: "llm" | "disabled";
  data: T | null;
  error?: string;
};
