export const API_BASE = import.meta.env.VITE_API_URL || "";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

const j = async (r) => { try { return await r.json(); } catch { return {}; } };

export async function fetchCampaigns() {
  const res = await fetch(`${API_BASE}/campaigns`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`campaigns ${res.status}`);
  return j(res);
}

export async function adminRecover(campaignId) {
  const res = await fetch(`${API_BASE}/admin/campaigns/${campaignId}/recover`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) { const msg = await res.text().catch(() => ""); throw new Error(`recover ${res.status} ${msg}`); }
  return j(res);
}

export async function fetchCampaignItems(campaignId) {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/items`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`items ${res.status}`);
  return j(res);
}

export async function fetchCampaignAnalyses(campaignId) {
  const res = await fetch(`${API_BASE}/campaigns/${campaignId}/analyses`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!res.ok) throw new Error(`analyses ${res.status}`);
  return j(res);
}