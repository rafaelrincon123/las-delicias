import { Animal, Propietario } from "./types";

export interface OwnerShare {
  socioId: string | null;
  nombre: string;
  count: number;
  pct: number;
}

function summarize(
  animales: Animal[],
  propietarios: Propietario[]
): OwnerShare[] {
  const total = animales.length;
  const groups = new Map<string | null, number>();
  for (const a of animales) {
    const key = a.propietarioId ?? null;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  return [...groups.entries()]
    .map(([id, count]) => ({
      socioId: id,
      nombre: id
        ? propietarios.find((p) => p.id === id)?.nombre ?? "Desconocido"
        : "Sin asignar",
      count,
      pct: total > 0 ? (count / total) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/** Overall participation across all active animals in the herd. */
export function participacionGlobal(
  animales: Animal[],
  propietarios: Propietario[]
): OwnerShare[] {
  return summarize(
    animales.filter((a) => a.estado === "activo"),
    propietarios
  );
}

/** Participation among the active animals in a specific potrero. */
export function participacionPorPotrero(
  potreroId: string,
  animales: Animal[],
  propietarios: Propietario[]
): OwnerShare[] {
  return summarize(
    animales.filter((a) => a.estado === "activo" && a.potreroId === potreroId),
    propietarios
  );
}

/** Convenience: my share (%) of the whole herd, based on cattle count. */
export function miParticipacion(
  socioId: string,
  animales: Animal[]
): { count: number; pct: number } {
  const activos = animales.filter((a) => a.estado === "activo");
  const mine = activos.filter((a) => a.propietarioId === socioId).length;
  const pct = activos.length > 0 ? (mine / activos.length) * 100 : 0;
  return { count: mine, pct };
}
