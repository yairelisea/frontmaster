// src/lib/api.js

// ========= Config =========
export const API_BASE =
  (import.meta.env?.VITE_API_URL || "https://masterback.onrender.com").replace(
    /\/+$/,
    ""
  );

const FAKE_USER = import.meta.env?.VITE_FAKE_USER_ID || "dev-user-1";
const ADMIN_HEADER = String(import.meta.env?.VITE_ADMIN_HEADER) === "true";

// ========= Auth (token en localStorage / sessionStorage) =========
const TOKEN_KEYS = [
  "access_token", // preferido
  "auth_token",
  "token", // fallback genérico
];

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
  // 1) localStorage
  let v = _readFrom(localStorage, TOKEN_KEYS);
  if (v) return v;
  // 2) sessionStorage
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token");
  } catch {}
}

// ========= Fetch helper =========
async function parseJsonSafe(r) {
  try {
    return await r.json();
  } catch {
    return {};
  }
}

async function apiFetch(path, { method = "GET", headers = {}, body, asBlob = false } = {}) {
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

// ========= Campaigns =========
export async function listCampaigns() {
  return apiFetch("/campaigns");
}

export async function getCampaign(id) {
  return apiFetch(`/campaigns/${id}`);
}

// ========= Ingest / Analyses =========
export async function ingestCampaign(campaignId) {
  return apiFetch("/ingest/ingest", { method: "POST", body: { campaignId } });
}

export async function processPending(campaignId, limit = 200) {
  const qs = new URLSearchParams();
  if (campaignId) qs.set("campaignId", campaignId);
  if (limit) qs.set("limit", String(limit));
  return apiFetch(`/analyses/process_pending?${qs.toString()}`, { method: "POST" });
}

export async function recoverCampaign(campaignId) {
  return apiFetch(`/search-local/campaign/${campaignId}`, { method: "POST" });
}

// ========= Reports =========
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

// ========= Compatibilidad con UI =========
export async function fetchCampaignItems(id, params) {
  if (params?.q) {
    const qs = new URLSearchParams({
      q: params.q,
      size: String(params.size || 25),
      days_back: String(params.days_back || 14),
      lang: params.lang || "es-419",
      country: params.country || "MX",
    });
    const data = await apiFetch(`/news/news?${qs.toString()}`);
    return (data.items || []).map((it) => ({
      title: it.title,
      url: it.link || it.url,
      publishedAt: it.published_at,
      source: it.source,
      snippet: it.summary,
    }));
  }
  return [];
}

export async function fetchCampaignAnalyses(id) {
  return []; // backend no expone GET de analyses listados aún
}

// ========= Auth endpoints =========
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
  try { data = JSON.parse(text); } catch { data = {}; }

  if (!r.ok) {
    throw new Error(`POST /auth/login -> ${r.status} :: ${text || "Login failed"}`);
  }

  // intenta guardar el token para que el resto de llamadas funcionen de inmediato
  const token =
    data.access_token || data.token || data.accessToken || null;
  if (token) {
    try {
      localStorage.setItem("access_token", token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    } catch {}
  }

  return data; // { access_token, token_type, user, ... }
}

export function apiLogout() {
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch {}
  return true;
}