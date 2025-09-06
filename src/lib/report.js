// src/lib/report.js
import { getAuthToken } from "@/lib/api";

const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

export async function downloadAnalysisPDF({ campaign, analysis }) {
  if (!API) throw new Error("VITE_API_URL no está definido");

  const headers = new Headers({ "Content-Type": "application/json" });
  const t = getAuthToken();
  if (t) headers.set("Authorization", `Bearer ${t}`);
  // Si usas x-user-id en dev:
  const fake = import.meta.env.VITE_FAKE_USER_ID;
  if (fake && !t) headers.set("x-user-id", fake);

  const res = await fetch(`${API}/reports/analysis`, {
    method: "POST",
    headers,
    body: JSON.stringify({ campaign, analysis }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Report PDF failed: ${res.status} ${text}`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (campaign?.name || "reporte").replace(/\s+/g, "_");
  a.download = `reporte_${safeName}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}