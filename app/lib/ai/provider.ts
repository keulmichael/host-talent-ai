import type { AiResult } from "./schemas";

const endpoint = process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions";
const model = process.env.AI_MODEL || "gpt-5-mini";

export function aiEnabled() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export async function generateStructured<T>(system: string, input: string): Promise<AiResult<T>> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return { enabled: false, source: "disabled", data: null };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: input },
        ],
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      const rawError = await response.text().catch(() => "");
      let detail = rawError;
      try {
        const parsed = JSON.parse(rawError);
        detail = parsed?.error?.message || rawError;
      } catch {
        // Conserver le texte brut si la réponse n'est pas JSON.
      }
      const safeDetail = detail.replace(/sk-[A-Za-z0-9_-]+/g, "[clé masquée]").slice(0, 500);
      return {
        enabled: true,
        source: "llm",
        data: null,
        error: safeDetail ? `AI HTTP ${response.status} · ${safeDetail}` : `AI HTTP ${response.status}`,
      };
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content;
    if (typeof content !== "string") {
      return { enabled: true, source: "llm", data: null, error: "Réponse IA vide" };
    }

    return { enabled: true, source: "llm", data: JSON.parse(content) as T };
  } catch (error) {
    return {
      enabled: true,
      source: "llm",
      data: null,
      error: error instanceof Error ? error.message : "Erreur IA",
    };
  }
}
