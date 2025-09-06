// src/lib/report.js
// Generación de reporte en PDF con dos modos:
//  A) BACKEND: envía HTML a /reports/render-pdf y descarga el PDF (recomendado).
//  B) Fallback FRONT: abre ventana e invoca window.print() (sin dependencias).

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

function safeFileName(s) {
  const base = (s || "Reporte").toString();
  return base.replace(/[\/\\?%*:|"<>]/g, "_").slice(0, 80);
}

/**
 * Construye el HTML del reporte (mismo contenido que el preview).
 * No hace side-effects; sólo devuelve un string listo para renderizar/convertir.
 */
export function buildReportHTML({ campaign, analysis }) {
  const title = `${campaign?.name || campaign?.query || "Campaña"} — Reporte`;
  const overallPct = pctFrom(analysis?.sentiment_score, analysis?.sentiment_score_pct);

  // Items (recorta a 50 por si acaso)
  const itemsHtml = (Array.isArray(analysis?.items) ? analysis.items.slice(0, 50) : [])
    .map((it, idx) => {
      const itPct = pctFrom(it?.llm?.sentiment_score, it?.llm?.sentiment_score_pct);
      const itLabel = it?.llm?.sentiment_label || null;
      const short = it?.llm?.summary || it?.summary || "";
      const source = it?.source || "";
      const url = it?.url || it?.link || "";

      return `
        <div class="item">
          <div class="item-title">${esc(it?.title || it?.headline || `Nota ${idx + 1}`)}</div>
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

  const html = `<!doctype html>
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
    body {
      margin: 0; padding: 24px;
      font: 14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,"Helvetica Neue",Arial,"Noto Sans",sans-serif;
      color: var(--ink); background: var(--bg);
    }
    .report { max-width: 900px; margin: 0 auto; }
    header {
      display:flex; align-items:center; justify-content:space-between;
      border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 16px;
    }
    .title { font-size: 22px; font-weight: 700; }
    .meta { color: var(--muted); font-size: 12px; }
    .overall {
      display:grid; grid-template-columns: 1fr 2fr; gap: 16px;
      border:1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 16px;
    }
    .box { border:1px solid var(--border); border-radius: 10px; padding: 12px; }
    .box .label { font-size: 11px; color: var(--muted); margin-bottom: 4px; }
    .sentiment { font-weight: 600; }
    .topics { display:flex; flex-wrap:wrap; gap: 6px; }
    .topic {
      display:inline-block; padding: 4px 8px; border-radius:999px;
      background:#d1fae5; color:#065f46; border:1px solid #a7f3d0; font-size: 12px;
    }
    h2 { margin: 16px 0 8px; font-size: 18px; }
    .item {
      border:1px solid var(--border); border-radius: 10px; padding: 12px; margin-bottom: 10px;
    }
    .item-title { font-weight: 600; margin-bottom: 6px; }
    .item-meta { color: var(--muted); font-size: 12px; display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom: 6px; }
    .tag {
      display:inline-block; padding:2px 6px; border-radius: 6px; background:#f1f5f9; color:#334155; border:1px solid #e2e8f0;
    }
    .tag.pct { background:#ecfeff; color:#075985; border-color:#bae6fd; }
    .source { opacity: .9; }
    .url { color: var(--brand); text-decoration: underline; }
    .foot { color: var(--muted); font-size: 11px; text-align:center; margin-top: 16px; }
    @media print {
      a.url { color: var(--brand); text-decoration: underline; }
      header { border-bottom: none; }
      .report { max-width: 100%; }
    }
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
    // Mantener enlaces clicables si el motor de PDF los respeta.
  </script>
</body>
</html>`;
  return html;
}

/**
 * Modo BACKEND: envía el HTML al endpoint y descarga el PDF.
 */
export async function requestBackendPDF({ html, fileName = "Reporte.pdf" }) {
  const API = (import.meta?.env?.VITE_API_URL || "").replace(/\/+$/, "");
  if (!API) throw new Error("VITE_API_URL no está definido");

  const res = await fetch(`${API}/reports/render-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PDF request failed: ${res.status} ${err}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Modo FRONT (fallback): abre ventana y usa print().
 */
export async function openPrintPreview({ campaign, analysis }) {
  if (!campaign || !analysis) throw new Error("Faltan datos de campaña o análisis.");
  const html = buildReportHTML({ campaign, analysis });

  const w = window.open("", "_blank", "noopener,noreferrer");
  if (!w) throw new Error("No se pudo abrir la ventana de impresión (pop-up bloqueado).");
  w.document.open();
  w.document.write(html);
  w.document.close();

  // dispara print automáticamente
  w.addEventListener?.("load", () => setTimeout(() => w.print(), 100));
}

/**
 * API principal recomendada:
 * - Intenta BACKEND si hay API definida.
 * - Si falla por cualquier motivo, hace fallback al modo FRONT.
 */
export async function exportPDF({ campaign, analysis, preferBackend = true }) {
  const html = buildReportHTML({ campaign, analysis });
  const name = `${safeFileName(campaign?.name || campaign?.query)}.pdf`;

  if (preferBackend && (import.meta?.env?.VITE_API_URL || "").trim()) {
    try {
      await requestBackendPDF({ html, fileName: name });
      return;
    } catch (e) {
      // Fallback automático
      console.error("Backend PDF failed, falling back to print preview:", e);
    }
  }
  await openPrintPreview({ campaign, analysis });
}

// Aliases para compatibilidad con imports previos
export const generateAnalysisPDF = exportPDF;
export const downloadAnalysisPDF = exportPDF;
export const generatePDF = exportPDF;