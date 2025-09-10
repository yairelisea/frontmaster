// src/api/client.js
export const API_BASE =
  (import.meta?.env?.VITE_API_URL) ||
  (typeof window !== "undefined" ? window.__API_BASE__ : "") ||
  "";

const getToken = () =>
  (typeof localStorage !== "undefined" && (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token")
  )) || "";

if (typeof window !== "undefined" && !window.__BBX_LOGGED__) {
  console.log("[BBX] API_BASE =", API_BASE);
  console.log("[BBX] has token? =", !!getToken());
  window.__BBX_LOGGED__ = true;
}

const parseJSON = async (r) => { try { return await r.json(); } catch { return {}; } };
const throwHttp = async (r, label) => {
  const ct = r.headers.get("content-type") || "";
  const body = ct.includes("application/json") ? JSON.stringify(await parseJSON(r)) : (await r.text().catch(()=> ""))
  const err = new Error(`${label} ${r.status} ${r.statusText} :: ${body}`);
  err.status = r.status; err.body = body; throw err;
};

export async function ping() {
  const r = await fetch(`${API_BASE}/health`, { credentials: "omit" });
  if (!r.ok) await throwHttp(r, "GET /health");
  return parseJSON(r);
}

export async function fetchCampaigns() {
  const r = await fetch(`${API_BASE}/campaigns`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) await throwHttp(r, "GET /campaigns");
  return parseJSON(r);
}

export async function fetchCampaignById(id) {
  const r = await fetch(`${API_BASE}/campaigns/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) await throwHttp(r, `GET /campaigns/${id}`);
  return parseJSON(r);
}

export async function adminRecover(campaignId) {
  const r = await fetch(`${API_BASE}/search-local/campaign/${campaignId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) await throwHttp(r, `POST /search-local/campaign/${campaignId}`);
  return parseJSON(r);
}

export async function adminProcessAnalyses(campaignId) {
  const url = campaignId
    ? `${API_BASE}/analyses/process_pending?campaignId=${encodeURIComponent(campaignId)}`
    : `${API_BASE}/analyses/process_pending`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) await throwHttp(r, "POST /analyses/process_pending");
  return parseJSON(r);
}

export async function adminBuildReport(campaign) {
  const payload = {
    campaign: { name: campaign?.name || "", query: campaign?.query || "" },
    analysis: { summary: "Reporte generado desde Admin" },
  };
  const r = await fetch(`${API_BASE}/reports/pdf`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const ct = r.headers.get("content-type") || "";
  if (!r.ok) await throwHttp(r, "POST /reports/pdf");
  if (ct.includes("application/json")) return parseJSON(r);

  // PDF directo
  const blob = await r.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "reporte.pdf";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  return { downloaded: true };
}