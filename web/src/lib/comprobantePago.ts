"use client";

import { getSupabase } from "./supabase";
import type { PlanFinca } from "./types";

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

export interface ComprobanteSubido {
  signedUrl: string;
  path: string;
}

/**
 * Sube el comprobante al bucket privado `comprobantes-pago` (RLS: solo
 * miembros de esa finca pueden subir/leer sus propios archivos), registra
 * la solicitud en `comprobantes_pago` para trazabilidad, y devuelve un
 * link firmado (30 días) para incluir en el correo a Rafael.
 */
export async function subirComprobantePago(opts: {
  fincaId: string;
  planSolicitado: Extract<PlanFinca, "ganadero" | "hacienda">;
  file: File;
}): Promise<ComprobanteSubido> {
  const sb = getSupabase();

  const ext = opts.file.name.split(".").pop()?.toLowerCase() || "bin";
  const nombreSeguro = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${opts.fincaId}/${nombreSeguro}`;

  const { error: uploadErr } = await sb.storage
    .from("comprobantes-pago")
    .upload(path, opts.file, { upsert: false, contentType: opts.file.type || undefined });
  if (uploadErr) throw new Error(`No se pudo subir el archivo: ${uploadErr.message}`);

  const { data: userData, error: userErr } = await sb.auth.getUser();
  if (userErr || !userData.user) throw new Error("No se pudo identificar tu sesión");

  const { error: insertErr } = await sb.from("comprobantes_pago").insert({
    finca_id: opts.fincaId,
    subido_por: userData.user.id,
    plan_solicitado: opts.planSolicitado,
    storage_path: path,
  });
  if (insertErr) throw new Error(`No se pudo registrar la solicitud: ${insertErr.message}`);

  const { data: signedData, error: signErr } = await sb.storage
    .from("comprobantes-pago")
    .createSignedUrl(path, 60 * 60 * 24 * 30);
  if (signErr || !signedData) {
    throw new Error(signErr?.message ?? "No se pudo generar el link del comprobante");
  }

  return { signedUrl: signedData.signedUrl, path };
}
