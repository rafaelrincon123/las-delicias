import type { PlanFinca } from "./types";

// Espejo local de plan_limits en Supabase. Si cambia allá, cambiar aquí.
export const PLAN_LIMITS: Record<
  PlanFinca,
  { maxAnimales: number | null; maxUsuarios: number | null; nombre: string; precioCOP: number }
> = {
  ranchero: { maxAnimales: 15,   maxUsuarios: 1,    nombre: "Ranchero", precioCOP: 0       },
  ganadero: { maxAnimales: 200,  maxUsuarios: 5,    nombre: "Ganadero", precioCOP: 59000   },
  hacienda: { maxAnimales: null, maxUsuarios: null, nombre: "Hacienda", precioCOP: 149000  },
};

export function planLabel(plan: PlanFinca): string {
  return PLAN_LIMITS[plan]?.nombre ?? plan;
}

export function nextPlan(plan: PlanFinca): PlanFinca | null {
  if (plan === "ranchero") return "ganadero";
  if (plan === "ganadero") return "hacienda";
  return null;
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
 *   "Alcanzaste el límite de 15 animales del plan ranchero..."
 * Ese mensaje ya es amigable — solo lo reenviamos si detectamos el patrón.
 */
export function traducirErrorLimite(msg: string): string | null {
  if (/Alcanzaste el l[ií]mite/i.test(msg)) return msg;
  if (/plan_limit|P0001/i.test(msg)) return "Alcanzaste el límite de tu plan. Cambia de plan para agregar más.";
  return null;
}
