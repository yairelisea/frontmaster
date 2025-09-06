// src/lib/report.js
/**
 * Convierte un score -1..1 ó 0..1 a porcentaje 0..100
 */
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
  
  function esc(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }
  
  /**
   * Genera una ventana imprimible (usuario elige "Guardar como PDF")
   * analysis: { summary, sentiment_label, sentiment_score(_percent), topics, items[] }
   * campaign: { name, query, country, lang, createdAt }
   * options:  { logoUrl? }
   */
  export function generatePDF(analysis, campaign, options = {}) {
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
  
    const { logoUrl = null } = options;
  
    const scorePct =
      typeof sentiment_score_percent === "number"
        ? sentiment_score_percent
        : toPercent(sentiment_score);
  
    const head = `
      <meta charset="utf-8" />
      <title>Reporte – ${esc(name)}</title>
      <style>
        :root{
          --green:#22c55e;        /* tailwind green-500 */
          --green-600:#16a34a;    /* green-600 */
          --green-100:#dcfce7;    /* green-100 */
          --muted:#6b7280;        /* slate-500 */
          --border:#e5e7eb;       /* gray-200 */
          --text:#111827;         /* gray-900 */
          --bg:#ffffff;
        }
        *{ box-sizing: border-box; }
        body{
          font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          color: var(--text);
          background: var(--bg);
          margin: 0;
          padding: 24px;
        }
        .wrap{ max-width: 980px; margin: 0 auto; }
        header{
          display:flex; align-items:center; gap:16px; margin-bottom:16px;
        }
        header img{ height:44px; object-fit:contain; }
        h1{ font-size:20px; margin: 0; }
        .card{
          border:1px solid var(--border);
          border-radius:12px;
          padding:16px 18px;
          margin:18px 0;
        }
        .muted{ color: var(--muted); font-size: 13px; }
        .grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .chip{
          display:inline-block;
          border-radius:999px;
          background: var(--green-100);
          color: var(--green-600);
          border: 1px solid var(--green);
          padding: 4px 10px;
          margin: 4px 6px 0 0;
          font-size: 12px;
        }
        table{
          width:100%;
          border-collapse: collapse;
          margin-top: 8px;
          font-size: 13px;
        }
        th, td{
          border:1px solid var(--border);
          padding: 8px 10px;
          vertical-align: top;
        }
        thead th{
          background: var(--green);
          color: #fff;
          text-align: left;
        }
        .right{ text-align: right; }
        .small{ font-size: 12px; color: var(--muted); }
        a{ color: #0ea5e9; text-decoration: underline; word-break: break-all; }
        .title{ font-weight: 600; }
        .sent-block{
          display:flex; gap:24px; align-items:center; flex-wrap:wrap;
        }
        .sent-badge{
          border-radius: 8px; border:1px solid var(--border); padding: 10px 12px;
        }
        @media print {
          body{ padding:0; }
          .no-print{ display:none !important; }
        }
      </style>
    `;
  
    // filas de la tabla
    const rowsHtml = (Array.isArray(items) ? items : []).map((it, idx) => {
      const title = it.title || it.headline || "—";
      const url = it.url || it.link || "";
      const src = it.source || it.site || "";
      const when = fmtDate(it.pubDate || it.publishedAt);
      const mini = it.llm?.summary || it.summary || it.snippet || "";
      const pct = toPercent(
        typeof it.llm?.sentiment_score === "number"
          ? it.llm.sentiment_score
          : it.sentiment_score
      );
      return `
        <tr>
          <td class="right">${idx + 1}</td>
          <td><div class="title">${esc(title)}</div><div class="small">${src ? esc(src) : ""} ${when ? "• " + esc(when) : ""}</div></td>
          <td class="right">${pct != null ? pct + "%" : ""}</td>
          <td>${esc(mini)}</td>
          <td>${url ? `<a href="${esc(url)}" target="_blank" rel="noreferrer">${esc(url)}</a>` : ""}</td>
        </tr>
      `;
    }).join("");
  
    const topicsHtml = (Array.isArray(topics) ? topics : []).map(t => `<span class="chip">${esc(String(t))}</span>`).join("");
  
    const html = `
      <!doctype html>
      <html>
      <head>${head}</head>
      <body>
        <div class="wrap">
          <header>
            ${logoUrl ? `<img src="${esc(logoUrl)}" alt="logo">` : ""}
            <div>
              <h1>BlackBox Monitor – Reporte de Campaña</h1>
              <div class="small muted">Generado ${fmtDate(new Date())}</div>
            </div>
            <div style="margin-left:auto" class="no-print">
              <button onclick="window.print()" style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:#fff;cursor:pointer">Imprimir / Guardar PDF</button>
            </div>
          </header>
  
          <section class="card">
            <div class="grid">
              <div><strong>Nombre:</strong> ${esc(name)}</div>
              <div><strong>Búsqueda:</strong> ${esc(query)}</div>
              <div><strong>País / Idioma:</strong> ${esc(country)} / ${esc(lang)}</div>
              <div><strong>Creada:</strong> ${fmtDate(createdAt) || "-"}</div>
            </div>
          </section>
  
          <section class="card">
            <div class="sent-block">
              <div class="sent-badge"><strong>Sentimiento:</strong> ${esc(sentiment_label || "N/A")}</div>
              <div class="sent-badge"><strong>Score:</strong> ${scorePct != null ? scorePct + "%" : "N/A"}</div>
            </div>
          </section>
  
          <section class="card">
            <h3 style="margin:0 0 6px 0">Resumen Ejecutivo</h3>
            <div>${esc(summary || "Sin resumen disponible.")}</div>
          </section>
  
          <section class="card">
            <h3 style="margin:0 0 6px 0">Temas</h3>
            <div>${topicsHtml || '<span class="small muted">Sin temas</span>'}</div>
          </section>
  
          <section class="card">
            <h3 style="margin:0 0 6px 0">Artículos Analizados</h3>
            <table>
              <thead>
                <tr>
                  <th style="width:40px">#</th>
                  <th>Título / Fuente / Fecha</th>
                  <th style="width:70px">Sent.</th>
                  <th style="width:40%">Resumen</th>
                  <th style="width:22%">URL</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml || `<tr><td colspan="5" class="small muted">No se encontraron artículos.</td></tr>`}
              </tbody>
            </table>
          </section>
        </div>
      </body>
      </html>
    `;
  
    const w = window.open("", "_blank");
    if (!w) {
      alert("Bloqueado por el navegador. Permite ventanas emergentes para descargar el reporte.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }