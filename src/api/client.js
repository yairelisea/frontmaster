// src/api/client.js
import { endpoints } from "./endpoints";

// Base y helpers
export const API_BASE =
  (import.meta?.env?.VITE_API_URL) ||
  window?.__API_BASE__ ||
  "";

const getToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("token") || "";

const j = async (r) => { try { return await r.json(); } catch { return {}; } };

// ---------- Meta
export async function health() {
  const r = await fetch(endpoints.health());
  return r.ok;
}

// ---------- Auth
export async function login(email, name) {
  const r = await fetch(endpoints.login(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name }),
  });
  if (!r.ok) {
    const txt = await r.text().catch(()=> "");
    throw new Error(`POST /auth/login ${r.status} ${txt}`);
  }
  return j(r); // { access_token, token_type, user }
}

// ---------- Campaigns
export async function fetchCampaigns() {
  const r = await fetch(endpoints.campaigns(), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(()=> "");
    throw new Error(`GET /campaigns ${r.status} ${txt}`);
  }
  return j(r); // CampaignOut[]
}

export async function fetchCampaignById(id) {
  const r = await fetch(endpoints.campaignById(id), {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
  if (!r.ok) {
    const txt = await r.text().catch(()=> "");
    throw new Error(`GET /campaigns/${id} ${r.status} ${txt}`);
  }
  return j(r); // CampaignOut
}

// ---------- Sources
export async function addSourceToCampaign(campaignId, { type="NEWS", url }) {
  const r = await fetch(endpoints.addSource(campaignId), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ type, url, campaignId }),
  });
  if (!r