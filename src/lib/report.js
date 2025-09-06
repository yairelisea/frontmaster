// src/lib/report.js
// Genera un PDF del panel actual SIN romper el build (carga html2pdf.js desde CDN en runtime)

const HTML2PDF_CDN =
  "https://cdn.jsdelivr.net/npm/html2pdf.js@0.10.1/dist/html2pdf.bundle.min.js";

/**
 * Genera un PDF del contenedor indicado.
 * - selector: CSS del nodo (ej. "#analysis-panel")
 * - filename: nombre del archivo (ej. "analisis.pdf")
 * - includeLinksList: si true, agrega una sección “Fuentes / Enlaces” con links clickeables
 */
export async function generateAnalysisPDF(
  selector = "#analysis-panel",
  filename = "analisis.pdf",
  includeLinksList = true
) {
  await ensureHtml2PdfLoaded();

  const el = document.querySelector(selector);
  if (!el) throw new Error(`No se encontró el contenedor: ${selector}`);

  // (Opcional) inyectar una lista de links clickeables al final
  let linksContainer = null;
  if (includeLinksList) {
    const links = Array.from(el.querySelectorAll("a[href]"))
      .map(a => ({ text: (a.textContent || "").trim(), href: a.getAttribute("href") }))
      .filter(x => x.href && /^https?:\/\//i.test(x.href));

    if (links.length) {
      linksContainer = document.createElement("div");
      linksContainer.setAttribute("data-temp-links", "true");
      linksContainer.style.marginTop = "24px";
      linksContainer.innerHTML = `
        <h3 style="font-weight:600; margin:0 0 8px; font-size:16px;">Fuentes / Enlaces</h3>
        <ul style="padding-left:18px; margin:0;">
          ${links.map(({ text, href }, i) => {
            const display = text || `Enlace ${i + 1}`;
            const short = href.length > 90 ? href.slice(0, 90) + "…" : href;
            return `<li style="margin:6px 0;">
              <span>${escapeHtml(display)} — </span>
              <a href="${href}" target="_blank" rel="noreferrer" style="color:#0a7; text-decoration:underline;">${escapeHtml(short)}</a>
            </li>`;
          }).join("")}
        </ul>
      `;
      el.appendChild(linksContainer);
    }
  }

  // Config de html2pdf
  const opt = {
    margin: 10,
    filename,
    image: { type: "jpeg", quality: 0.96 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: ["css", "legacy"] }, // respeta page-break-* en CSS si los agregas
  };

  try {
    await window.html2pdf().set(opt).from(el).save();
  } finally {
    // Limpieza: quitar el bloque temporal de links
    if (linksContainer && linksContainer.parentNode) {
      linksContainer.parentNode.removeChild(linksContainer);
    }
  }
}

function ensureHtml2PdfLoaded() {
  if (window.html2pdf) return Promise.resolve();
  return loadScript(HTML2PDF_CDN);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const tag = document.createElement("script");
    tag.src = src;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    document.head.appendChild(tag);
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}