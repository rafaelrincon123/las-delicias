// Edge Function: cambiar-clave-empleado
//
// El owner o admin de una finca le pone una contraseña nueva a un empleado
// que la olvidó (el modelo de RumeApp es que el owner crea las cuentas de
// sus empleados, así que también es quien se las recupera). Corre con la
// service_role key — nunca se expone al navegador.
//
// Body esperado (JSON):
//   { finca_id: string, user_id: string, password: string }
//
// Reglas de seguridad (para que esto no sirva para robar cuentas ajenas):
//   - El caller debe ser owner o admin activo de la finca.
//   - El empleado debe ser miembro de ESTA finca, y de ninguna otra: si
//     también pertenece a otra finca (o es dueño de una), su contraseña no
//     es solo asunto de esta finca y debe recuperarla él mismo por correo.
//   - Nunca al owner, ni a uno mismo (para eso está "Olvidé mi contraseña").
//   - Un admin solo puede cambiarla a operarios y solo-lectura; la de otro
//     admin solo la cambia el owner.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Método no permitido" }, 405);
  }

  let body: { finca_id?: string; user_id?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body inválido" }, 400);
  }

  const { finca_id, user_id, password } = body;
  if (!finca_id || !user_id || !password) {
    return json({ error: "Faltan campos: finca_id, user_id y password son obligatorios" }, 400);
  }
  if (password.length < 8) {
    return json({ error: "La contraseña debe tener al menos 8 caracteres" }, 400);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Falta el token de autenticación" }, 401);
  }
  const callerJwt = authHeader.replace(/^Bearer\s+/i, "");

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Identificar al caller.
  const { data: callerData, error: callerErr } = await admin.auth.getUser(callerJwt);
  if (callerErr || !callerData.user) {
    return json({ error: "Token inválido o expirado" }, 401);
  }
  const callerId = callerData.user.id;

  if (callerId === user_id) {
    return json({ error: "Para cambiar tu propia contraseña usa \"Olvidé mi contraseña\"" }, 400);
  }

  // 2. Verificar que el caller sea owner o admin activo de esa finca.
  const { data: fincaRow, error: fincaErr } = await admin
    .from("fincas")
    .select("id, owner_user_id")
    .eq("id", finca_id)
    .maybeSingle();
  if (fincaErr || !fincaRow) {
    return json({ error: "Finca no encontrada" }, 404);
  }

  const callerEsOwner = fincaRow.owner_user_id === callerId;
  if (!callerEsOwner) {
    const { data: miembroRow } = await admin
      .from("finca_miembros")
      .select("rol, activo")
      .eq("finca_id", finca_id)
      .eq("user_id", callerId)
      .maybeSingle();
    if (!(miembroRow?.activo && miembroRow.rol === "admin")) {
      return json({ error: "Solo el owner o un admin de la finca pueden cambiar contraseñas" }, 403);
    }
  }

  // 3. El empleado debe pertenecer solo a esta finca y no ser dueño de ninguna.
  const { data: membresias, error: membErr } = await admin
    .from("finca_miembros")
    .select("finca_id, rol")
    .eq("user_id", user_id);
  if (membErr) {
    return json({ error: membErr.message }, 400);
  }
  const aqui = membresias?.find((m) => m.finca_id === finca_id);
  if (!aqui) {
    return json({ error: "Esa persona no es miembro de esta finca" }, 404);
  }
  if (aqui.rol === "owner" || fincaRow.owner_user_id === user_id) {
    return json({ error: "No se puede cambiar la contraseña del dueño de la finca" }, 403);
  }
  if (aqui.rol === "admin" && !callerEsOwner) {
    return json({ error: "Solo el dueño puede cambiar la contraseña de un administrador" }, 403);
  }

  const { count: fincasPropias } = await admin
    .from("fincas")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", user_id);
  if ((membresias?.length ?? 0) > 1 || (fincasPropias ?? 0) > 0) {
    return json({
      error:
        "Esta persona también usa RumeApp en otra finca, así que no puedes cambiar su contraseña. " +
        "Pídele que use \"Olvidé mi contraseña\" en la pantalla de ingreso.",
    }, 403);
  }

  // 4. Cambiar la contraseña.
  const { error: updErr } = await admin.auth.admin.updateUserById(user_id, { password });
  if (updErr) {
    return json({ error: updErr.message }, 400);
  }

  return json({ ok: true });
});
