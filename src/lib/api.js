// src/lib/api.js

// =====================
// Config
// =====================
const RUNTIME_BASE =
  (typeof window !== "undefined" && window.__API_BASE__) || null;
export const API_BASE = (
  RUNTIME_BASE || import.meta.env?.VITE_API_URL || "/api"
).replace(/\/+$/, "");

// =====================
// Token helpers
// =====================
const TOKEN_KEYS = ["access_token", "auth_token", "token"];

function _readFrom(storage, keys) {
  try {
    for (const k of keys) {
      const v = storage.getItem(k);
      if (v && typeof v === "string" && v.trim()) return v.trim();
    }
  } catch {}
  return null;
}

export function getAuthToken() {
  let v = _readFrom(localStorage, TOKEN_KEYS);
  if (v) return v;
  v = _readFrom(sessionStorage, TOKEN_KEYS);
  if (v) return v;
  return null;
}

export function setAuthToken(token) {
  try {
    localStorage.setItem("access_token", token);
  } catch {}
}

export function clearAuthToken() {
  try {
    for (const k of TOKEN_KEYS) localStorage.removeItem(k);
    localStorage.removeItem("user");
  } catch {}
}

// =====================
// Fetch helpers
// =====================
async function parseJsonSafe(r) {
  try {
    return await r.json();
  } catch {
    return {};
  }
}

function _asId(v) {
  if (v == null) return null;
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") {
    if (v.id != null) return String(v.id);
    if (v.campaignId != null) return String(v.campaignId);
  }
  try { return String(v); } catch { return null; }
}

async function apiFetch(
  path,
  { method = "GET", headers = {}, body, asBlob = false } = {}
) {
  const url = `${API_BASE}${path}`;
  const token = getAuthToken();

  const opts = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  const r = await fetch(url, opts);

  if (r.status === 401) {
    clearAuthToken();
    if (typeof window !== "undefined") {
      const from = location.pathname + location.search;
      location.href = `/auth/login${from ? `?from=${encodeURIComponent(from)}` : ""}`;
    }
    throw new Error(`401 Unauthorized on ${method} ${path}`);
  }

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`${method} ${path} -> ${r.status} :: ${txt}`);
  }

  return asBlob ? r.blob() : parseJsonSafe(r);
}

// =====================
// Axios-like helper (api)
// =====================
function normalizePath(p) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

function withParams(p, params) {
  if (!params || typeof params !== "object") return p;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v == null) continue;
    qs.set(k, String(v));
  }
  const q = qs.toString();
  if (!q) return p;
  return p.includes("?") ? `${p}&${q}` : `${p}?${q}`;
}

export const api = {
  async get(p, opts = {}) {
    const path = withParams(normalizePath(p), opts.params);
    const data = await apiFetch(path, { method: "GET", headers: opts.headers });
    return { data };
  },
  async post(p, body, opts = {}) {
    const path = normalizePath(p);
    const data = await apiFetch(path, { method: "POST", body, headers: opts.headers });
    return { data };
  },
  async put(p, body, opts = {}) {
    const path = normalizePath(p);
    const data = await apiFetch(path, { method: "PUT", body, headers: opts.headers });
    return { data };
  },
  async delete(p, opts = {}) {
    const path = normalizePath(p);
    const data = await apiFetch(path, { method: "DELETE", headers: opts.headers });
    return { data };
  },
};

// Salud
export async function ping() {
  return apiFetch("/health");
}

// =====================
// Campaigns
// =====================
export async function listCampaigns() {
  return apiFetch("/campaigns");
}

export async function getCampaign(id) {
  return apiFetch(`/campaigns/${id}`);
}

export async function createCampaign(payload) {
  return apiFetch(`/campaigns`, { method: "POST", body: payload });
}

// Alias (NO duplicar funciones)
export const fetchCampaigns = listCampaigns;
export const fetchCampaignById = getCampaign;

// =====================
// Ingest / Analyses / Search
// =====================
export async function ingestCampaign(campaignId) {
  return apiFetch("/ingest/ingest", { method: "POST", body: { campaignId } });
}

/**
 * “Analyze” a nivel UI = procesar pendientes de una campaña.
 * (Backend: /analyses/process_pending)
 */
export async function analyzeCampaign(campaignId, limit = 200) {
  const id = _asId(campaignId);
  const qs = new URLSearchParams();
  if (id) qs.set("campaignId", id);
  if (limit) qs.set("limit", String(limit));
  return apiFetch(`/analyses/process_pending?${qs.toString()}`, {
    method: "POST",
  });
}

export async function processPending(campaignId, limit = 200) {
  return analyzeCampaign(campaignId, limit);
}

export async function recoverCampaign(campaignId) {
  const id = _asId(campaignId);
  return apiFetch(`/search-local/campaign/${id}`, { method: "POST" });
}

export async function searchLocal({ query, city = "", country = "MX", lang = "es-419", days_back = 14, limit = 25 }) {
  return apiFetch("/search-local", {
    method: "POST",
    body: { query, city, country, lang, days_back, limit },
  });
}

// Compat para páginas que piden items/analyses desde el front
export async function fetchCampaignItems(id, params = {}) {
  const qs = new URLSearchParams();
  const { page = 1, per_page = 25, q, status, order = "publishedAt", dir = "desc" } = params || {};
  qs.set("page", String(page));
  qs.set("per_page", String(per_page));
  if (q) qs.set("q", q);
  if (status) qs.set("status", status);
  if (order) qs.set("order", order);
  if (dir) qs.set("dir", dir);
  return apiFetch(`/campaigns/${id}/items?${qs.toString()}`);
}

export async function fetchCampaignAnalyses(id, params = {}) {
  const qs = new URLSearchParams();
  const { page = 1, per_page = 25, q, order = "createdAt", dir = "desc" } = params || {};
  qs.set("page", String(page));
  qs.set("per_page", String(per_page));
  if (q) qs.set("q", q);
  if (order) qs.set("order", order);
  if (dir) qs.set("dir", dir);
  return apiFetch(`/campaigns/${id}/analyses?${qs.toString()}`);
}

export async function fetchCampaignOverview(id) {
  return apiFetch(`/campaigns/${id}/overview`);
}

// Admin mirrors
export async function adminFetchCampaignItems(id, params = {}) {
  const qs = new URLSearchParams();
  const { page = 1, per_page = 25, q, status, order = "publishedAt", dir = "desc" } = params || {};
  qs.set("page", String(page));
  qs.set("per_page", String(per_page));
  if (q) qs.set("q", q);
  if (status) qs.set("status", status);
  if (order) qs.set("order", order);
  if (dir) qs.set("dir", dir);
  try {
    return await apiFetch(`/admin/campaigns/${id}/items?${qs.toString()}`);
  } catch {
    // Fallback si aún no existen rutas admin en backend
    return fetchCampaignItems(id, params);
  }
}

export async function adminFetchCampaignAnalyses(id, params = {}) {
  const qs = new URLSearchParams();
  const { page = 1, per_page = 25, q, order = "createdAt", dir = "desc" } = params || {};
  qs.set("page", String(page));
  qs.set("per_page", String(per_page));
  if (q) qs.set("q", q);
  if (order) qs.set("order", order);
  if (dir) qs.set("dir", dir);
  try {
    return await apiFetch(`/admin/campaigns/${id}/analyses?${qs.toString()}`);
  } catch {
    // Fallback si aún no existen rutas admin en backend
    return fetchCampaignAnalyses(id, params);
  }
}

export async function adminFetchCampaignOverview(id) {
  try {
    return await apiFetch(`/admin/campaigns/${id}/overview`);
  } catch {
    // Fallback si aún no existen rutas admin en backend
    return fetchCampaignOverview(id);
  }
}

// =====================
// Analysis helpers
// =====================
export function normalizeAnalysis(res) {
  if (!res || typeof res !== "object") return null;
  const raw = res;
  const data = res.analysis || res.data || res;

  const items =
    data.items ||
    res.items ||
    (Array.isArray(res) ? res : []) ||
    [];

  const summary = data.summary || data.generated_summary || "";
  const sentiment_label =
    data.sentiment_label ||
    data.sentiment?.label ||
    null;
  const sentiment_score =
    data.sentiment_score ??
    data.sentiment?.score ??
    null;
  let sentiment_score_pct =
    data.sentiment_score_pct ??
    data.sentiment?.score_pct ??
    null;
  if (sentiment_score_pct == null && typeof sentiment_score === "number") {
    sentiment_score_pct = ((sentiment_score + 1) / 2) * 100;
  }
  const topics = data.topics || data.keywords || [];

  return {
    summary,
    sentiment_label,
    sentiment_score,
    sentiment_score_pct,
    topics: Array.isArray(topics) ? topics : [],
    items: Array.isArray(items) ? items : [],
    raw,
  };
}

export function cacheKeyForCampaign(campaign) {
  return campaign?.id ? `bbx:analysis:${campaign.id}` : null;
}

export function saveAnalysisCache(key, analysis, meta = {}) {
  try {
    localStorage.setItem(key, JSON.stringify({ analysis, meta }));
  } catch {}
}

// =====================
// Reports
// =====================
export async function buildReport(payload, filename = "reporte.pdf") {
  const blob = await apiFetch("/reports/pdf", {
    method: "POST",
    body: payload,
    asBlob: true,
  });

  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  return true;
}

// =====================
// Auth endpoints
// =====================
export async function apiLogin({ email, password, name } = {}) {
  const url = `${API_BASE}/auth/login`;
  const body = { email };
  if (password) body.password = password;
  if (name) body.name = name;

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await r.text().catch(() => "");
  let data = {};
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
  }

  if (!r.ok) {
    throw new Error(`POST /auth/login -> ${r.status} :: ${text || "Login failed"}`);
  }

  const token = data.access_token || data.token || data.accessToken || null;
  if (token) {
    try {
      localStorage.setItem("access_token", token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    } catch {}
  }

  return data;
}

export function apiLogout() {
  clearAuthToken();
  return true;
}

// ===============================
// AdminAPI (User & Campaign admin)
// ===============================
const _authHeader = () => {
  let t = "";
  try {
    t =
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      "";
  } catch {}
  return t ? { Authorization: `Bearer ${t}` } : {};
};

async function _fetchJSON(url, options = {}) {
  const r = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ..._authHeader(),
      ...(options.headers || {}),
    },
  });
  const text = await r.text().catch(() => "");
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!r.ok) {
    const msg = data?.detail || text || `HTTP ${r.status}`;
    throw new Error(`${options.method || "GET"} ${url} -> ${r.status} :: ${msg}`);
  }
  return data;
}

export const AdminAPI = {
  // Users
  listUsers: () => _fetchJSON(`${API_BASE}/admin/users`),
  createUser: (payload) =>
    _fetchJSON(`${API_BASE}/admin/users`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateUser: (userId, payload) =>
    _fetchJSON(`${API_BASE}/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  setFeatures: (userId, features) =>
    _fetchJSON(`${API_BASE}/admin/users/${userId}/features`, {
      method: "PUT",
      body: JSON.stringify({ features }),
    }),
  setPlan: (userId, plan) =>
    _fetchJSON(`${API_BASE}/admin/users/${userId}/plan`, {
      method: "PUT",
      body: JSON.stringify({ plan }),
    }),

  // Campaigns
  listCampaigns: () => _fetchJSON(`${API_BASE}/admin/campaigns`),
  getCampaign: (id) => _fetchJSON(`${API_BASE}/admin/campaigns/${id}`),
  createCampaign: (payload) =>
    _fetchJSON(`${API_BASE}/admin/campaigns`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateCampaign: (id, payload) =>
    _fetchJSON(`${API_BASE}/admin/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  assignCampaignToUser: (campaignId, userId) =>
    _fetchJSON(`${API_BASE}/admin/campaigns/${campaignId}/assign`, {
      method: "POST",
      body: JSON.stringify({ userId }),
    }),

  // Operations
  recoverCampaign: (campaignId) =>
    _fetchJSON(`${API_BASE}/search-local/campaign/${campaignId}`, {
      method: "POST",
    }),
  processAnalyses: (campaignId, limit = 200) => {
    const url = new URL(`${API_BASE}/analyses/process_pending`);
    if (campaignId) url.searchParams.set("campaignId", campaignId);
    if (limit) url.searchParams.set("limit", String(limit));
    return _fetchJSON(url.toString(), { method: "POST" });
  },
  buildReport: (payload) =>
    _fetchJSON(`${API_BASE}/reports/pdf`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

// Compat: si tu UI vieja importa estos nombres admin*
export const adminRecover = AdminAPI.recoverCampaign;
export const adminBuildReport = AdminAPI.buildReport;
export const adminProcessAnalyses = AdminAPI.processAnalyses;
export const adminListCampaigns = AdminAPI.listCampaigns;
export const adminGetCampaign = AdminAPI.getCampaign;
