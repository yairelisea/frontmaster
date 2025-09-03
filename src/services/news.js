import { api } from "@/lib/api";

// Ejecuta la búsqueda “cruda”, si quisieras sin IA
export async function searchNews({ q, size = 35, days_back = 14, lang = "es-419", country = "MX", city_keywords } = {}) {
  const { data } = await api.get("/news", { params: { q, size, days_back, lang, country, city_keywords } });
  return data; // { query, total, items: [...] }
}