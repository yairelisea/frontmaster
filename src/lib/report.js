// src/lib/report.js
// Versión sin dependencias externas (sin jspdf / jspdf-autotable)
// Genera un reporte imprimible (HTML) y abre el diálogo del navegador para "Imprimir como PDF".
// Si en el futuro vuelves a añadir jsPDF, podrás reintroducirlo aquí sin romper el build.

function toPercent(score) {
  if (score == null || isNaN(score)) return null;
  const norm = score >= -1 && score <= 1 ? (score + 1) / 2 : score;
  return Math.round(Math.max(0, Math.min(1, norm)) * 100);
}

function fmtDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    if (!isNaN(dt)) return dt.toLocaleDateString();
  } catch {}
  return String(d);
}

function short(text, n = 180) {
  if (!text) return "";
  return text.length > n ? text.slice(0, n - 1) + "…" : text;
}

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Genera un HTML imprimible con el reporte y abre la ventana de impresión.
 * El usuario puede guardar como PDF desde el diálogo de impresión.
 *
 * @param {object} analysis - objeto normalizado (summary, sentiment_label, sentiment_score_percent, topics, items[])
 * @param {object} campaign - campaña { name, query, country, lang, createdAt, ... }
 * @param {object} options  - { logoUrl?, filename? }
 */
export async function generateAnalysisPDF(analysis, campaign, options = {}) {
  // Datos base
  const {
    summary,
    sentiment_label,
    sentiment_score,
    sentiment_score_percent,
    topics = [],
    items = [],
  } = analysis || {};

  const {
    name = "Reporte",
    query = "",
    country = "",
    lang = "",
    createdAt = "",
  } = campaign || {};

  const scorePct =
    typeof sentiment_score_percent === "number"
      ? sentiment_score_percent
      : toPercent(sentiment_score);

  const meta = [
    ["Nombre", name || "-"],
    ["Búsqueda", query || "-"],
    ["País / Idioma", `${country || "-"} / ${lang || "-"}`],
    ["Creada", fmtDate(createdAt) || "-"],
    ["Sentimiento (Etiqueta)", sentiment_label || "N/A"],
    ["Sentimiento (Score)", scorePct != null ? `${scorePct}%` : "N/A"],
  ];

  // HTML inline (estilos sencillos y “chips” verdes para temas)
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Reporte – ${esc(name)}</title>
<style>
  :root{
    --brand-green: #16a34a; /* green-600 */
    --brand-green-500:#22c55e; /* green-500 */
    --brand-green-100:#dcfce7; /* green-100 */
    --muted:#6b7280; /* gray-500 */
    --border:#e5e7eb; /* gray-200 */
    --bg:#ffffff;
    --text:#111827; /* gray-900 */
  }
  *{ box-sizing: border-box; }
  body{ margin:0; padding:32px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"; color:var(--text); background:var(--bg); }
  .container{ max-width: 1024px; margin: 0 auto; }
  .header{ display:flex; align-items:center; gap:16px; margin-bottom: 8px; }
  .logo{ height:48px; object-fit:contain; }
  h1{ font-size: 20px; margin: 0 0 6px; }
  .meta{ border:1px solid var(--border); border-radius:8px; padding:12px 16px; margin-bottom: 16px; }
  .meta dl{ display:grid; grid-template-columns: 160px 1fr; gap:8px 16px; margin:0; }
  .meta dt{ color:var(--muted); }
  .meta dd{ margin:0; }
  .block{ margin-top: 18px; }
  .block h2{ font-size:16px; margin:0 0 8px; }
  .summary{ white-space: pre-wrap; line-height:1.45; }
  .chips{ display:flex; flex-wrap: wrap; gap:8px; }
  .chip{ background: var(--brand-green-100); color: var(--brand-green); border:1px solid var(--brand-green-500); padding: 4px 8px; border-radius: 999px; font-size: 12px; }
  table{ width:100%; border-collapse: collapse; }
  thead th{ text-align:left; background: var(--brand-green-500); color: #fff; padding:8px; font-size:12px; }
  tbody td{ border:1px solid var(--border); padding:8px; vertical-align: top; font-size:12px; }
  .muted{ color: var(--muted); }
  .url{ color:#64748b; text-decoration: underline; }
  @media print{
    a.url{ color:#000; text-decoration:none; }
    .no-print{ display:none; }
    body{ padding: 12mm; }
  }
  .actions{ margin: 12px 0 24px; }
  .actions button{ padding: 8px 12px; border:1px solid var(--border); background:#fff; border-radius:6px; cursor:pointer; }
  .actions button.primary{ background: var(--brand-green); color:#fff; border-color: var(--brand-green); }
</style>
</head>
<body>
  <div class="container">
    <div class="header">
      ${options.logoUrl ? `<img class="logo" src="${esc(options.logoUrl)}" alt="logo" />` : ""}
      <div>
        <h1>BlackBox Monitor – Reporte de Campaña</h1>
        <div class="muted">Generado automáticamente</div>
      </div>
    </div>

    <div class="meta">
      <dl>
        ${meta.map(([k,v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}
      </dl>
    </div>

    <div class="block">
      <h2>Resumen Ejecutivo</h2>
      <div class="summary">${esc(summary || "Sin resumen disponible.")}</div>
    </div>

    <div class="block">
      <h2>Temas</h2>
      <div class="chips">
        ${Array.isArray(topics) && topics.length ? topics.map(t => `<span class="chip">${esc(t)}</span>`).join("") : `<span class="muted">Sin temas detectados</span>`}
      </div>
    </div>

    <div class="block">
      <h2>Artículos Analizados</h2>
      <table>
        <thead>
          <tr>
            <th style="width:24px">#</th>
            <th style="width:36%">Título</th>
            <th style="width:14%">Fuente</th>
            <th style="width:12%">Fecha</th>
            <th style="width:10%">Sent.</th>
            <th style="width:20%">Resumen</th>
            <th style="width:8%">URL</th>
          </tr>
        </thead>
        <tbody>
          ${
            (Array.isArray(items) ? items : [])
              .map((it, i) => {
                const mini = it?.llm?.summary || it?.summary || it?.snippet || "";
                const url = it?.url || it?.link || "";
                const src = it?.source || it?.site || "";
                const when = fmtDate(it?.pubDate || it?.publishedAt);
                const itemScorePct = toPercent(
                  typeof it?.llm?.sentiment_score === "number" ? it.llm.sentiment_score : it?.sentiment_score
                );
                return `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${esc(short(it?.title || it?.headline || "—", 120))}</td>
                    <td>${esc(short(src, 40))}</td>
                    <td>${esc(when)}</td>
                    <td style="text-align:right">${itemScorePct != null ? itemScorePct + "%" : ""}</td>
                    <td>${esc(short(mini, 200))}</td>
                    <td>${url ? `<a class="url" href="${esc(url)}" target="_blank" rel="noreferrer">Abrir</a>` : ""}</td>
                  </tr>
                `;
              })
              .join("")
          }
        </tbody>
      </table>
    </div>

    <div class="actions no-print">
      <button class="primary" onclick="window.print()">Imprimir / Guardar como PDF</button>
      <button onclick="(function(){
        const blob = new Blob([document.documentElement.outerHTML], {type: 'text/html;charset=utf-8'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = "${(options.filename || `Reporte_${name || 'campaña'}`).replace(/\s+/g,'_')}.html";
        a.click();
        setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
      })()">Descargar HTML</button>
    </div>
  </div>
</body>
</html>`;

  // Abrimos nueva ventana y escribimos el HTML
  const w = window.open("", "_blank");
  if (!w) {
    // Si el popup fue bloqueado, descargamos el HTML como archivo
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (options.filename || `Reporte_${name || "campaña"}`).replace(/\s+/g, "_") + ".html";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

/**
 * API mínima para exportar CSV con artículos (opcional)
 */
export function downloadArticlesCSV(analysis, filename = "articulos.csv") {
  const items = Array.isArray(analysis?.items) ? analysis.items : [];
  const headers = ["#", "titulo", "fuente", "fecha", "sentimiento%", "url"];
  const rows = items.map((it, i) => {
    const src = it?.source || it?.site || "";
    const url = it?.url || it?.link || "";
    const when = fmtDate(it?.pubDate || it?.publishedAt);
    const pct = toPercent(
      typeof it?.llm?.sentiment_score === "number" ? it.llm.sentiment_score : it?.sentiment_score
    );
    const title = (it?.title || it?.headline || "").replace(/"/g, '""');
    return [i + 1, `"${title}"`, `"${src}"`, `"${when}"`, pct != null ? pct : "", `"${url}"`].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}