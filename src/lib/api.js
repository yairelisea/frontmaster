// src/lib/api.js
const BASE_URL = import.meta.env.VITE_API_URL;
const API = import.meta.env.VITE_API_URL; // ej: https://masterback.onrender.com
const FAKE_USER = import.meta.env.VITE_FAKE_USER_ID || "dev-user-1";


function withHeaders(init = {}) {
  const headers = new Headers(init.headers || {});
  const uid = import.meta.env.VITE_FAKE_USER_ID;
  const asAdmin = String(import.meta.env.VITE_ADMIN_HEADER) === "true";
  if (uid) headers.set("x-user-id", uid);
  if (asAdmin) headers.set("x-admin", "true");
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  return { ...init, headers };
}

function jsonHeaders(extra = {}) {
  return {
    "Content-Type": "application/json",
    "x-user-id": FAKE_USER,
    ...extra,
  };
}


async function handle(resp) {
  const isJson = resp.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await resp.json() : await resp.text();
  if (!resp.ok) {
    const detail = body?.detail || body?.message || resp.statusText;
    throw new Error(detail);
  }
  return body;
}

export async function fetchCampaigns() {
  const res = await fetch(`${API}/campaigns`, { headers: jsonHeaders() });
  if (!res.ok) throw new Error("Error fetching campaigns");
  return res.json();
}

export async function analyzeNews({ q, size = 25, days_back = 14, overall = true, lang = "es-419", country = "MX" }) {
  const params = new URLSearchParams({
    q,
    size: String(size),
    days_back: String(days_back),
    overall: String(overall),
    lang,
    country,
  });
  const res = await fetch(`${API}/ai/analyze-news?${params.toString()}`, {
    headers: jsonHeaders(),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`AI analyze failed: ${res.status} ${err}`);
  }
  return res.json(); // ← devuelve { summary, sentiment_label, sentiment_score, topics, perception, ... }
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


export const api = {
  async get(path, { params } = {}) {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    const resp = await fetch(`${BASE_URL}${path}${qs}`, withHeaders({ method: "GET" }));
    return { data: await handle(resp) };
  },
  async post(path, data) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "POST", body: JSON.stringify(data) }));
    return { data: await handle(resp) };
  },
  async del(path) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "DELETE" }));
    return { data: await handle(resp) };
  },
  async put(path, data) {
    const resp = await fetch(`${BASE_URL}${path}`, withHeaders({ method: "PUT", body: JSON.stringify(data) }));
    return { data: await handle(resp) };
  },
};
