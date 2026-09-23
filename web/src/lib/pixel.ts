"use client";

// Píxel de Meta (Facebook / Instagram). Queda apagado mientras no exista
// NEXT_PUBLIC_META_PIXEL_ID (Vercel → Environment Variables). El ID del
// píxel no es secreto: Meta lo muestra en el código de cualquier web.
//
// Eventos que usa RumeApp (los estándar de Meta, para optimizar anuncios):
//   PageView             cada cambio de página
//   Lead                 abre el registro
//   CompleteRegistration crea su cuenta
//   StartTrial           crea su finca probando un plan pago
//   InitiateCheckout     envía una solicitud de pago
// Nunca se mandan datos personales (correo, teléfono, nombre).

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

type Fbq = (cmd: "track" | "trackCustom", evento: string, params?: Record<string, unknown>) => void;

export function trackPixel(evento: string, params?: Record<string, unknown>): void {
  if (!PIXEL_ID || typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === "function") fbq("track", evento, params);
}
