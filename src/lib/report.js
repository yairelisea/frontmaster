// src/lib/report.js
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Convierte un score de -1..1 o 0..1 a porcentaje 0..100
 */
function toPercent(score) {
  if (score == null || isNaN(score)) return null;
  // si viene en -1..1 lo llevamos a 0..1
  const norm = score >= -1 && score <= 1 ? (score + 1) / 2 : score;
  return Math.round(Math.max(0, Math.min(1, norm)) * 100);
}

function fmtDate(d) {
  if (!d) return "";
  // acepta ISO o pubDate RSS
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

/**
 * Dibuja "chips" (tópicos) en verde. Devuelve la nueva Y.
 */
function drawGreenChips(doc, topics = [], startX, startY, maxWidth) {
  const padX = 3;
  const padY = 1.6;
  const gap = 3;
  const lineH = 8;

  let x = startX;
  let y = startY;
  const fontSize = 10;

  doc.setFontSize(fontSize);

  topics.forEach((t) => {
    const label = String(t);
    const w = doc.getTextWidth(label) + padX * 2;
    if (x + w > maxWidth) {
      // salto de línea
      x = startX;
      y += lineH;
    }
    // chip verde
    doc.setDrawColor(34, 197, 94);  // verde (tailwind green-500 aprox)
    doc.setFillColor(220, 252, 231); // verde claro (green-100)
    doc.roundedRect(x, y - fontSize + 6, w, lineH, 2, 2, "FD");
    doc.setTextColor(22, 163, 74); // green-600
    doc.text(label, x + padX, y);
    x += w + gap;
  });

  doc.setTextColor(33, 37, 41); // reset (gris oscuro)
  return y + 2;
}

/**
 * Genera el PDF de resultados de análisis
 *
 * @param {object} analysis - objeto normalizado (summary, sentiment_label, sentiment_score_percent, topics, items[])
 * @param {object} campaign - campaña { name, query, country, lang, createdAt, ... }
 * @param {object} options  - { logoUrl?, filename? }
 */
export async function generateAnalysisPDF(analysis, campaign, options = {}) {
  const {
    summary,
    sentiment_label,
    sentiment_score,
    sentiment_score_percent, // si tu normalización ya lo calcula
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

  const { logoUrl = null, filename = `Reporte_${name || "campaña"}.pdf` } = options;

  const doc = new jsPDF({ unit: "pt", format: "a4" }); // 595 x 842 pt aprox
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // --------- Portada ----------
  if (logoUrl) {
    try {
      // Cargamos logo como image (base64)
      const dataUrl = await fetch(logoUrl)
        .then((r) => r.blob())
        .then(
          (b) =>
            new Promise((res) => {
              const fr = new FileReader();
              fr.onload = () => res(fr.result);
              fr.readAsDataURL(b);
            })
        );
      // ancho máx 140
      const imgW = 140;
      doc.addImage(dataUrl, "PNG", margin, y, imgW, imgW * 0.26);
    } catch {
      // si falla, seguimos sin logo
    }
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("BlackBox Monitor – Reporte de Campaña", margin, y + 80);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  const infoLines = [
    `Nombre: ${name || "-"}`,
    `Búsqueda: ${query || "-"}`,
    `País / Idioma: ${country || "-"} / ${lang || "-"}`,
    `Creada: ${fmtDate(createdAt) || "-"}`,
  ];
  infoLines.forEach((line, i) => {
    doc.text(line, margin, y + 110 + i * 16);
  });

  // Bloque de sentimiento en %
  const scorePct =
    typeof sentiment_score_percent === "number"
      ? sentiment_score_percent
      : toPercent(sentiment_score);
  const label = sentiment_label || "N/A";

  // tarjeta
  doc.setDrawColor(229, 231, 235);
  doc.roundedRect(margin, y + 150, pageW - margin * 2, 70, 6, 6);
  doc.setFont("helvetica", "bold");
  doc.text("Sentimiento (IA)", margin + 12, y + 170);
  doc.setFont("helvetica", "normal");
  doc.text(`Etiqueta: ${label}`, margin + 12, y + 190);
  doc.text(
    `Score: ${scorePct != null ? scorePct + " %" : "N/A"}`,
    margin + 12,
    y + 206
  );

  // --------- Resumen ----------
  let blockTop = y + 240;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Resumen Ejecutivo", margin, blockTop);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const summaryText = summary || "Sin resumen disponible.";
  const summaryLines = doc.splitTextToSize(summaryText, pageW - margin * 2);
  doc.text(summaryLines, margin, blockTop + 18);

  // --------- Tópicos (verde) ----------
  let topicsY = blockTop + 18 + summaryLines.length * 13 + 12;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Temas", margin, topicsY);
  topicsY += 16;
  topicsY = drawGreenChips(doc, topics, margin, topicsY, pageW - margin);

  // salto de página si estamos muy abajo
  if (topicsY > 700) {
    doc.addPage();
    topicsY = margin;
  }

  // --------- Tabla de artículos ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Artículos Analizados", margin, topicsY + 16);

  // Construimos filas
  const rows = (Array.isArray(items) ? items : []).map((it, i) => {
    // Cada item podría venir con it.llm.summary (mini resumen por ítem) – si no, vacio
    const mini =
      it.llm?.summary ||
      it.summary ||
      it.snippet ||
      ""; // usamos lo que tengamos

    const url = it.url || it.link || "";
    const src = it.source || it.site || "";
    const when = fmtDate(it.pubDate || it.publishedAt);

    // sentimiento por item (si existiera en llm)
    const itemScorePct = toPercent(
      typeof it.llm?.sentiment_score === "number"
        ? it.llm.sentiment_score
        : it.sentiment_score
    );
    const itemLbl = it.llm?.sentiment_label || it.sentiment_label || "";

    return [
      String(i + 1),
      short(it.title || it.headline || "—", 80),
      short(src, 30),
      when,
      itemScorePct != null ? itemScorePct + "%" : "",
      short(mini, 120),
      short(url, 40),
    ];
  });

  doc.autoTable({
    startY: topicsY + 26,
    head: [["#", "Título", "Fuente", "Fecha", "Sent.", "Resumen", "URL"]],
    body: rows,
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 4,
      overflow: "linebreak",
      valign: "top",
    },
    headStyles: {
      fillColor: [34, 197, 94], // verde
      textColor: 255,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 18 },
      1: { cellWidth: 170 },
      2: { cellWidth: 90 },
      3: { cellWidth: 60 },
      4: { cellWidth: 40, halign: "right" },
      5: { cellWidth: 160 },
      6: { cellWidth: 90 },
    },
    didParseCell(data) {
      // URLs en gris
      if (data.section === "body" && data.column.index === 6) {
        data.cell.styles.textColor = [100, 116, 139];
      }
    },
  });

  doc.save(filename);
}

/**
 * Ejemplo de uso en un botón:
 *
 * import { generateAnalysisPDF } from "@/lib/report";
 *
 * <Button onClick={() => generateAnalysisPDF(analysisData, campaign, {
 *   logoUrl: "/logo.png",
 *   filename: `Reporte_${campaign.name}.pdf`
 * })}>
 *   Descargar PDF
 * </Button>
 */