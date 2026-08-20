const GROUPS: string[][] = [
  ["ia", "intelligence artificielle", "ai", "genai", "ia generative", "llm", "openai", "gpt"],
  ["automatisation", "automation", "workflow", "workflows", "n8n", "make", "zapier"],
  ["agent ia", "agents ia", "assistant ia", "assistants ia", "copilote ia", "agentic"],
  ["gestion de projet", "chef de projet", "project management", "product owner", "product management"],
  ["analyse des besoins", "recueil des besoins", "besoins metiers", "cadrage", "specifications fonctionnelles"],
  ["crm", "hubspot", "salesforce", "pipedrive"],
  ["api", "api rest", "rest", "integration api", "webhook", "webhooks"],
  ["javascript", "typescript", "node", "nodejs", "nextjs", "next.js", "react"],
  ["seo", "referencement naturel", "geo", "generative engine optimization"],
  ["recrutement", "recruitment", "rh", "ressources humaines", "talent acquisition"],
  ["finance", "financier", "comptabilite", "controle de gestion"],
  ["sap", "s4 hana", "s/4hana", "erp"],
  ["cloud", "aws", "azure", "gcp"],
  ["docker", "conteneur", "container", "kubernetes", "k8s"],
  ["sql", "postgresql", "mysql", "base de donnees", "database"]
];

function normalize(input: string) {
  return input.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9+#./ -]+/g, " ").replace(/\s+/g, " ").trim();
}

function queryConcepts(query: string) {
  const q = normalize(query);
  const terms = new Set(q.split(" ").filter((x) => x.length >= 2));
  const concepts: string[][] = [];
  for (const group of GROUPS) {
    const ng = group.map(normalize);
    if (ng.some((term) => q.includes(term) || terms.has(term))) concepts.push(ng);
  }
  return { q, terms: [...terms], concepts };
}

export function semanticScore(query: string, candidate: { fullName:string; email:string|null; location:string|null; rawText:string; skills:string }) {
  const { q, terms, concepts } = queryConcepts(query);
  if (!q) return { score:0, matched:[] as string[] };
  const text = normalize([candidate.fullName, candidate.email || "", candidate.location || "", candidate.skills, candidate.rawText].join(" \n "));
  let points = 0;
  const matched = new Set<string>();

  if (text.includes(q)) { points += 45; matched.add(query); }

  for (const concept of concepts) {
    const hit = concept.find((term) => text.includes(term));
    if (hit) { points += 18; matched.add(hit); }
  }

  for (const term of terms) {
    if (text.includes(term)) { points += term.length >= 5 ? 8 : 4; matched.add(term); }
  }

  const skillText = normalize(candidate.skills || "");
  for (const concept of concepts) {
    if (concept.some((term) => skillText.includes(term))) points += 8;
  }

  return { score: Math.min(100, points), matched: [...matched].slice(0, 8) };
}
