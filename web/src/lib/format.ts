export function fmtDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtDateInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
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
  const nac = new Date(fechaNacimiento);
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
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const hoy = new Date();
  const ms = d.getTime() - hoy.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
