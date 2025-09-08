// src/lib/api.js

// ========= Config =========
// Usa VITE_API_URL si existe; si no, cae al backend en Render.
const API = (import.meta.env.VITE_API_URL || "https://masterback.onrender.com").replace(/\/+$/, "");
const FAKE_USER = import.meta.env.VITE_FAKE_USER_ID || "dev-user-1";
const ADMIN_HEADER = String(import.meta.env.VITE_ADMIN_HEADER) === "true";

// ========= Auth (token en localStorage) =========
const TOKEN_KEY = "auth_token";

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Header Authorization si hay token
function authHeader() {
  const t = getAuthToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ========= Helpers de fetch =========
function baseJsonHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    ...extra,
  };
}

/**
 * Construye headers con prioridad:
 * 1) Authorization si hay token (login real)
 * 2) x-user-id (FAKE_USER) como fallback de desarrollo
 * 3) x-admin opcional para vistas admin (si pones VITE_ADMIN_HEADER=true)
 */
function withHeaders(init = {}) {
  const headers = new Headers(init.headers || {});

  // Auth
  const token = getAuthToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Fallback dev: x-user-id si no hay token
  if (!token && FAKE_USER) headers.set("x-user-id", FAKE_USER);

  // Admin header opcional
  if (ADMIN_HEADER) headers.set("x-admin", "true");

  // Content-Type por defecto solo si no es GET/HEAD y no hay Content-Type ya
  const method = (init.method || "GET").toUpperCase();
  if (!headers.has("Content-Type") && method !== "GET" && method !== "HEAD" && init.body != null) {
    headers.set("Content-Type", "application/json");
  }

  return { ...init, headers };
}

// fetch con timeout para evitar colgados en edge
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

async function handle(resp) {
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const detail = (body && (body.detail || body.message)) || resp.statusText;
    throw new Error(detail);
  }
  return body;
}

// ========= Auth API =========
/**
 * Login contra /auth/login
 * Espera: { email, password }
 * Devuelve y guarda token (access_token o token)
 */
export async function login({ email, password }) {
  if (!API) throw new Error("VITE_API_URL no está definido");
  const resp = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: baseJsonHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await handle(resp);

  // Soporta dos formas:
  // A) { access_token, token_type, user: {...} }
  // B) { token, ... }
  const token = data.access_token || data.token;
  if (token) setAuthToken(token);

  return data;
}

export async function me() {
  const resp = await fetch(`${API}/auth/me`, withHeaders({ method: "GET" }));
  return handle(resp);
}

export function logout() {
  clearAuthToken();
}

// ========= Health =========
export async function ping() {
  const r = await fetchWithTimeout(`${API}/health`, { method: "GET" });
  return handle(r);
}

// ========= Campaigns =========
/**
 * Trae campañas del usuario autenticado (Authorization) o fallback con x-user-id.
 * Si el preflight/edge quita headers, usa un 2do intento con ?userId=
 */
export async function fetchCampaigns() {
  if (!API) throw new Error("VITE_API_URL no está definido");

  // 1) GET normal con headers
  const r1 = await fetchWithTimeout(`${API}/campaigns`, withHeaders({ method: "GET" }));
  if (r1.ok) return r1.json();

  // 2) Fallback con query param userId (si algún proxy elimina x-user-id)
  const url = new URL(`${API}/campaigns`);
  url.searchParams.set("userId", FAKE_USER);
  const r2 = await fetchWithTimeout(url.toString(), {
    method: "GET",
    headers: baseJsonHeaders(), // sin x-user-id para evitar preflight raro
  });
  if (!r2.ok) {
    const txt = await r2.text();
    throw new Error(`GET /campaigns falló: ${r2.status} ${txt}`);
  }
  return r2.json();
}

export async function createCampaign({
  name,
  query,
  size = 25,
  days_back = 14,
  lang = "es-419",
  country = "MX",
  city_keywords = null,
}) {
  if (!API) throw new Error("VITE_API_URL no está definido");

  // Intento con Authorization / x-user-id
  const r = await fetch(`${API}/campaigns`, withHeaders({
    method: "POST",
    body: JSON.stringify({ name, query, size, days_back, lang, country, city_keywords }),
  }));

  if (r.ok) return r.json();

  // Fallback con ?userId= si el proxy te quitó el header
  const url = new URL(`${API}/campaigns`);
  url.searchParams.set("userId", FAKE_USER);
  const r2 = await fetch(url.toString(), {
    method: "POST",
    headers: baseJsonHeaders(), // sin x-user-id para evitar preflight
    body: JSON.stringify({ name, query, size, days_back, lang, country, city_keywords }),
  });
  if (!r2.ok) {
    const txt = await r2.text();
    throw new Error(`POST /campaigns falló: ${r2.status} ${txt}`);
  }
  return r2.json();
}

export async function getCampaign(id) {
  const r = await fetch(`${API}/campaigns/${id}`, withHeaders({ method: "GET" }));
  return handle(r);
}

// ========= AI Analysis =========
// --- helpers for normalization ---
function toPercent(score) {
  // Handles -1..1, 0..1, or already-in-percent values
  if (score == null || isNaN(Number(score))) return null;
  const s = Number(score);

  // if looks like 0..1
  if (s >= 0 && s <= 1) return Math.round(s * 100);

  // if looks like -1..1
  if (s >= -1 && s <= 1) return Math.round(((s + 1) / 2) * 100);

  // otherwise assume already percent-like; clamp to [0,100]
  return Math.max(0, Math.min(100, Math.round(s)));
}

function normalizeItem(it) {
  // Prefer llm.* if available
  const llm = it?.llm || {};
  const title = it?.title || it?.headline || "";
  const url = it?.url || it?.link || "";
  const source = it?.source || it?.outlet || "";
  const baseSummary = llm.summary ?? it?.summary ?? "";

  // Short summary (for list & PDF)
  const summary_short = baseSummary
    ? (String(baseSummary).length > 240
        ? String(baseSummary).slice(0, 237) + "..."
        : String(baseSummary))
    : "";

  // sentiment
  const label = llm.sentiment_label ?? it?.sentiment_label ?? null;
  const score = llm.sentiment_score ?? it?.sentiment_score ?? null;

  return {
    ...it,
    title,
    url,
    source,
    summary: baseSummary || null,
    summary_short: summary_short || null,
    sentiment_label: label,
    sentiment_score: score,
    sentiment_percent: toPercent(score),
    topics: llm.topics ?? it?.topics ?? [],
    perception: llm.perception ?? it?.perception ?? {},
  };
}

export function normalizeAnalysis(raw) {
  if (!raw || typeof raw !== "object") return { meta: raw, items: [] };

  // When the backend returns overall + items
  const hasOverall = raw.overall && typeof raw.overall === "object";

  const summary =
    (hasOverall ? raw.overall.summary : raw.summary) ?? null;

  const sentiment_label =
    (hasOverall ? raw.overall.sentiment_label : raw.sentiment_label) ?? null;

  const sentiment_score =
    (hasOverall ? raw.overall.sentiment_score : raw.sentiment_score) ?? null;

  const sentiment_percent = toPercent(sentiment_score);

  const topics =
    (hasOverall ? raw.overall.topics : raw.topics) ?? [];

  const perception =
    (hasOverall ? raw.overall.perception : raw.perception) ?? {};

  // Normalize items list (accept several shapes)
  const itemsRaw = raw.items ?? raw.results ?? raw.articles ?? [];
  const items = Array.isArray(itemsRaw) ? itemsRaw.map(normalizeItem) : [];

  // For convenience in the UI/PDF, alias topics to "temas"
  const temas = topics;

  return {
    summary,
    sentiment_label,
    sentiment_score,
    sentiment_percent,
    topics,
    temas,              // alias for UI styling (chips verdes)
    perception,
    items,
    raw,
  };
}

export async function analyzeNews({
  q,
  size = 25,
  days_back = 14,
  overall = true,
  lang = "es-419",
  country = "MX",
}) {
  if (!API) throw new Error("VITE_API_URL no está definido");

  const params = new URLSearchParams({
    q,
    size: String(size),
    days_back: String(days_back),
    overall: String(overall),
    lang,
    country,
  });

  // Intento con Authorization/x-user-id
  let res = await fetch(`${API}/ai/analyze-news?${params.toString()}`, withHeaders({ method: "GET" }));
  let txt = await res.text();

  if (!res.ok) {
    // Fallback con ?userId= si el proxy nos tumbó headers
    const url = new URL(`${API}/ai/analyze-news`);
    url.searchParams.set("userId", FAKE_USER);
    url.searchParams.set("q", q);
    url.searchParams.set("size", String(size));
    url.searchParams.set("days_back", String(days_back));
    url.searchParams.set("overall", String(overall));
    url.searchParams.set("lang", lang);
    url.searchParams.set("country", country);

    res = await fetch(url.toString(), {
      method: "GET",
      headers: baseJsonHeaders(), // simple
    });
    txt = await res.text();

    if (!res.ok) {
      throw new Error(`AI analyze failed: ${res.status} ${txt}`);
    }
  }

  let json;
  try {
    json = JSON.parse(txt);
  } catch {
    json = { _raw: txt };
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

// ========= Analysis Cache (localStorage) =========
// Guarda/lee resultados de análisis para no re-disparar IA si ya existe.
// Clave determinística en función de los parámetros.
const ANALYSIS_CACHE_KEY = "bbx_analysis_cache_v1";

/**
 * Construye una clave de caché determinística para un análisis.
 * Acepta un objeto con { q, size, days_back, lang, country } o una campaña.
 */
export function makeAnalysisCacheKey(input) {
  try {
    if (!input) return null;
    // Si viene campaña
    if (input.query) {
      const q = String(input.query || "").trim().toLowerCase();
      const size = Number(input.size ?? 25);
      const days_back = Number(input.days_back ?? 14);
      const lang = String(input.lang ?? "es-419");
      const country = String(input.country ?? "MX");
      return `q=${q}|size=${size}|db=${days_back}|lang=${lang}|ctry=${country}`;
    }
    // Si viene shape de analyzeNews
    const q = String(input.q || "").trim().toLowerCase();
    const size = Number(input.size ?? 25);
    const days_back = Number(input.days_back ?? 14);
    const lang = String(input.lang ?? "es-419");
    const country = String(input.country ?? "MX");
    if (!q) return null;
    return `q=${q}|size=${size}|db=${days_back}|lang=${lang}|ctry=${country}`;
  } catch {
    return null;
  }
}

/**
 * Lee todo el mapa de caché desde localStorage.
 */
function _readCacheMap() {
  try {
    const raw = localStorage.getItem(ANALYSIS_CACHE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return typeof data === "object" && data ? data : {};
  } catch {
    return {};
  }
}

/**
 * Persiste el mapa de caché completo.
 */
function _writeCacheMap(map) {
  try {
    localStorage.setItem(ANALYSIS_CACHE_KEY, JSON.stringify(map));
  } catch {
    // ignore quota / privacy mode
  }
}

/**
 * Guarda un resultado en caché. Opcionalmente incluye metadatos.
 * meta recomendado: { savedAt: Date.now(), campaignId, campaignName }
 */
export function saveAnalysisCache(key, value, meta = {}) {
  if (!key) return;
  const map = _readCacheMap();
  map[key] = {
    data: value,
    meta: { savedAt: Date.now(), ...meta },
  };
  _writeCacheMap(map);
}

/**
 * Carga un resultado desde caché. Si maxAgeMs &gt; 0, valida vigencia.
 * Devuelve { data, meta } o null si no existe / expiró.
 */
export function loadAnalysisCache(key, maxAgeMs = 0) {
  if (!key) return null;
  const map = _readCacheMap();
  const entry = map[key];
  if (!entry) return null;
  if (maxAgeMs > 0) {
    const savedAt = entry?.meta?.savedAt ?? 0;
    if (!savedAt || Date.now() - savedAt > maxAgeMs) {
      return null;
    }
  }
  return entry;
}

/**
 * Borra una entrada específica o toda la caché.
 */
export function clearAnalysisCache(key = null) {
  if (!key) {
    try { localStorage.removeItem(ANALYSIS_CACHE_KEY); } catch {}
    return;
  }
  const map = _readCacheMap();
  if (map[key]) {
    delete map[key];
    _writeCacheMap(map);
  }
}

/**
 * Helper: devuelve una clave de caché directamente desde una campaña.
 */

export function cacheKeyForCampaign(campaign) {
  return makeAnalysisCacheKey(campaign);
}

// ========= Recover Campaign =========
export async function recoverCampaign(campaignId) {
  if (!API) throw new Error("VITE_API_URL no está definido");
  if (!campaignId) throw new Error("campaignId es requerido");

  const url = `${API}/search-local/campaign/${encodeURIComponent(campaignId)}`;
  const res = await fetch(url, withHeaders({ method: "POST" }));
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Recover failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ========= Cliente simple (get/post/put/delete) por si lo usas en otros lados =========
export const api = {
  async get(path, { params } = {}) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const resp = await fetch(`${API}${path}${qs}`, withHeaders({ method: "GET" }));
    return { data: await handle(resp) };
  },
  async post(path, data) {
    const resp = await fetch(`${API}${path}`, withHeaders({ method: "POST", body: JSON.stringify(data) }));
    return { data: await handle(resp) };
  },
  async del(path) {
    const resp = await fetch(`${API}${path}`, withHeaders({ method: "DELETE" }));
    return { data: await handle(resp) };
  },
  async put(path, data) {
    const resp = await fetch(`${API}${path}`, withHeaders({ method: "PUT", body: JSON.stringify(data) }));
    return { data: await handle(resp) };
  },
};

// ========= PDF Report Client =========
/**
 * Solicita el PDF del análisis al backend (/ai/report) y devuelve un Blob.
 * Parámetros similares a analyzeNews.
 */
export async function requestAnalysisPDF({
  q,
  size = 25,
  days_back = 14,
  overall = true,
  lang = "es-419",
  country = "MX",
}) {
  if (!API) throw new Error("VITE_API_URL no está definido");

  const params = new URLSearchParams({
    q,
    size: String(size),
    days_back: String(days_back),
    overall: String(overall),
    lang,
    country,
  });

  const res = await fetch(`${API}/ai/report?${params.toString()}`, withHeaders({
    method: "GET",
    headers: { Accept: "application/pdf" },
  }));

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PDF request failed: ${res.status} ${txt}`);
  }

  const blob = await res.blob();
  if (blob.type !== "application/pdf") {
    throw new Error("Respuesta no es un PDF válido");
  }

  return blob;
}

/**
 * Descarga un PDF para una campaña dada, usando requestAnalysisPDF y disparando descarga en navegador.
 */
export async function downloadCampaignPDF(campaign) {
  const blob = await requestAnalysisPDF({
    q: campaign.query,
    size: campaign.size ?? 25,
    days_back: campaign.days_back ?? 14,
    lang: campaign.lang ?? "es-419",
    country: campaign.country ?? "MX",
    overall: true,
  });

  const filenameBase = (campaign.name || campaign.query || "reporte")
    .toLowerCase()
    .replace(/\s+/g, "_");
  const filename = filenameBase + ".pdf";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Descarga un PDF para parámetros arbitrarios, usando requestAnalysisPDF y disparando descarga en navegador.
 */
export async function downloadAnalysisPDFByParams({ q, size = 25, days_back = 14, lang = "es-419", country = "MX" }) {
  const blob = await requestAnalysisPDF({
    q,
    size,
    days_back,
    lang,
    country,
    overall: true,
  });

  const filenameBase = (q || "reporte")
    .toLowerCase()
    .replace(/\s+/g, "_");
  const filename = filenameBase + ".pdf";

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}