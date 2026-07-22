"use client";

import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { DBState } from "./types";
import { getSupabase } from "./supabase";

// ---------------------------------------------------------------------------
//  Camel ↔ snake mapping por tabla
// ---------------------------------------------------------------------------

type FieldMap = Record<string, string>; // camelCase (TS) → snake_case (DB)

interface TableDef {
  table: string;
  map: FieldMap;
}

const TABLE_DEFS: Record<keyof DBState, TableDef> = {
  propietarios: {
    table: "propietarios",
    map: {
      id: "id",
      nombre: "nombre",
      email: "email",
      participacionPct: "participacion_pct",
    },
  },
  potreros: {
    table: "potreros",
    map: {
      id: "id",
      nombre: "nombre",
      areaHectareas: "area_hectareas",
      capacidad: "capacidad",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  animales: {
    table: "animales",
    map: {
      id: "id",
      nroIdentificacion: "nro_identificacion",
      nombre: "nombre",
      sexo: "sexo",
      raza: "raza",
      fechaNacimiento: "fecha_nacimiento",
      fechaNacimientoAprox: "fecha_nacimiento_aprox",
      madreId: "madre_id",
      padreId: "padre_id",
      madreNombre: "madre_nombre",
      padreNombre: "padre_nombre",
      categoria: "categoria",
      estado: "estado",
      potreroId: "potrero_id",
      propietarioId: "propietario_id",
      fotoUrl: "foto_url",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  sanidad: {
    table: "sanidad",
    map: {
      id: "id",
      animalId: "animal_id",
      tipo: "tipo",
      producto: "producto",
      dosis: "dosis",
      fecha: "fecha",
      proximoEventoFecha: "proximo_evento_fecha",
      veterinario: "veterinario",
      costo: "costo",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  servicios: {
    table: "servicios",
    map: {
      id: "id",
      hembraId: "hembra_id",
      machoIdOReferencia: "macho_id_o_referencia",
      tipo: "tipo",
      fechaServicio: "fecha_servicio",
      fechaDiagnostico: "fecha_diagnostico",
      resultado: "resultado",
      fechaProbableParto: "fecha_probable_parto",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  partos: {
    table: "partos",
    map: {
      id: "id",
      madreId: "madre_id",
      fecha: "fecha",
      terneroId: "ternero_id",
      pesoTerneroKg: "peso_ternero_kg",
      sexoTernero: "sexo_ternero",
      complicaciones: "complicaciones",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  pesajes: {
    table: "pesajes",
    map: {
      id: "id",
      animalId: "animal_id",
      fecha: "fecha",
      pesoKg: "peso_kg",
      tipo: "tipo",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  leche: {
    table: "produccion_leche",
    map: {
      id: "id",
      animalId: "animal_id",
      fecha: "fecha",
      litrosManana: "litros_manana",
      litrosTarde: "litros_tarde",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  gastos: {
    table: "gastos",
    map: {
      id: "id",
      fecha: "fecha",
      categoria: "categoria",
      concepto: "concepto",
      monto: "monto",
      proveedor: "proveedor",
      pagadoPor: "pagado_por",
      participantes: "participantes",
      animalId: "animal_id",
      potreroId: "potrero_id",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  ingresos: {
    table: "ingresos",
    map: {
      id: "id",
      fecha: "fecha",
      tipo: "tipo",
      concepto: "concepto",
      monto: "monto",
      comprador: "comprador",
      animalId: "animal_id",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  tareas: {
    table: "tareas",
    map: {
      id: "id",
      titulo: "titulo",
      descripcion: "descripcion",
      fecha: "fecha",
      prioridad: "prioridad",
      categoria: "categoria",
      completada: "completada",
      completadaFecha: "completada_fecha",
      animalId: "animal_id",
      potreroId: "potrero_id",
      asignadoAId: "asignado_a_id",
      createdAt: "created_at",
    },
  },
  insumos: {
    table: "insumos",
    map: {
      id: "id",
      nombre: "nombre",
      categoria: "categoria",
      unidad: "unidad",
      stock: "stock",
      minimo: "minimo",
      costoUnitario: "costo_unitario",
      proveedor: "proveedor",
      notas: "notas",
      createdAt: "created_at",
    },
  },
  movimientosInsumo: {
    table: "movimientos_insumo",
    map: {
      id: "id",
      insumoId: "insumo_id",
      fecha: "fecha",
      tipo: "tipo",
      cantidad: "cantidad",
      costoTotal: "costo_total",
      motivo: "motivo",
      animalId: "animal_id",
      potreroId: "potrero_id",
      hechoPorId: "hecho_por_id",
      createdAt: "created_at",
    },
  },
};

function toRow(obj: Record<string, unknown>, map: FieldMap): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [ts, db] of Object.entries(map)) {
    const v = obj[ts];
    if (v !== undefined) out[db] = v;
  }
  return out;
}

function fromRow(row: Record<string, unknown>, map: FieldMap): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [ts, db] of Object.entries(map)) {
    const v = row[db];
    if (v !== null && v !== undefined) out[ts] = v;
  }
  return out;
}

// ---------------------------------------------------------------------------
//  Cache + suscriptores
// ---------------------------------------------------------------------------

function emptyDB(): DBState {
  return {
    animales: [],
    potreros: [],
    sanidad: [],
    servicios: [],
    partos: [],
    pesajes: [],
    leche: [],
    gastos: [],
    ingresos: [],
    propietarios: [],
    tareas: [],
    insumos: [],
    movimientosInsumo: [],
  };
}

let _cache: DBState | null = null;
let _initPromise: Promise<void> | null = null;
let _channels: RealtimeChannel[] = [];
/** IDs de operaciones locales pendientes de reflejo Realtime — evita rebotes. */
const _localOps = new Set<string>();

const EVENT = "db:changed";
function emit(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(EVENT));
  }
}

export function getCachedDB(): DBState | null {
  return _cache;
}

export function isReady(): boolean {
  return _cache !== null;
}

// ---------------------------------------------------------------------------
//  Carga inicial
// ---------------------------------------------------------------------------

export function initDB(): Promise<void> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const sb = getSupabase();
    const next = emptyDB();

    const keys = Object.keys(TABLE_DEFS) as (keyof DBState)[];
    const results = await Promise.all(
      keys.map(async (k) => {
        const def = TABLE_DEFS[k];
        const { data, error } = await sb.from(def.table).select("*");
        if (error) {
          console.error(`[db] error cargando ${def.table}`, error);
          return { key: k, rows: [] as Record<string, unknown>[] };
        }
        return { key: k, rows: (data ?? []) as Record<string, unknown>[] };
      })
    );

    for (const { key, rows } of results) {
      const def = TABLE_DEFS[key];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (next[key] as any) = rows.map((r) => fromRow(r, def.map));
    }

    _cache = next;
    subscribeRealtime();
    emit();
  })();
  return _initPromise;
}

/** Re-carga todo desde Supabase (útil tras cambios manuales en la base). */
export async function refreshDB(): Promise<void> {
  unsubscribeRealtime();
  _initPromise = null;
  _cache = null;
  await initDB();
}

export function clearDB(): void {
  unsubscribeRealtime();
  _cache = null;
  _initPromise = null;
  emit();
}

// ---------------------------------------------------------------------------
//  Realtime: postgres_changes → cache local
// ---------------------------------------------------------------------------

function subscribeRealtime(): void {
  if (_channels.length > 0) return;
  const sb = getSupabase();
  (Object.keys(TABLE_DEFS) as (keyof DBState)[]).forEach((key) => {
    const def = TABLE_DEFS[key];
    const channel = sb
      .channel(`db:${def.table}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        "postgres_changes" as any,
        { event: "*", schema: "public", table: def.table },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          applyRealtimeEvent(key, payload);
        }
      )
      .subscribe();
    _channels.push(channel);
  });
}

function unsubscribeRealtime(): void {
  if (_channels.length === 0) return;
  const sb = getSupabase();
  for (const ch of _channels) {
    void sb.removeChannel(ch);
  }
  _channels = [];
}

function applyRealtimeEvent<K extends keyof DBState>(
  key: K,
  payload: RealtimePostgresChangesPayload<Record<string, unknown>>
): void {
  if (!_cache) return;
  const def = TABLE_DEFS[key];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const list = _cache[key] as any[];

  if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
    const item = fromRow(payload.new as Record<string, unknown>, def.map);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = (item as any).id as string | undefined;
    if (!id) return;
    const opKey = `${def.table}:upsert:${id}`;
    if (_localOps.delete(opKey)) return; // ya aplicado localmente
    const idx = list.findIndex((x) => x.id === id);
    if (idx >= 0) list[idx] = item;
    else list.push(item);
    emit();
  } else if (payload.eventType === "DELETE") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const id = (payload.old as any)?.id as string | undefined;
    if (!id) return;
    const opKey = `${def.table}:delete:${id}`;
    if (_localOps.delete(opKey)) return;
    const idx = list.findIndex((x) => x.id === id);
    if (idx >= 0) {
      list.splice(idx, 1);
      emit();
    }
  }
}

// ---------------------------------------------------------------------------
//  updateCollection: mantiene la API sync usada por los componentes.
//  Actualiza el cache local optimistamente y sincroniza a Supabase en
//  segundo plano (upserts + deletes basados en diff por id).
// ---------------------------------------------------------------------------

export function updateCollection<K extends keyof DBState>(
  key: K,
  updater: (list: DBState[K]) => DBState[K]
): DBState {
  if (!_cache) {
    console.warn("[db] updateCollection llamado sin cache — ignorado");
    return emptyDB();
  }
  const oldList = _cache[key] as DBState[K];
  const newList = updater(oldList);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (_cache[key] as any) = newList;
  emit();
  void syncCollection(key, oldList, newList);
  return _cache;
}

async function syncCollection<K extends keyof DBState>(
  key: K,
  oldList: DBState[K],
  newList: DBState[K]
): Promise<void> {
  const def = TABLE_DEFS[key];
  const sb = getSupabase();

  const oldById: Record<string, Record<string, unknown>> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (oldList as any[]).forEach((it) => { oldById[it.id] = it; });
  const newById: Record<string, Record<string, unknown>> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (newList as any[]).forEach((it) => { newById[it.id] = it; });

  const upserts: Record<string, unknown>[] = [];
  const upsertIds: string[] = [];
  Object.keys(newById).forEach((id) => {
    const item = newById[id];
    const prev = oldById[id];
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      upserts.push(toRow(item, def.map));
      upsertIds.push(id);
    }
  });

  const deletes: string[] = Object.keys(oldById).filter((id) => !(id in newById));

  // Marcar como locales para que Realtime no los re-aplique
  upsertIds.forEach((id) => _localOps.add(`${def.table}:upsert:${id}`));
  deletes.forEach((id) => _localOps.add(`${def.table}:delete:${id}`));

  try {
    if (upserts.length > 0) {
      const { error } = await sb.from(def.table).upsert(upserts, { onConflict: "id" });
      if (error) console.error(`[db] upsert ${def.table}`, error);
    }
    if (deletes.length > 0) {
      const { error } = await sb.from(def.table).delete().in("id", deletes);
      if (error) console.error(`[db] delete ${def.table}`, error);
    }
  } catch (e) {
    console.error(`[db] sync ${def.table} falló`, e);
  }
}

// ---------------------------------------------------------------------------
//  Utilidades legacy
// ---------------------------------------------------------------------------

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function nowISO(): string {
  return new Date().toISOString();
}
