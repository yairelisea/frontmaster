// src/api/bbx.js
export const API_BASE = import.meta.env.VITE_API_URL || "";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") ||
  "";

const j = async (r) => { try { return await r.json(); } catch { return {}; } };

export async function fetchCampaigns() {
  const r = await fetch(`${API_BASE}/campaigns`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) throw new Error(`campaigns ${r.status}`);
  return j(r);
}

export async function adminRecover(campaignId) {
  const r = await fetch(`${API_BASE}/admin/campaigns/${campaignId}/recover`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) throw new Error(`recover ${r.status}`);
  return j(r);
}

export async function adminBuildReport(campaignId) {
  const r = await fetch(`${API_BASE}/admin/campaigns/${campaignId}/report`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) throw new Error(`report ${r.status}`);
  return j(r); // espera {url: "..."} desde backend/reports_extras o reports
}

export async function fetchCampaignItems(campaignId) {
  const r = await fetch(`${API_BASE}/campaigns/${campaignId}/items`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) throw new Error(`items ${r.status}`);
  return j(r);
}

export async function fetchCampaignAnalyses(campaignId) {
  const r = await fetch(`${API_BASE}/campaigns/${campaignId}/analyses`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) throw new Error(`analyses ${r.status}`);
  return j(r);
}

export async function adminCreateUser(payload) {
  const r = await fetch(`${API_BASE}/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(`createUser ${r.status}`);
  return j(r);
}

export async function adminListUsers() {
  const r = await fetch(`${API_BASE}/admin/users`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) throw new Error(`users ${r.status}`);
  return j(r);
}