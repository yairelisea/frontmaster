// src/lib/report.js
// Estrategia híbrida: 1) intento pop-up/print, 2) fallback a backend /reports/pdf

const API = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

// ---------- Utilidades ----------
function esc(str) {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
function pctFrom(score, pct) {
  if (typeof pct === "number") return Math.round(pct);
  if (typeof score === "number") return Math.round(((score + 1) / 2) * 100);
  return null;
}
function buildHTML({ campaign, analysis }) {
  const title = `${campaign?.name || campaign?.query || "Campaña"} — Reporte`;
  const overallPct = pctFrom(analysis?.sentiment_score, analysis?.sentiment_score_pct);

  const itemsHtml = (Array.isArray(analysis?.items) ? analysis.items.slice(0, 50) : [])
    .map((it, idx) => {
      const itPct = pctFrom(it?.llm?.sentiment_score, it?.llm?.sentiment_score_pct);
      const itLabel = it?.llm?.sentiment_label || null;
      const short = it?.llm?.summary || it?.summary || "";
      const source = it?.source || "";
      const url = it?.url || it?.link || "";

      return `
        <div class="item">
          <div class="item-title">${esc(it.title || it.headline || `Nota ${idx + 1}`)}</div>
          <div class="item-meta">
            ${itLabel ? `<span class="tag">${esc(itLabel)}</span>` : ""}
            ${typeof itPct === "number" ? `<span class="tag pct">${itPct}%</span>` : ""}
            ${source ? `<span class="source">${esc(source)}</span>` : ""}
            ${url ? `<a class="url" href="${esc(url)}" target="_blank" rel="noreferrer">Abrir</a>` : ""}
          </div>
          ${short ? `<div class="item-summary">${esc(short)}</div>` : ""}
        </div>
      `;
    })
    .join("");

  const topicsHtml = (Array.isArray(analysis?.topics) ? analysis.topics : [])
    .map((t) => `<span class="topic">${esc(t)}</span>`)
    .join("");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <style>
    :root {
      --brand: #059669; /* emerald-600 */
      --ink: #0f172a;   /* slate-900 */
      --muted: #64748b; /* slate-500 */
      --border: #e5e7eb;/* gray-200 */
      --bg: #ffffff;
    }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 24px; font: 14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,"Helvetica Neue",Arial,"Noto Sans",sans-serif; color: var(--ink); background: var(--bg); }
    .report { max-width: 900px; margin: 0 auto; }
    header { display:flex; align-items:center; justify-content:space-between; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 700; }
    .meta { color: var(--muted); font-size: 12px; }
    .overall { display:grid; grid-template-columns: 1fr 2fr; gap: 16px; border:1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 16px; }
    .box { border:1px solid var(--border); border-radius: 10px; padding: 12px; }
    .box .label { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
    .sentiment { font-weight: 600; }
    .topics { display:flex; flex-wrap:wrap; gap: 6px; }
    .topic { display:inline-block; padding: 4px 8px; border-radius:999px; background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; font-size: 12px; }
    h2 { margin: 16px 0 8px; font-size: 18px; }
    .item { border:1px solid var(--border); border-radius: 10px; padding: 12px; margin-bottom: 10px; }
    .item-title { font-weight: 600; margin-bottom: 6px; }
    .item-meta { color: var(--muted); font-size: 12px; display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom: 6px; }
    .tag { display:inline-block; padding:2px 6px; border-radius: 6px; background:#f1f5f9; color:#334155; border:1px solid #e2e8f0; }
    .tag.pct { background:#ecfeff; color:#075985; border-color:#bae6fd; }
    .source { opacity: .9; }
    .url { color: var(--brand); text-decoration: underline; }
    .foot { color: var(--muted); font-size: 11px; text-align:center; margin-top: 16px; }
    @media print { header { border-bottom: none; } .report { max-width: 100%; } }
  </style>
</head>
<body>
  <div class="report">
    <header>
      <div class="title">${esc(campaign?.name || campaign?.query || "Campaña")}</div>
      <div class="meta">${new Date().toLocaleString()}</div>
    </header>

    <section class="overall">
      <div class="box">
        <div class="label">Sentimiento</div>
        <div class="sentiment">${esc(analysis?.sentiment_label ?? "N/A")}</div>
        ${typeof overallPct === "number" ? `<div class="meta">Sentimiento: ${overallPct}%</div>` : ""}
      </div>
      <div class="box">
        <div class="label">Resumen</div>
        <div>${esc(analysis?.summary || "Sin resumen.")}</div>
      </div>
    </section>

    ${topicsHtml ? `
    <section class="box" style="margin-bottom:16px">
      <div class="label">Temas relevantes</div>
      <div class="topics">${topicsHtml}</div>
    </section>` : ""}

    <h2>Artículos analizados</h2>
    ${itemsHtml || `<div class="meta">No se encontraron artículos.</div>`}

    <div class="foot">BLACKBOX MONITOR — Reporte generado automáticamente</div>
  </div>
  <script>
    window.addEventListener('load', () => { setTimeout(() => { window.print(); }, 120); });
    window.addEventListener('afterprint', () => { setTimeout(() => { window.close(); }, 200); });
  </script>
</body>
</html>`;
}

// ----------------------------------------
// Nuevas utilidades para nombre de archivo
function sanitizeFilename(name) {
  if (!name) return "reporte.pdf";
  // quita caracteres raros y espacios -> _
  const base = String(name)
    .normalize("NFKD")
    .replace(/[^\w\s.-]+/g, "") // solo letras/numeros/guion/punto/espacio
    .trim()
    .replace(/\s+/g, "_");
  return base.length ? `${base}.pdf` : "reporte.pdf";
}

function parseFilenameFromHeaders(headers) {
  const cd = headers.get("content-disposition"); // e.g. attachment; filename="Reporte_X.pdf"
  if (!cd) return null;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)"?/i.exec(cd);
  if (match && match[1]) {
    try {
      // si viene urlencoded (RFC5987)
      const decoded = decodeURIComponent(match[1]);
      return sanitizeFilename(decoded.replace(/\.pdf$/i, ""));
    } catch {
      return sanitizeFilename(match[1].replace(/\.pdf$/i, ""));
    }
  }
  return null;
}
// ----------------------------------------

// ---------- 1) Pop-up / Print (rápido) ----------
export function tryOpenPrint({ campaign, analysis }) {
  // Abrimos la ventana *sincrónicamente* (importante para no ser bloqueado)
  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) throw new Error("POPUP_BLOCKED");
  const html = buildHTML({ campaign, analysis });
  w.document.open();
  w.document.write(html);
  w.document.close();
}

// ---------- 2) Fallback al backend ----------
export async function requestBackendPDF({ apiBase, payload, filename = "reporte.pdf" }) {
  // apiBase -> VITE_API_URL (ej: https://masterback.onrender.com)
  const url = `${apiBase}/reports/pdf`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Intenta leer el texto de error para debug
    let errText = "";
    try { errText = await res.text(); } catch {}
    throw new Error(`PDF request failed: ${res.status} ${errText}`);
  }

  const ct = res.headers.get("content-type") || "";
  if (!ct.toLowerCase().includes("application/pdf")) {
    const txt = await res.text();
    throw new Error(`Backend returned non-PDF: ${txt}`);
  }

  const blob = await res.blob();
  const href = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(href);
}

export async function fallbackDownloadFromBackend({ campaign, analysis }) {
  if (!API) throw new Error("VITE_API_URL no configurada");
  const filename = `${campaign?.name || campaign?.query || "Reporte"}.pdf`;
  await requestBackendPDF({
    apiBase: API,
    payload: { campaign, analysis },
    filename,
  });
}

// Agregar la nueva función que solicita el PDF y respeta Content-Disposition / credentials
export async function downloadPdfFromBackend({ apiBase, campaign, analysis }) {
  if (!apiBase) throw new Error("apiBase requerido");
  if (!analysis) throw new Error("analysis requerido");

  const res = await fetch(`${apiBase}/reports/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ campaign, analysis }),
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`PDF request failed: ${res.status} ${text || res.statusText}`);
  }

  // Intenta obtener el nombre desde Content-Disposition
  const cd = res.headers.get("Content-Disposition") || "";
  let filename = "Reporte.pdf";
  const m = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  if (m && m[1]) {
    filename = m[1];
  } else {
    // Fallback con nombre seguro
    const base = (campaign?.name || campaign?.query || "Reporte")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^A-Za-z0-9._-]/g, "");
    filename = (base || "Reporte") + ".pdf";
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;   // <- fuerza descarga; no abre pestaña
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Nueva función: descarga el PDF desde la API sin abrir pestaña y con opción de token
/**
 * Llama al backend y descarga el PDF SIN abrir pestaña.
 * @param {Object} opts
 * @param {Object} opts.campaign - objeto campaña (para nombre por defecto)
 * @param {Object} opts.analysis - resultado de análisis (raw)
 * @param {string} [opts.apiBase] - base de API; default: import.meta.env.VITE_API_URL
 * @param {string} [opts.authToken] - Bearer token si aplica
 */
export async function downloadAnalysisPDFViaAPI({ campaign, analysis, apiBase, authToken } = {}) {
  if (!analysis) throw new Error("Falta 'analysis' para generar el PDF.");

  const base = (apiBase || import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
  const url = `${base}/reports/pdf`;

  const headers = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ campaign: campaign || {}, analysis }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      detail = await res.text();
    } catch {}
    throw new Error(`PDF request failed: ${res.status} ${detail}`);
  }

  const blob = await res.blob();
  // nombre desde header o desde campaña
  const fromHeader = parseFilenameFromHeaders(res.headers);
  const filename = fromHeader || sanitizeFilename(campaign?.name || campaign?.query || "Reporte");

  const blobUrl = URL.createObjectURL(blob);
  try {
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    // limpieza
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    }, 1000);
  } catch (err) {
    URL.revokeObjectURL(blobUrl);
    throw err;
  }
}

// ---------- API pública ----------
/** Export único que usa popup y, si falla, usa backend. */
export async function exportAnalysis({ campaign, analysis }) {
  try {
    // Debe llamarse DIRECTO en el onClick del botón (gesto de usuario)
    tryOpenPrint({ campaign, analysis });
  } catch (e) {
    // Si el navegador bloquea popups, vamos al backend
    if (String(e?.message) === "POPUP_BLOCKED") {
      await fallbackDownloadFromBackend({ campaign, analysis });
    } else {
      throw e;
    }
  }
}

// Alias para compatibilidad con imports previos
export const openPrintPreview = exportAnalysis;
export const generatePDF = exportAnalysis;
// Los siguientes aliases ahora apuntan a la nueva función que descarga via API
export const generateAnalysisPDF = downloadAnalysisPDFViaAPI;
export const downloadAnalysisPDF = downloadAnalysisPDFViaAPI;