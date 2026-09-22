"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import { AUTH_EVENT_NAME } from "./auth";
import { setActiveFincaId } from "./db";
import type { Finca, PlanFinca } from "./types";

const STORAGE_KEY = "rumeapp:activaId";
const CHANGED_EVENT = "finca:changed";

interface RowFinca {
  id: string;
  nombre: string;
  owner_user_id: string;
  plan: PlanFinca;
  timezone: string;
  created_at: string;
}

function fromRow(row: RowFinca): Finca {
  return {
    id: row.id,
    nombre: row.nombre,
    ownerUserId: row.owner_user_id,
    plan: row.plan,
    timezone: row.timezone,
    createdAt: row.created_at,
  };
}

interface State {
  ready: boolean;
  fincas: Finca[];
  activa: Finca | null;
}

async function fetchFincas(): Promise<Finca[]> {
  const sb = getSupabase();
  // Esperar a que la sesión esté cargada desde storage antes de pedir fincas.
  // Sin sesión, RLS devuelve [] y el AuthGate creería que el usuario no
  // tiene finca (mandándolo al onboarding wizard). Sin sesión: cortar aquí.
  const { data: sessionData } = await sb.auth.getSession();
  if (!sessionData.session) return [];
  const { data, error } = await sb
    .from("fincas")
    .select("id, nombre, owner_user_id, plan, timezone, created_at")
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[useFincaActiva] fetch fincas", error);
    return [];
  }
  return (data ?? []).map((r) => fromRow(r as RowFinca));
}

function readStoredId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function useFincaActiva(): State & {
  setActiva: (id: string) => void;
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<State>({
    ready: false,
    fincas: [],
    activa: null,
  });

  async function refresh() {
    const fincas = await fetchFincas();
    const storedId = readStoredId();
    const activa =
      fincas.find((f) => f.id === storedId) ?? fincas[0] ?? null;
    if (activa && activa.id !== storedId) writeStoredId(activa.id);
    if (!activa) writeStoredId(null);
    setActiveFincaId(activa?.id ?? null);
    setState({ ready: true, fincas, activa });
  }

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const fincas = await fetchFincas();
      if (!mounted) return;
      const storedId = readStoredId();
      const activa =
        fincas.find((f) => f.id === storedId) ?? fincas[0] ?? null;
      if (activa && activa.id !== storedId) writeStoredId(activa.id);
      if (!activa) writeStoredId(null);
      setActiveFincaId(activa?.id ?? null);
      setState({ ready: true, fincas, activa });
    })();

    const onAuth = () => void refresh();
    const onChanged = () => void refresh();
    window.addEventListener(AUTH_EVENT_NAME, onAuth);
    window.addEventListener(CHANGED_EVENT, onChanged);
    // Suscripción directa a Supabase: si la sesión aparece (INITIAL_SESSION
    // al hidratar desde storage, SIGNED_IN, TOKEN_REFRESHED), refrescamos.
    const sb = getSupabase();
    const { data: sub } = sb.auth.onAuthStateChange((event, session) => {
      if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "SIGNED_OUT"
      ) {
        if (event === "SIGNED_OUT" || !session) {
          setState({ ready: true, fincas: [], activa: null });
          return;
        }
        void refresh();
      }
    });
    return () => {
      mounted = false;
      window.removeEventListener(AUTH_EVENT_NAME, onAuth);
      window.removeEventListener(CHANGED_EVENT, onChanged);
      sub.subscription.unsubscribe();
    };
  }, []);

  function setActiva(id: string) {
    writeStoredId(id);
    setActiveFincaId(id);
    setState((s) => {
      const activa = s.fincas.find((f) => f.id === id) ?? s.activa;
      return { ...s, activa };
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
    }
  }

  return { ...state, setActiva, refresh };
}

/** Llamable desde código no-hook (por ejemplo `crearFinca`) para forzar refresh. */
export function emitFincaChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGED_EVENT));
  }
}

/**
 * RPC del servidor: crea una finca + su propietario inicial atómicamente.
 * Devuelve la finca creada.
 */
export async function crearFinca(opts: {
  nombre: string;
  timezone?: string;
  nombrePropietario?: string;
  tamanoAprox?: number | null;
  telefono?: string | null;
  departamento?: string | null;
  ciudad?: string | null;
  referidoVia?: string | null;
}): Promise<Finca> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("crear_finca", {
    p_nombre: opts.nombre,
    p_timezone: opts.timezone ?? "America/Bogota",
    p_nombre_propietario: opts.nombrePropietario ?? null,
    p_tamano_aprox: opts.tamanoAprox ?? null,
    p_telefono: opts.telefono ?? null,
    p_departamento: opts.departamento ?? null,
    p_ciudad: opts.ciudad ?? null,
    p_referido_via: opts.referidoVia ?? null,
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("La finca no fue creada");
  const row = Array.isArray(data) ? data[0] : data;
  const finca = fromRow(row as RowFinca);
  writeStoredId(finca.id);
  emitFincaChanged();
  return finca;
}
