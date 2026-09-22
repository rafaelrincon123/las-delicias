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
  if (error) {
    // supabase-js pone el mensaje del server en error.context si existe
    const ctx = (error as { context?: { error?: string } }).context;
    throw new Error(ctx?.error ?? error.message);
  }
  if (data?.error) throw new Error(data.error as string);
  return { userId: data.userId as string, email: data.email as string };
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
  let out = "";
  for (let i = 0; i < 10; i++) {
    out += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return out;
}
