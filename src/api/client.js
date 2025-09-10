// src/api/client.js

// Base de API (Netlify: VITE_API_URL)
export const API_BASE =
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof window !== "undefined" && window.__API_BASE__) ||
  "";

// Token helper
const getToken = () =>
  (typeof localStorage !== "undefined" && (localStorage.getItem("access_token") || localStorage.getItem("token"))) ||
  "";

// Parse JSON con fallback silencioso
const j = async (r) => {
  try { return await r.json(); } catch { return {}; }
};

// -------------------------------------------------------
// Meta
// -------------------------------------------------------
export async function health() {
  const r = await fetch(`${API_BASE}/health`);
  return r.ok;
}

// -------------------------------------------------------
// Auth
// -------------------------------------------------------
export async function login(email, name) {
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`POST /auth/login ${r.status} ${txt}`);
  }
  return j(r); // { access_token, token_type, user }
}

// -------------------------------------------------------
// Campaigns
// -------------------------------------------------------
export async function fetchCampaigns() {
  const r = await fetch(`${API_BASE}/campaigns`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`GET /campaigns ${r.status} ${txt}`);
  }
  return j(r); // CampaignOut[]
}

export async function fetchCampaignById(id) {
  const r = await fetch(`${API_BASE}/campaigns/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`GET /campaigns/${id} ${r.status} ${txt}`);
  }
  return j(r); // CampaignOut
}

// -------------------------------------------------------
// Search Local + Analyses (endpoints reales del backend)
// -------------------------------------------------------
export async function adminRecover(campaignId) {
  // Re-ejecuta búsqueda local y persiste
  const r = await fetch(`${API_BASE}/search-local/campaign/${encodeURIComponent(campaignId)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`POST /search-local/campaign/${campaignId} ${r.status} ${txt}`);
  }
  return j(r);
}

export async function adminProcessAnalyses(campaignId, limit = 200) {
  const qs = new URLSearchParams();
  if (campaignId) qs.set("campaignId", campaignId);
  if (limit) qs.set("limit", String(limit));

  const r = await fetch(`${API_BASE}/analyses/process_pending?${qs.toString()}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`POST /analyses/process_pending ${r.status} ${txt}`);
  }
  return j(r);
}

// -------------------------------------------------------
// Reports (tu /reports/pdf requiere payload mínimo)
// -------------------------------------------------------
export async function adminBuildReport(campaign) {
  const payload = {
    campaign: { name: campaign?.name || "", query: campaign?.query || "" },
    analysis: { summary: "Reporte generado desde Admin" },
  };

  const r = await fetch(`${API_BASE}/reports/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`POST /reports/pdf ${r.status} ${txt}`);
  }
  return j(r); // idealmente { url }
}

// -------------------------------------------------------
// (Opcional) News/AI si las usas desde el front
// -------------------------------------------------------
export async function searchNews({ q, lang = "es-419", country = "MX", size = 35, days_back = 14, campaignId } = {}) {
  const url = new URL(`${API_BASE}/news/news`, window.location.origin);
  url.searchParams.set("q", q);
  url.searchParams.set("lang", lang);
  url.searchParams.set("country", country);
  url.searchParams.set("size", String(size));
  url.searchParams.set("days_back", String(days_back));
  if (campaignId) url.searchParams.set("campaignId", campaignId);

  const r = await fetch(url.toString().replace(window.location.origin, ""), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`GET /news/news ${r.status} ${txt}`);
  }
  return j(r);
}