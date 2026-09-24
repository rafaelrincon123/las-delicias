"use client";

// Píxel de Meta (Facebook / Instagram): conjunto de datos "RumeApp Web" del
// portafolio RumeApp. El ID no es secreto (Meta lo muestra en el código de
// cualquier web que lo use). NEXT_PUBLIC_META_PIXEL_ID lo reemplaza si
// existe; con la variable vacía ("") el píxel queda apagado.
//
// Eventos que usa RumeApp (los estándar de Meta, para optimizar anuncios):
//   PageView             cada cambio de página
//   Lead                 abre el registro
//   CompleteRegistration crea su cuenta
//   StartTrial           crea su finca probando un plan pago
//   InitiateCheckout     envía una solicitud de pago
// Nunca se mandan datos personales (correo, teléfono, nombre).

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "1403461817861345";

type Fbq = (cmd: "track" | "trackCustom", evento: string, params?: Record<string, unknown>) => void;

export function trackPixel(evento: string, params?: Record<string, unknown>): void {
  if (!PIXEL_ID || typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: Fbq }).fbq;
  if (typeof fbq === "function") fbq("track", evento, params);
}
