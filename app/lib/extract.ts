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
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function extractCandidate(rawText: string) {
  const text = rawText.replace(/\s+/g, " ").trim();
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] ?? "";
  const years =
    Number(
      text.match(/(\d{1,2})\s*(?:ans|annees|années)\s+(?:d['’]experience|d'experience|d’expérience)/i)?.[1]
    ) || null;

  const commonSkills = [
    "TypeScript","JavaScript","Next.js","React","Node.js","Python","Java","PHP",
    "Salesforce","SAP","SEO","Google Ads","HubSpot","n8n","Power BI","SQL","AWS",
    "Azure","Docker","Kubernetes","Figma","SaaS B2B","anglais"
  ];
  const n = normalize(text);
  const skills = commonSkills.filter((s) => n.includes(normalize(s)));

  const summary = text.length > 420 ? text.slice(0, 420) + "…" : text;

  return {
    email,
    years,
    skills,
    summary
  };
}
