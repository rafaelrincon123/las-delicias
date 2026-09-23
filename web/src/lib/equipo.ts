"use client";

import { getSupabase } from "./supabase";

export type RolMiembro = "owner" | "admin" | "operario" | "viewer";
export const ROLES_ASIGNABLES: RolMiembro[] = ["admin", "operario", "viewer"];

export const ROL_LABEL: Record<RolMiembro, string> = {
  owner: "Dueño",
  admin: "Administrador",
  operario: "Operario",
  viewer: "Solo lectura",
};

export const ROL_DESC: Record<RolMiembro, string> = {
  owner: "Control total, incluida la finca y el plan.",
  admin: "Todo excepto borrar la finca.",
  operario: "Registra y edita, pero no puede borrar.",
  viewer: "Solo puede ver, no editar.",
};

export interface Miembro {
  userId: string;
  rol: RolMiembro;
  activo: boolean;
  invitadoPor: string | null;
  createdAt: string;
  nombre: string | null;
  email: string;
  telefono: string | null;
}

interface RowMiembro {
  user_id: string;
  rol: RolMiembro;
  activo: boolean;
  invitado_por: string | null;
  created_at: string;
  nombre: string | null;
  email: string;
  telefono: string | null;
}

export async function listarMiembros(fincaId: string): Promise<Miembro[]> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("listar_miembros_finca", { p_finca_id: fincaId });
  if (error) throw new Error(error.message);
  return ((data ?? []) as RowMiembro[]).map((r) => ({
    userId: r.user_id,
    rol: r.rol,
    activo: r.activo,
    invitadoPor: r.invitado_por,
    createdAt: r.created_at,
    nombre: r.nombre,
    email: r.email,
    telefono: r.telefono,
  }));
}

// Cuando la Edge Function responde 4xx, supabase-js solo dice "non-2xx status
// code"; el mensaje en español viene en el body de la Response (error.context).
async function mensajeDeError(error: { message: string; context?: unknown }): Promise<string> {
  const ctx = error.context;
  if (ctx instanceof Response) {
    try {
      const b = await ctx.json();
      if (b?.error) return b.error as string;
    } catch {
      /* respuesta sin JSON */
    }
  }
  return error.message;
}

export async function crearEmpleado(opts: {
  fincaId: string;
  email: string;
  password: string;
  rol: RolMiembro;
  nombre?: string;
  telefono?: string;
}): Promise<{ userId: string; email: string }> {
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke("crear-empleado", {
    body: {
      finca_id: opts.fincaId,
      email: opts.email,
      password: opts.password,
      rol: opts.rol,
      nombre: opts.nombre,
      telefono: opts.telefono,
    },
  });
  if (error) throw new Error(await mensajeDeError(error));
  if (data?.error) throw new Error(data.error as string);
  return { userId: data.userId as string, email: data.email as string };
}

export async function cambiarClaveEmpleado(opts: {
  fincaId: string;
  userId: string;
  password: string;
}): Promise<void> {
  const sb = getSupabase();
  const { data, error } = await sb.functions.invoke("cambiar-clave-empleado", {
    body: { finca_id: opts.fincaId, user_id: opts.userId, password: opts.password },
  });
  if (error) throw new Error(await mensajeDeError(error));
  if (data?.error) throw new Error(data.error as string);
}

export async function cambiarRolMiembro(
  fincaId: string,
  userId: string,
  nuevoRol: RolMiembro
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("finca_miembros")
    .update({ rol: nuevoRol })
    .eq("finca_id", fincaId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export async function setMiembroActivo(
  fincaId: string,
  userId: string,
  activo: boolean
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("finca_miembros")
    .update({ activo })
    .eq("finca_id", fincaId)
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
}

export function generarPasswordTemporal(): string {
  const alfabeto = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = crypto.getRandomValues(new Uint32Array(10));
  let out = "";
  for (const b of bytes) out += alfabeto[b % alfabeto.length];
  return out;
}
