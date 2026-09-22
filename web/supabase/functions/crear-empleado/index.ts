// Edge Function: crear-empleado
//
// El owner o admin de una finca crea una cuenta para un empleado (operario,
// admin o viewer) sin pasar por el signup público y sin perder su propia
// sesión. Corre en el servidor de Supabase con la service_role key —
// nunca se expone al navegador.
//
// Body esperado (JSON):
//   { finca_id: string, email: string, password: string, rol: "admin"|"operario"|"viewer",
//     nombre?: string, telefono?: string }
//
// El caller se identifica por el JWT que supabase.functions.invoke() manda
// automáticamente en el header Authorization.

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

const ROLES_PERMITIDOS = ["admin", "operario", "viewer"] as const;
type RolPermitido = (typeof ROLES_PERMITIDOS)[number];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Método no permitido" }, 405);
  }

  let body: {
    finca_id?: string;
    email?: string;
    password?: string;
    rol?: string;
    nombre?: string;
    telefono?: string;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Body inválido" }, 400);
  }

  const { finca_id, email, password, rol, nombre, telefono } = body;

  if (!finca_id || !email || !password || !rol) {
    return json({ error: "Faltan campos: finca_id, email, password, rol son obligatorios" }, 400);
  }
  if (!ROLES_PERMITIDOS.includes(rol as RolPermitido)) {
    return json({ error: `Rol inválido. Debe ser uno de: ${ROLES_PERMITIDOS.join(", ")}` }, 400);
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

  // 1. Identificar al caller a partir de su JWT.
  const { data: callerData, error: callerErr } = await admin.auth.getUser(callerJwt);
  if (callerErr || !callerData.user) {
    return json({ error: "Token inválido o expirado" }, 401);
  }
  const callerId = callerData.user.id;

  // 2. Verificar que el caller sea owner o admin de esa finca.
  const { data: fincaRow, error: fincaErr } = await admin
    .from("fincas")
    .select("id, owner_user_id, plan")
    .eq("id", finca_id)
    .maybeSingle();
  if (fincaErr || !fincaRow) {
    return json({ error: "Finca no encontrada" }, 404);
  }

  let callerEsAdmin = fincaRow.owner_user_id === callerId;
  if (!callerEsAdmin) {
    const { data: miembroRow } = await admin
      .from("finca_miembros")
      .select("rol, activo")
      .eq("finca_id", finca_id)
      .eq("user_id", callerId)
      .maybeSingle();
    callerEsAdmin = !!miembroRow?.activo && miembroRow.rol === "admin";
  }
  if (!callerEsAdmin) {
    return json({ error: "Solo el owner o un admin de la finca pueden crear empleados" }, 403);
  }

  // 3. Revisar límite del plan (misma regla que el trigger enforce_miembros_limit,
  //    chequeada acá primero para devolver un error legible antes de crear el user).
  const { data: puedeAgregar } = await admin.rpc("puede_agregar_miembro", { p_finca_id: finca_id });
  if (puedeAgregar === false) {
    return json({
      error: `Alcanzaste el límite de usuarios del plan ${fincaRow.plan}. Cambia de plan para agregar más.`,
    }, 400);
  }

  // 4. Crear el usuario, ya confirmado (sin fricción de email).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createErr || !created.user) {
    const msg = createErr?.message ?? "No se pudo crear el usuario";
    const status = /already registered|already exists/i.test(msg) ? 409 : 400;
    return json({ error: msg }, status);
  }
  const newUserId = created.user.id;

  // 5. Insertar en finca_miembros. Si falla (p.ej. el trigger de límite lo
  //    rechaza por una carrera), deshacemos la creación del auth user para
  //    no dejar cuentas huérfanas.
  const { error: miembroErr } = await admin.from("finca_miembros").insert({
    finca_id,
    user_id: newUserId,
    rol,
    activo: true,
    invitado_por: callerId,
  });
  if (miembroErr) {
    await admin.auth.admin.deleteUser(newUserId);
    return json({ error: `No se pudo vincular a la finca: ${miembroErr.message}` }, 400);
  }

  // 6. Perfil (nombre/teléfono) — no crítico, no revertimos si falla.
  if (nombre || telefono) {
    await admin.from("user_profiles").upsert({
      user_id: newUserId,
      nombre: nombre?.trim() || null,
      telefono: telefono?.trim() || null,
    });
  }

  return json({ ok: true, userId: newUserId, email });
});
