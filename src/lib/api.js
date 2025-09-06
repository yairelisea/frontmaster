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

  // Content-Type por defecto
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");

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
/**
 * Normaliza distintas respuestas del endpoint de análisis.
 */
export function normalizeAnalysis(raw) {
  if (!raw || typeof raw !== "object") return { meta: raw };

  // Caso A: objeto con 'overall'
  if (raw.overall && typeof raw.overall === "object") {
    return {
      summary: raw.overall.summary ?? raw.summary ?? null,
      sentiment_label: raw.overall.sentiment_label ?? raw.sentiment_label ?? null,
      sentiment_score: raw.overall.sentiment_score ?? raw.sentiment_score ?? null,
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