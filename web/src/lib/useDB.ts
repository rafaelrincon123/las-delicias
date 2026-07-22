"use client";

import { useEffect, useState } from "react";
import { DBState } from "./types";
import { getCachedDB, initDB } from "./db";

export function useDB(): { db: DBState | null; ready: boolean } {
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

  return { db, ready: db !== null };
}
