const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
const FAKE_USER = import.meta.env.VITE_FAKE_USER_ID || "dev-user-1";

function jsonHeaders(extra = {}) {
  return { "Content-Type": "application/json", "x-user-id": FAKE_USER, ...extra };
}

async function fetchWithTimeout(url, options = {}, ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { ...options, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchCampaigns() {
  if (!API) throw new Error("VITE_API_URL no está definido");

  // 1) con header
  const r1 = await fetchWithTimeout(`${API}/campaigns`, { headers: jsonHeaders() });
  if (r1.ok) return r1.json();

  // 2) fallback con query param (si algún proxy borró el header)
  const url = new URL(`${API}/campaigns`);
  url.searchParams.set("userId", FAKE_USER);
  const r2 = await fetchWithTimeout(url.toString(), { headers: { "Content-Type": "application/json" } });
  if (!r2.ok) throw new Error(`GET /campaigns falló: ${r2.status} ${await r2.text()}`);
  return r2.json();
}