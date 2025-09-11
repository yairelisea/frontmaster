// src/api/client.js

// ====== Base URL ======
export const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof window !== "undefined" ? window.__API_BASE__ : "") ||
  "";

// ====== Token helpers ======
export function getToken() {
  try {
    return (
      localStorage.getItem("access_token") ||
      localStorage.getItem("token") ||
      ""
    );
  } catch {
    return "";
  }
}

function authHeaders(extra = {}) {
  const t = getToken();
  return t
    ? { Authorization: `Bearer ${t}`, ...extra }
    : { ...extra };
}

async function parseJsonSafe(r) {
  try { return await r.json(); } catch { return {}; }
}

// Manejo centralizado de fetch
async function req(path, { method = "GET", headers = {}, body, asBlob = false } = {}) {
  const url = `${API_BASE}${path}`;
  const opts = {
    method,
    headers: authHeaders({ "Content-Type": "application/json", ...headers }),
    body: body ? JSON.stringify(body) : undefined,
  };

  const r = await fetch(url, opts);

  if (r.status === 401) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
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

// ====== Campaigns ======
export async function fetchCampaigns() {
  return req(`/campaigns`);
}

export async function fetchCampaign(id) {
  return req(`/campaigns/${id}`);
}

// ====== Ingest / Analyses ======
export async function ingestCampaign(campaignId) {
  return req(`/ingest/ingest`, { method: "POST", body: { campaignId } });
}

export async function processPending(campaignId, limit = 200) {
  const qs = new URLSearchParams();
  if (campaignId) qs.set("campaignId", campaignId);
  if (limit) qs.set("limit", String(limit));
  return req(`/analyses/process_pending?${qs.toString()}`, { method: "POST" });
}

export async function adminRecover(campaignId) {
  return req(`/search-local/campaign/${campaignId}`, { method: "POST" });
}

// ====== Reports (PDF) ======
export async function adminBuildReport(payload, filename = "reporte.pdf") {
  const blob = await req(`/reports/pdf`, { method: "POST", body: payload, asBlob: true });

  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
  }
  return true;
}

// ====== Compatibilidad con UI ======
export async function fetchCampaignItems(id, fallbackParams) {
  if (fallbackParams?.q) {
    const qs = new URLSearchParams({
      q: fallbackParams.q,
      size: String(fallbackParams.size || 25),
      days_back: String(fallbackParams.days_back || 14),
      lang: fallbackParams.lang || "es-419",
      country: fallbackParams.country || "MX",
    });
    const data = await req(`/news/news?${qs.toString()}`);
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

// Healthcheck simple para usar en el admin
export async function ping() {
  const url = `${API_BASE}/health`;
  try {
    const r = await fetch(url, { method: "GET" });
    const text = await r.text().catch(() => "");
    // intenta parsear json si aplica
    let data = {};
    try { data = JSON.parse(text); } catch {}
    return { status: r.status, ok: r.ok, data, raw: text };
  } catch (e) {
    return { status: 0, ok: false, error: String(e) };
  }
}

export async function fetchCampaignAnalyses(id) {
  return []; // tu backend no expone GET de análisis listados
}

// Alias compatible con la página de detalle:
export async function fetchCampaignById(id) {
  // Reusa la función existente
  return fetchCampaign(id);
}

// Alias para procesar análisis pendientes (wrapper de processPending)
export async function adminProcessAnalyses(campaignId, limit = 200) {
  return processPending(campaignId, limit);
}