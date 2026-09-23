// Edge Function: correo-entrante
//
// Webhook de Resend (evento `email.received`) para los correos que llegan a
// cualquier dirección @rumea.app (soporte@, hola@, ...). Los reenvía al
// Gmail del admin con Reply-To = quien escribió, así al darle "Responder"
// en Gmail la respuesta le llega directo al cliente.
//
// Se despliega con --no-verify-jwt: quien llama es Resend; la autenticidad
// se comprueba con la firma del webhook (formato Svix / Standard Webhooks).
//
// Secrets: RESEND_API_KEY (con acceso completo: leer correos recibidos),
// RESEND_WEBHOOK_SECRET (whsec_... del webhook en Resend), ADMIN_EMAIL.

import { Webhook } from "npm:standardwebhooks@1.1.1";
import PostalMime from "npm:postal-mime@2.7.6";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const WEBHOOK_SECRET = Deno.env.get("RESEND_WEBHOOK_SECRET") ?? "";
const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "rafael.rincong@gmail.com";

interface Recibido {
  id: string;
  from: string;
  to: string[];
  subject: string | null;
  html: string | null;
  text: string | null;
  raw?: { download_url?: string } | null;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function resend(path: string, init?: RequestInit) {
  return await fetch(`https://api.resend.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Método no permitido", { status: 405 });
  if (!RESEND_API_KEY || !WEBHOOK_SECRET) return new Response("Faltan secrets", { status: 500 });

  const payload = await req.text();
  let evento: { type: string; data: { email_id?: string } };
  try {
    // Standard Webhooks espera el secreto sin el prefijo "whsec_".
    const wh = new Webhook(WEBHOOK_SECRET.replace(/^whsec_/, ""));
    evento = wh.verify(payload, {
      "webhook-id": req.headers.get("svix-id") ?? req.headers.get("webhook-id") ?? "",
      "webhook-timestamp": req.headers.get("svix-timestamp") ?? req.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": req.headers.get("svix-signature") ?? req.headers.get("webhook-signature") ?? "",
    }) as typeof evento;
  } catch {
    return new Response("Firma inválida", { status: 401 });
  }

  if (evento.type !== "email.received" || !evento.data.email_id) {
    return new Response("Ignorado", { status: 200 });
  }

  const r = await resend(`/emails/receiving/${evento.data.email_id}`);
  if (!r.ok) {
    console.error("No se pudo leer el correo recibido", r.status, await r.text());
    return new Response("No se pudo leer el correo", { status: 502 });
  }
  const correo = (await r.json()) as Recibido;

  // Adjuntos: vienen dentro del mensaje original (raw).
  let adjuntos: { filename: string; content: string; content_type?: string }[] = [];
  if (correo.raw?.download_url) {
    try {
      const raw = await (await fetch(correo.raw.download_url)).text();
      const parsed = await PostalMime.parse(raw, { attachmentEncoding: "base64" });
      adjuntos = parsed.attachments
        .filter((a) => a.filename)
        .map((a) => ({
          filename: a.filename!,
          content: String(a.content),
          content_type: a.mimeType,
        }));
    } catch (e) {
      console.error("No se pudieron leer los adjuntos", e);
    }
  }

  const para = correo.to?.join(", ") ?? "";
  const cabecera =
    `<div style="font-family:Arial,sans-serif;font-size:12px;color:#52584E;border-left:3px solid #B8CE7A;padding:6px 10px;margin-bottom:16px">` +
    `Recibido en <strong>${esc(para)}</strong> de <strong>${esc(correo.from)}</strong>. ` +
    `Dale "Responder" para contestarle directo.</div>`;

  const envio = await resend("/emails", {
    method: "POST",
    body: JSON.stringify({
      from: "RumeApp Soporte <soporte@rumea.app>",
      to: [ADMIN_EMAIL],
      reply_to: correo.from,
      subject: `[Soporte] ${correo.subject ?? "(sin asunto)"}`,
      html: cabecera + (correo.html ?? `<pre style="white-space:pre-wrap">${esc(correo.text ?? "")}</pre>`),
      text: `Recibido en ${para} de ${correo.from}\n\n${correo.text ?? ""}`,
      attachments: adjuntos.length ? adjuntos : undefined,
    }),
  });
  if (!envio.ok) {
    const detalle = await envio.text();
    console.error("No se pudo reenviar", envio.status, detalle);
    return new Response(`Resend: ${detalle}`, { status: 502 });
  }
  return new Response("ok", { status: 200 });
});
