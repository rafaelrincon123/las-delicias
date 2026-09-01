"use client";

import { useEffect, useState } from "react";
import { DBState } from "./types";
import { getCachedDB, initDB, isTableLoaded } from "./db";

interface UseDBReturn {
  db: DBState | null;
  ready: boolean;
  /** true si el fetch inicial de esa tabla ya llegó. Útil para distinguir
   *  "lista vacía real" de "aún cargando" durante el streaming inicial. */
  loaded: (key: keyof DBState) => boolean;
}

export function useDB(): UseDBReturn {
  const [db, setDb] = useState<DBState | null>(() => getCachedDB());

  useEffect(() => {
    let mounted = true;
    if (!getCachedDB()) {
      void initDB().catch((e) => console.error("[useDB] initDB error", e));
    }
    const onChange = () => {
      if (mounted) setDb(getCachedDB());
    };
    window.addEventListener("db:changed", onChange);
    return () => {
      mounted = false;
      window.removeEventListener("db:changed", onChange);
    };
  }, []);

  return { db, ready: db !== null, loaded: isTableLoaded };
}
