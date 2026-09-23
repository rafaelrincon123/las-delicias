"use client";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportColumn<T> {
  header: string;
  /** Extrae el valor de texto de la fila para esta columna. */
  value: (row: T) => string;
  /** Ancho relativo opcional (jspdf-autotable reparte el resto proporcional). */
  width?: number;
}

export interface ReportOptions<T> {
  /** Nombre de la finca, aparece en el encabezado. */
  finca: string;
  /** Título de la sección, ej. "Animales", "Gastos". */
  titulo: string;
  /** Subtítulo opcional, ej. filtros aplicados o rango de fechas. */
  subtitulo?: string;
  columnas: ReportColumn<T>[];
  filas: T[];
  /** Líneas de resumen al final (ej. totales). */
  resumen?: { label: string; valor: string }[];
  /** Nombre del archivo sin extensión. */
  nombreArchivo: string;
}

const FOREST = "#14261A";
const LIME = "#B8CE7A";
const MUTED = "#52584E";

/**
 * Genera un PDF con encabezado de marca (RumeApp + finca + sección) y una
 * tabla de datos, y dispara la descarga en el navegador. Todo corre en el
 * cliente — no hay servidor ni Edge Function involucrada.
 */
export function generarReportePDF<T>(opts: ReportOptions<T>): void {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 32;

  // Encabezado
  doc.setFillColor(FOREST);
  doc.rect(0, 0, pageWidth, 64, "F");
  doc.setTextColor(LIME);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RUMEAPP", margin, 28);
  doc.setTextColor("#FFFFFF");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(opts.finca, margin, 44);

  doc.setTextColor(FOREST);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(opts.titulo, margin, 88);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(MUTED);
  const fecha = new Date().toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  });
  doc.text(`Generado el ${fecha}`, margin, 104);
  if (opts.subtitulo) {
    doc.text(opts.subtitulo, margin, 118);
  }

  const startY = opts.subtitulo ? 132 : 118;

  autoTable(doc, {
    startY,
    margin: { left: margin, right: margin },
    head: [opts.columnas.map((c) => c.header)],
    body: opts.filas.map((row) => opts.columnas.map((c) => c.value(row))),
    headStyles: { fillColor: FOREST, textColor: "#FFFFFF", fontStyle: "bold" },
    alternateRowStyles: { fillColor: "#F8F5EE" },
    styles: { fontSize: 8, cellPadding: 5, textColor: "#1A2418" },
    columnStyles: Object.fromEntries(
      opts.columnas.map((c, i) => [i, c.width ? { cellWidth: c.width } : {}])
    ),
  });

  if (opts.resumen && opts.resumen.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const finalY = (doc as any).lastAutoTable?.finalY ?? startY + 20;
    let y = finalY + 24;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(FOREST);
    for (const r of opts.resumen) {
      doc.text(`${r.label}: ${r.valor}`, margin, y);
      y += 16;
    }
  }

  const totalPaginas = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(MUTED);
    doc.text(
      `${opts.filas.length} registro${opts.filas.length === 1 ? "" : "s"} · Página ${i} de ${totalPaginas}`,
      margin,
      doc.internal.pageSize.getHeight() - 16
    );
  }

  const nombreLimpio = opts.nombreArchivo
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-").toLowerCase();
  doc.save(`${nombreLimpio}-${new Date().toISOString().slice(0, 10)}.pdf`);
}
