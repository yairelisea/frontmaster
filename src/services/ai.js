import { api } from "@/lib/api";

// Ejecuta análisis con IA a partir de una campaña o parámetros ad-hoc
export async function analyzeNews({ q, size = 35, days_back = 14, overall = true, campaignId, lang = "es-419", country = "MX", city_keywords } = {}) {
  const { data } = await api.get("/ai/analyze-news", {
    params: { q, size, days_back, overall, campaignId, lang, country, city_keywords },
  });
  return data; // { query, total, items:[{...llm}], aggregate? }
}