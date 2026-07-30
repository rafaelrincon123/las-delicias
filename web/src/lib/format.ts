/**
 * Convierte una fecha local a "YYYY-MM-DD" sin pasar por UTC
 * (evita el desfase de un día en zonas con offset negativo como Colombia).
 */
export function ymdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** "YYYY-MM-DD" de hoy en zona local. */
export function todayISO(): string {
  return ymdLocal(new Date());
}

/**
 * Parsea una cadena de fecha. Si es "YYYY-MM-DD" la interpreta como
 * medianoche LOCAL (no UTC) para que no salte al día anterior al renderizar.
 * Cadenas ISO completas con hora/zona se parsean normal.
 */
export function parseDateLocal(iso: string): Date | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  }
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = parseDateLocal(iso);
  if (!d) return "—";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateInput(iso?: string): string {
  if (!iso) return "";
  const d = parseDateLocal(iso);
  if (!d) return "";
  return ymdLocal(d);
}

export function fmtCOP(n?: number): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtNumber(n?: number, digits = 1): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

/** Percentage: integer if whole, else 1 decimal. Used for participación. */
export function fmtPct(n?: number): string {
  if (n === undefined || n === null || isNaN(n)) return "—";
  const rounded = Math.round(n * 10) / 10;
  const digits = Number.isInteger(rounded) ? 0 : 1;
  return `${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(rounded)}%`;
}

export function edadEnMeses(fechaNacimiento?: string): number {
  if (!fechaNacimiento) return 0;
  const nac = parseDateLocal(fechaNacimiento);
  if (!nac) return 0;
  const hoy = new Date();
  return (
    (hoy.getFullYear() - nac.getFullYear()) * 12 +
    (hoy.getMonth() - nac.getMonth())
  );
}

export function edadTexto(fechaNacimiento?: string): string {
  const meses = edadEnMeses(fechaNacimiento);
  if (meses < 0) return "—";
  if (meses < 12) return `${meses} m`;
  const años = Math.floor(meses / 12);
  const resto = meses % 12;
  return resto ? `${años} a ${resto} m` : `${años} a`;
}

export function diasHasta(iso?: string): number | null {
  if (!iso) return null;
  const d = parseDateLocal(iso);
  if (!d) return null;
  // Comparar medianoche local vs. medianoche local para obtener días calendario reales.
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const now = new Date();
  const hoy = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - hoy) / (1000 * 60 * 60 * 24));
}
