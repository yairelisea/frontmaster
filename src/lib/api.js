// src/lib/api.js
const BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const API = BASE_URL; // ej: https://masterback.onrender.com (sin barras finales)
const FAKE_USER = import.meta.env.VITE_FAKE_USER_ID || "dev-user-1";


function withHeaders(init = {}) {
  const headers = new Headers(init.headers || {});
  const uid = import.meta.env.VITE_FAKE_USER_ID;
  const asAdmin = String(import.meta.env.VITE_ADMIN_HEADER) === "true";
  if (uid) headers.set("x-user-id", uid);
  if (asAdmin) headers.set("x-admin", "true");
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return { ...init, headers };
}

function jsonHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "x-user-id": 'dev-user-1',
    ...extra,
  };
}

// Nuevas utilidades: fetchWithTimeout + fetchCampaigns más robusta
async function fetchWithTimeout(url, options = {}, ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchCampaigns() {
  if (!API) throw new Error("VITE_API_URL no está definido");

  // 1) intento con header normal
  const r1 = await fetchWithTimeout(`${API}/campaigns`, { headers: jsonHeaders() });
  if (r1.ok) return r1.json();

  // 2) fallback con query param (si algún proxy borró el header)
  const url = new URL(`${API}/campaigns`);
  url.searchParams.set("userId", FAKE_USER);
  const r2 = await fetchWithTimeout(url.toString(), { headers: { "Content-Type": "application/json" } });
  if (!r2.ok) throw new Error(`GET /campaigns falló: ${r2.status} ${await r2.text()}`);
  return r2.json();
}

async function handle(resp) {
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const detail = body?.detail || body?.message || resp.statusText;
    throw new Error(detail);
  }
  return body;
}

/**
 * Normaliza distintas formas que puede devolver /ai/analyze-news
 * - { overall: {...}, items: [...] }
 * - { summary, sentiment_label, ... } plano
 * - { results: [...] } solo artículos
 */
export function normalizeAnalysis(raw) {
  if (!raw || typeof raw !== "object") return { meta: raw };

  // Caso A: tiene 'overall'
  if (raw.overall && typeof raw.overall === "object") {
    return {
      summary: raw.overall.summary ?? raw.summary,
      sentiment_label: raw.overall.sentiment_label ?? raw.sentiment_label,
      sentiment_score: raw.overall.sentiment_score ?? raw.sentiment_score,
      topics: raw.overall.topics ?? raw.topics ?? [],
      perception: raw.overall.perception ?? raw.perception ?? {},
      items: raw.items ?? raw.results ?? raw.articles ?? [],
      raw,
    };
  }

  // Caso B: plano con campos directos
  if ("summary" in raw || "sentiment_label" in raw || "sentiment_score" in raw) {
    return {
      summary: raw.summary ?? null,
      sentiment_label: raw.sentiment_label ?? null,
      sentiment_score: raw.sentiment_score ?? null,
      topics: raw.topics ?? [],
      perception: raw.perception ?? {},
      items: raw.items ?? raw.results ?? raw.articles ?? [],
      raw,
    };
  }

  // Caso C: solo lista de artículos
  if (Array.isArray(raw.results) || Array.isArray(raw.items) || Array.isArray(raw.articles)) {
    const items = raw.results ?? raw.items ?? raw.articles ?? [];
    return { summary: null, sentiment_label: null, sentiment_score: null, topics: [], perception: {}, items, raw };
  }

  return { summary: null, sentiment_label: null, sentiment_score: null, topics: [], perception: {}, items: [], raw };
}

export async function analyzeNews({ q, size = 25, days_back = 14, overall = true, lang = "es-419", country = "MX" }) {
  const params = new URLSearchParams({
    q,
    size: String(size),
    days_back: String(days_back),
    overall: String(overall),
    lang,
    country,
  });
  const res = await fetch(`${API}/ai/analyze-news?${params.toString()}`, {
    headers: jsonHeaders(),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`AI analyze failed: ${res.status} ${text}`);
  }
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    // por si el backend respondió string (stream/trace), lo devolvemos como meta
    json = { _raw: text };
  }
  return normalizeAnalysis(json);
}

export async function analyzeCampaign(campaign) {
  return analyzeNews({
    q: campaign.query,
    size: campaign.size ?? 25,
    days_back: campaign.days_back ?? 14,
    lang: campaign.lang ?? "es-419",
    country: campaign.country ?? "MX",
    overall: true,
  });
}




export const api = {
  async get(path, { params } = {}) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const resp = await fetch(`${BASE_URL}${path}${qs}`, withHeaders({ method: "GET" }));
    return { data: await handle(resp) };
  },
  async post(path, data) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "POST", body: JSON.stringify(data) }));
    return { data: await handle(resp) };
  },
  async del(path) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "DELETE" }));
    return { data: await handle(resp) };
  },
  async put(path, data) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "PUT", body: JSON.stringify(data) }));
    return { data: await handle(resp) };
  },
};
