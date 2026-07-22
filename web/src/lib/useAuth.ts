"use client";

import { useEffect, useState } from "react";
import { Propietario } from "./types";
import { getSupabase } from "./supabase";
import { initDB, clearDB, getCachedDB } from "./db";
import { findPropietarioForAuthUser, AUTH_EVENT_NAME } from "./auth";

interface State {
  hasSession: boolean;
  authEmail: string | null;
  authUserId: string | null;
  user: Propietario | null;
  ready: boolean;
}

export function useAuth(): State {
  const [state, setState] = useState<State>({
    hasSession: false,
    authEmail: null,
    authUserId: null,
    user: null,
    ready: false,
  });

  useEffect(() => {
    const sb = getSupabase();
    let mounted = true;

    async function refresh() {
      const { data } = await sb.auth.getSession();
      const session = data.session;
      if (!session) {
        // Solo limpiar cache si había datos cargados (para evitar loops con db:changed)
        if (getCachedDB() !== null) clearDB();
        if (mounted) {
          setState({
            hasSession: false,
            authEmail: null,
            authUserId: null,
            user: null,
            ready: true,
          });
        }
        return;
      }
      // Con sesión: aseguramos datos cargados
      try {
        await initDB();
      } catch (e) {
        console.error("[useAuth] initDB error", e);
      }
      if (!mounted) return;
      const user = findPropietarioForAuthUser(
        session.user.id,
        session.user.email ?? undefined
      );
      setState({
        hasSession: true,
        authEmail: session.user.email ?? null,
        authUserId: session.user.id,
        user,
        ready: true,
      });
    }

    void refresh();

    const { data: sub } = sb.auth.onAuthStateChange(() => {
      void refresh();
    });

    const onLocalAuth = () => void refresh();
    // Ojo: NO nos suscribimos a "db:changed" aquí porque `refresh()` puede
    // dispararlo (via clearDB/initDB), creando un loop infinito.

    window.addEventListener(AUTH_EVENT_NAME, onLocalAuth);

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      window.removeEventListener(AUTH_EVENT_NAME, onLocalAuth);
    };
  }, []);

  return state;
}
