// --- al inicio del archivo ---
export const API_BASE =
  (import.meta && import.meta.env && import.meta.env.VITE_API_URL) ||
  window?.__API_BASE__ ||
  "";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

// Respuesta JSON con fallback a texto para depurar errores
const j = async (r) => {
  try { return await r.json(); } catch { return {}; }
};

// --- reemplaza/asegura esta función ---
export async function fetchCampaigns() {
  const r = await fetch(`${API_BASE}/campaigns`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`GET /campaigns ${r.status} ${txt}`);
  }
  return j(r);
}

// (Opcional) si necesitas también:
export async function fetchCampaignItems(id) {
  const r = await fetch(`${API_BASE}/campaigns/${id}/items`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) throw new Error(`GET /campaigns/${id}/items ${r.status}`);
  return j(r);
}
export async function fetchCampaignAnalyses(id) {
  const r = await fetch(`${API_BASE}/campaigns/${id}/analyses`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) throw new Error(`GET /campaigns/${id}/analyses ${r.status}`);
  return j(r);
}

export async function adminRecover(campaignId) {
  const r = await fetch(`${API_BASE}/admin/campaigns/${campaignId}/recover`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || localStorage.getItem("token") || ""}`,
    },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`POST /admin/campaigns/${campaignId}/recover ${r.status} ${txt}`);
  }
  try { return await r.json(); } catch { return {}; }
}

export async function adminBuildReport(campaignId) {
  const r = await fetch(`${API_BASE}/admin/campaigns/${campaignId}/report`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access_token") || localStorage.getItem("token") || ""}`,
    },
  });
  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`POST /admin/campaigns/${campaignId}/report ${r.status} ${txt}`);
  }
  try { return await r.json(); } catch { return {}; }
}