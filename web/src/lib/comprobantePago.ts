"use client";

import { getSupabase } from "./supabase";
import type { PlanFinca } from "./types";
import { type Periodo, precioPeriodo } from "./plans";
import { trackPixel } from "./pixel";

/**
 * Datos de la cuenta a la que los clientes transfieren mientras no existe
 * un procesador de pagos real (Wompi/PayU). Se leen de variables de
 * entorno NEXT_PUBLIC_* — NUNCA hardcodeadas aquí — porque este repo es
 * público en GitHub: un número de cuenta o Nequi en el código fuente
 * queda visible para cualquiera, para siempre, aunque se borre después
 * (sigue en el historial de git).
 *
 * Configurar en:
 *  - web/.env.local (desarrollo local, ya está en .gitignore)
 *  - Vercel → Project Settings → Environment Variables (producción)
 *
 * Variables: NEXT_PUBLIC_CUENTA_BANCO, NEXT_PUBLIC_CUENTA_TIPO,
 * NEXT_PUBLIC_CUENTA_NUMERO, NEXT_PUBLIC_CUENTA_TITULAR,
 * NEXT_PUBLIC_CUENTA_NEQUI.
 */
export const CUENTA_PAGO = {
  banco: process.env.NEXT_PUBLIC_CUENTA_BANCO ?? "Configura NEXT_PUBLIC_CUENTA_BANCO",
  tipoCuenta: process.env.NEXT_PUBLIC_CUENTA_TIPO ?? "Configura NEXT_PUBLIC_CUENTA_TIPO",
  numeroCuenta: process.env.NEXT_PUBLIC_CUENTA_NUMERO ?? "Configura NEXT_PUBLIC_CUENTA_NUMERO",
  titular: process.env.NEXT_PUBLIC_CUENTA_TITULAR ?? "Configura NEXT_PUBLIC_CUENTA_TITULAR",
  nequi: process.env.NEXT_PUBLIC_CUENTA_NEQUI ?? "Configura NEXT_PUBLIC_CUENTA_NEQUI",
};

/**
 * Registra la solicitud de cambio de plan en `comprobantes_pago` y, si el
 * cliente adjuntó comprobante, lo sube al bucket privado `comprobantes-pago`
 * (RLS: solo miembros de esa finca suben/leen sus archivos). Un trigger de
 * la base de datos le manda un correo al admin con el link al comprobante.
 */
export async function registrarSolicitudPlan(opts: {
  fincaId: string;
  planSolicitado: Extract<PlanFinca, "ganadero" | "hacienda">;
  periodo: Periodo;
  file?: File | null;
}): Promise<void> {
  const sb = getSupabase();

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) throw new Error("No se pudo identificar tu sesión");

  let path: string | null = null;
  if (opts.file) {
    const ext = opts.file.name.split(".").pop()?.toLowerCase() || "bin";
    const nombreSeguro = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    path = `${opts.fincaId}/${nombreSeguro}`;
    const { error: uploadErr } = await sb.storage
      .from("comprobantes-pago")
      .upload(path, opts.file, { upsert: false, contentType: opts.file.type || undefined });
    if (uploadErr) throw new Error(`No se pudo subir el archivo: ${uploadErr.message}`);
  }

  const { error: insertErr } = await sb.from("comprobantes_pago").insert({
    finca_id: opts.fincaId,
    subido_por: userData.user.id,
    plan_solicitado: opts.planSolicitado,
    periodo: opts.periodo,
    storage_path: path,
  });
  if (insertErr) throw new Error(`No se pudo registrar la solicitud: ${insertErr.message}`);
  trackPixel("InitiateCheckout", {
    value: precioPeriodo(opts.planSolicitado, opts.periodo),
    currency: "COP",
    content_name: `${opts.planSolicitado} ${opts.periodo}`,
  });
}
