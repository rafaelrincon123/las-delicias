"use client";

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
    emit();
  })();
  return _initPromise;
}

/** Re-carga todo desde Supabase (útil tras cambios manuales en la base). */
export async function refreshDB(): Promise<void> {
  _initPromise = null;
  _cache = null;
  await initDB();
}

export function clearDB(): void {
  _cache = null;
  _initPromise = null;
  emit();
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

  const oldById = new Map<string, Record<string, unknown>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const it of oldList as any[]) oldById.set(it.id, it);
  const newById = new Map<string, Record<string, unknown>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const it of newList as any[]) newById.set(it.id, it);

  const upserts: Record<string, unknown>[] = [];
  for (const [id, item] of newById.entries()) {
    const prev = oldById.get(id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(item)) {
      upserts.push(toRow(item, def.map));
    }
  }

  const deletes: string[] = [];
  for (const id of oldById.keys()) {
    if (!newById.has(id)) deletes.push(id);
  }

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
