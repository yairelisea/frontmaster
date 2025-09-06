// src/lib/report.js
import jsPDF from "jspdf";

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
      x = startX;
      y += lineH;
    }
    // chip verde
    doc.setDrawColor(34, 197, 94);   // green-500 aprox
    doc.setFillColor(220, 252, 231); // green-100
    doc.roundedRect(x, y - fontSize + 6, w, lineH, 2, 2, "FD");
    doc.setTextColor(22, 163, 74);   // green-600
    doc.text(label, x + padX, y);
    x += w + gap;
  });

  doc.setTextColor(33, 37, 41); // reset
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
  // 🔹 Carga dinámica para evitar errores de resolución en la build
  //    (Asegúrate de tener instalado: npm i jspdf jspdf-autotable)
  await import("jspdf-autotable");

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

  const { logoUrl = null, filename = `Reporte_${name || "campaña"}.pdf` } = options;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = margin;

  // --------- Portada ----------
  if (logoUrl) {
    try {
      const dataUrl = await fetch(logoUrl)
        .then((r) => r.blob())
        .then(
          (b) =>
            new Promise((res, rej) => {
              const fr = new FileReader();
              fr.onload = () => res(fr.result);
              fr.onerror = rej;
              fr.readAsDataURL(b);
            })
        );
      const imgW = 140;
      doc.addImage(dataUrl, "PNG", margin, y, imgW, imgW * 0.26);
    } catch {
      // si falla el logo, seguimos
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

  if (topicsY > 700) {
    doc.addPage();
    topicsY = margin;
  }

  // --------- Tabla de artículos ----------
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Artículos Analizados", margin, topicsY + 16);

  const rows = (Array.isArray(items) ? items : []).map((it, i) => {
    const mini = it.llm?.summary || it.summary || it.snippet || "";
    const url = it.url || it.link || "";
    const src = it.source || it.site || "";
    const when = fmtDate(it.pubDate || it.publishedAt);
    const itemScorePct = toPercent(
      typeof it.llm?.sentiment_score === "number"
        ? it.llm.sentiment_score
        : it.sentiment_score
    );
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
      if (data.section === "body" && data.column.index === 6) {
        data.cell.styles.textColor = [100, 116, 139]; // gris para URL
      }
    },
  });

  doc.save(filename);
}

/**
 * Uso:
 * import { generateAnalysisPDF } from "@/lib/report";
 * <Button onClick={() => generateAnalysisPDF(analysisData, campaign, {
 *   logoUrl: "/logo.png",
 *   filename: `Reporte_${campaign.name}.pdf`
 * })}>
 *   Descargar PDF
 * </Button>
 */