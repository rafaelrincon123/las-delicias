import type { Finca, PlanFinca } from "./types";

// Tasa usada solo para MOSTRAR el equivalente en pesos junto al precio en
// dólares. No es una tasa de cobro real (el cobro en sí todavía no existe —
// Fase de pagos pendiente). Actualizar a mano si el mercado se mueve mucho.
export const USD_TO_COP = 3500;

// Espejo local de plan_limits en Supabase. Si cambia allá, cambiar aquí.
export const PLAN_LIMITS: Record<
  PlanFinca,
  {
    nombre: string;
    precioUSD: number;
    /** null = ilimitado */
    maxAnimales: number | null;
    /** null = ilimitado. Total de personas con acceso (cualquier rol). */
    maxUsuarios: number | null;
    /** null = sin sub-límite (cualquiera de los maxUsuarios puede editar).
     *  Ranchero=1: solo el owner edita, el resto debe ser "solo lectura". */
    maxUsuariosEditor: number | null;
    /** null = ilimitado */
    maxFincas: number | null;
  }
> = {
  ranchero: {
    nombre: "Ranchero", precioUSD: 0,
    maxAnimales: 5, maxUsuarios: 5, maxUsuariosEditor: 1, maxFincas: 1,
  },
  ganadero: {
    nombre: "Ganadero", precioUSD: 15,
    maxAnimales: 50, maxUsuarios: 5, maxUsuariosEditor: null, maxFincas: 3,
  },
  hacienda: {
    nombre: "Hacienda", precioUSD: 50,
    maxAnimales: null, maxUsuarios: null, maxUsuariosEditor: null, maxFincas: null,
  },
};

export function planLabel(plan: PlanFinca): string {
  return PLAN_LIMITS[plan]?.nombre ?? plan;
}

export function nextPlan(plan: PlanFinca): PlanFinca | null {
  if (plan === "ranchero") return "ganadero";
  if (plan === "ganadero") return "hacienda";
  return null;
}

/** COP redondeado a miles, solo para mostrar junto al precio en USD. */
export function precioCOPAprox(precioUSD: number): number {
  return Math.round((precioUSD * USD_TO_COP) / 1000) * 1000;
}

export function fmtPrecio(plan: PlanFinca): string {
  const p = PLAN_LIMITS[plan];
  if (p.precioUSD === 0) return "Gratis";
  return `US$${p.precioUSD} · ≈$${precioCOPAprox(p.precioUSD).toLocaleString("es-CO")} COP`;
}

/**
 * El plan que REALMENTE aplica ahora mismo — espejo de plan_efectivo() en
 * SQL. `fincas.plan` por sí solo puede estar "vencido" (prueba terminada)
 * o ser aspiracional (el usuario lo eligió pero nunca pagó). Usar esto,
 * no `finca.plan` crudo, para decidir límites/gates en el cliente — la
 * base de datos igual los hace cumplir vía triggers, esto es solo para
 * que la UI muestre lo correcto sin esperar un error del servidor.
 */
export function planEfectivo(finca: Pick<Finca, "plan" | "trialEndsAt" | "planPagado">): PlanFinca {
  if (finca.planPagado) return finca.plan;
  if (finca.trialEndsAt && new Date(finca.trialEndsAt) > new Date()) return finca.plan;
  return "ranchero";
}

/** Días restantes de prueba (0 si no hay prueba activa). */
export function diasDePruebaRestantes(finca: Pick<Finca, "trialEndsAt" | "planPagado">): number {
  if (finca.planPagado || !finca.trialEndsAt) return 0;
  const ms = new Date(finca.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Estado de uso vs límite. Devuelve `null` si el límite es infinito.
 * `atLimit` es true cuando ya no hay cupo.
 * `nearLimit` es true cuando queda ≤ 20% (o ≤ 2 items) de espacio.
 */
export function usageStatus(
  used: number,
  limit: number | null
): {
  limit: number | null;
  used: number;
  remaining: number | null;
  atLimit: boolean;
  nearLimit: boolean;
  pct: number | null;
} {
  if (limit === null) {
    return { limit: null, used, remaining: null, atLimit: false, nearLimit: false, pct: null };
  }
  const remaining = Math.max(0, limit - used);
  const pct = used / limit;
  return {
    limit,
    used,
    remaining,
    atLimit: used >= limit,
    nearLimit: remaining <= Math.max(2, Math.ceil(limit * 0.2)),
    pct,
  };
}

/**
 * Traduce el error de un trigger de límite de plan a un mensaje humano.
 * Los triggers en Supabase lanzan mensajes tipo:
 *   "Alcanzaste el límite de 5 animales del plan ranchero..."
 * Ese mensaje ya es amigable — solo lo reenviamos si detectamos el patrón.
 */
export function traducirErrorLimite(msg: string): string | null {
  if (/Alcanzaste el l[ií]mite/i.test(msg)) return msg;
  if (/l[ií]mite de .* fincas?/i.test(msg)) return msg;
  if (/permiso de edici[oó]n/i.test(msg)) return msg;
  if (/plan_limit|P0001/i.test(msg)) return "Alcanzaste el límite de tu plan. Cambia de plan para agregar más.";
  return null;
}
