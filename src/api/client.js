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

