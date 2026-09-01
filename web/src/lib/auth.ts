"use client";

import { Propietario } from "./types";
import { getSupabase } from "./supabase";
import { getCachedDB } from "./db";

const AUTH_EVENT = "auth:changed";
export const AUTH_EVENT_NAME = AUTH_EVENT;

function emit(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(AUTH_EVENT));
  }
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  emit();
  return { ok: true };
}

export async function logout(): Promise<void> {
  const sb = getSupabase();
  await sb.auth.signOut();
  emit();
}

/** Busca el propietario correspondiente al usuario autenticado. */
export function findPropietarioForAuthUser(
  authUserId: string,
  email: string | undefined
): Propietario | null {
  const db = getCachedDB();
  if (!db) return null;
  const byAuth = db.propietarios.find((p) => p.authUserId === authUserId);
  if (byAuth) return byAuth;
  if (email) {
    const emailLc = email.toLowerCase();
    const byEmail = db.propietarios.find(
      (p) => p.email?.toLowerCase() === emailLc
    );
    if (byEmail) return byEmail;
  }
  return null;
}
