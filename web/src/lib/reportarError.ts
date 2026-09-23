"use client";

import { getSupabase } from "./supabase";

// Guarda en `errores_app` los errores que le pasan al usuario en el
// navegador. Un trigger le manda un correo al admin (máx. 1 por mensaje
// cada 6 h). Aquí se evita repetir: cada mensaje se reporta una sola vez
// por pestaña y como mucho 5 en total.

const reportados = new Set<string>();

// Ruido que no es un error de RumeApp (extensiones, red caída, etc.).
const IGNORAR = [
  /ResizeObserver loop/i,
  /Script error\.?$/i,
  /Failed to fetch/i,
  /NetworkError/i,
  /Load failed/i,
  /ChunkLoadError|Loading chunk .* failed/i,
  /chrome-extension:|moz-extension:/i,
];

export function reportarError(error: unknown, extra?: { stack?: string }): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  const e = error instanceof Error ? error : null;
  const mensaje = (e?.message || String(error ?? "Error desconocido")).slice(0, 1000);
  const stack = (extra?.stack ?? e?.stack ?? "").slice(0, 8000) || null;
  if (!mensaje || IGNORAR.some((r) => r.test(mensaje) || (stack && r.test(stack)))) return;
  if (reportados.has(mensaje) || reportados.size >= 5) return;
  reportados.add(mensaje);

  void getSupabase()
    .from("errores_app")
    .insert({
      mensaje,
      stack,
      url: window.location.href.slice(0, 1000),
      user_agent: navigator.userAgent.slice(0, 500),
    })
    .then(({ error: err }) => {
      if (err) console.warn("[reportarError] no se pudo registrar", err.message);
    });
}

let instalado = false;

/** Escucha errores no capturados de toda la app. Llamar una vez. */
export function instalarReporteDeErrores(): void {
  if (instalado || typeof window === "undefined") return;
  instalado = true;
  window.addEventListener("error", (ev) => reportarError(ev.error ?? ev.message));
  window.addEventListener("unhandledrejection", (ev) => reportarError(ev.reason));
}
