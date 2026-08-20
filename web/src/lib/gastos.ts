import { Animal, Gasto } from "./types";
import { updateCollection } from "./storage";

/**
 * Deriva la lista efectiva de propietarios que participan del gasto.
 * - Modo "socios": los propietarios seleccionados manualmente.
 * - Modo "cabezas": los propietarios de los animales seleccionados (únicos).
 */
export function participantesGasto(g: Gasto, animales: Animal[]): string[] {
  if (g.repartoPor === "cabezas" && g.animalIds && g.animalIds.length > 0) {
    const props = new Set<string>();
    for (const aid of g.animalIds) {
      const a = animales.find((x) => x.id === aid);
      if (a?.propietarioId) props.add(a.propietarioId);
    }
    return Array.from(props);
  }
  return g.participantes ?? [];
}

/**
 * Cuota que le corresponde a cada propietario en este gasto.
 * - Modo "cabezas": (cabezas_suyas / total_cabezas) * monto.
 * - Modo "socios": monto / #participantes.
 */
export function cuotasPorPropietario(
  g: Gasto,
  animales: Animal[]
): Record<string, number> {
  const cuotas: Record<string, number> = {};
  if (g.repartoPor === "cabezas" && g.animalIds && g.animalIds.length > 0) {
    const cabezas: Record<string, number> = {};
    let total = 0;
    for (const aid of g.animalIds) {
      const a = animales.find((x) => x.id === aid);
      if (!a?.propietarioId) continue;
      cabezas[a.propietarioId] = (cabezas[a.propietarioId] ?? 0) + 1;
      total += 1;
    }
    if (total > 0) {
      for (const [pid, n] of Object.entries(cabezas)) {
        cuotas[pid] = (n / total) * g.monto;
      }
    }
    return cuotas;
  }
  const parts = g.participantes ?? [];
  if (parts.length === 0) return cuotas;
  const cuota = g.monto / parts.length;
  parts.forEach((pid) => {
    cuotas[pid] = cuota;
  });
  return cuotas;
}

/**
 * Devuelve el conjunto efectivo de participantes que ya pagaron su parte.
 * Quien puso la plata (pagadoPor) cuenta como pagado si es participante.
 */
export function participantesPagados(
  g: Gasto,
  animales: Animal[]
): Set<string> {
  const paid = new Set(g.pagadoPorIds ?? []);
  const parts = participantesGasto(g, animales);
  if (g.pagadoPor && parts.includes(g.pagadoPor)) paid.add(g.pagadoPor);
  return paid;
}

/** Alterna el estado de pago de un participante en un gasto y persiste. */
export function toggleParticipantePagado(
  g: Gasto,
  animales: Animal[],
  propietarioId: string
): void {
  const parts = participantesGasto(g, animales);
  if (!parts.includes(propietarioId)) return;
  if (g.pagadoPor === propietarioId) return;
  const set = new Set(g.pagadoPorIds ?? []);
  if (set.has(propietarioId)) set.delete(propietarioId);
  else set.add(propietarioId);
  const next: Gasto = { ...g, pagadoPorIds: Array.from(set) };
  updateCollection("gastos", (list) =>
    list.map((x) => (x.id === g.id ? next : x))
  );
}
