-- ============================================================================
--  RumeApp — Prueba gratis de 30 días + valores definitivos de los 3 planes
--
--  Qué hace:
--    1. Agrega fincas.trial_ends_at (fin de la prueba) y fincas.plan_pagado
--       (true = pago real confirmado por Rafael a mano, hasta que exista
--       Stripe/Wompi/PayU — sin esto, "plan" solo significaría algo mientras
--       dura la prueba).
--    2. plan_efectivo(finca_id): el plan que REALMENTE aplica ahora mismo —
--       el pagado si plan_pagado=true, el de prueba si trial_ends_at > now(),
--       si no, siempre 'ranchero'. Todos los límites pasan a calcularse
--       sobre este valor, no sobre fincas.plan crudo.
--    3. Nuevos valores de los 3 planes (ver tabla plan_limits):
--         Ranchero: gratis, 5 animales, 5 miembros TOTAL pero solo 1 con
--                   permisos de edición (el owner) — el resto deben ser
--                   "solo lectura". 1 finca.
--         Ganadero: 15 USD/mes, 50 animales, 5 miembros (cualquier rol),
--                   3 fincas.
--         Hacienda: 50 USD/mes, todo ilimitado.
--    4. Nuevo trigger enforce_fincas_limit: limita cuántas fincas puede
--       poseer un owner según el plan de la finca que está creando.
--    5. enforce_miembros_limit ahora también valida el sub-límite de
--       "miembros con permiso de edición" (Ranchero).
--    6. crear_finca acepta p_plan_elegido: al hacer signup, el usuario
--       elige CUALQUIERA de los 3 planes y arranca con 30 días de prueba
--       de ese plan (Ranchero no necesita prueba, ya es gratis siempre).
--
--  Idempotente.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Columnas nuevas en fincas
-- ---------------------------------------------------------------------------
alter table fincas add column if not exists trial_ends_at timestamptz;
alter table fincas add column if not exists plan_pagado boolean not null default false;

-- ---------------------------------------------------------------------------
-- 2. plan_efectivo: el plan que de verdad aplica ahora mismo
-- ---------------------------------------------------------------------------
create or replace function plan_efectivo(p_finca_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select case
    when f.plan_pagado then f.plan
    when f.trial_ends_at is not null and f.trial_ends_at > now() then f.plan
    else 'ranchero'
  end
  from fincas f
  where f.id = p_finca_id
$$;

grant execute on function plan_efectivo(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Valores definitivos de los 3 planes
-- ---------------------------------------------------------------------------
create or replace view plan_limits as
select 'ranchero'::text as plan,
       5    as max_animales,
       5    as max_usuarios,        -- total (owner + hasta 4 viewers)
       1    as max_usuarios_editor, -- solo el owner puede editar
       1    as max_fincas
union all
select 'ganadero'::text as plan,
       50   as max_animales,
       5    as max_usuarios,
       null::int as max_usuarios_editor,  -- sin sub-límite: los 5 pueden ser editores
       3    as max_fincas
union all
select 'hacienda'::text as plan,
       null::int as max_animales,
       null::int as max_usuarios,
       null::int as max_usuarios_editor,
       null::int as max_fincas;

-- ---------------------------------------------------------------------------
-- 4. Helpers de límite — todos leen plan_efectivo(), no fincas.plan directo
-- ---------------------------------------------------------------------------
create or replace function plan_max_animales(p_finca_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select l.max_animales from plan_limits l where l.plan = plan_efectivo(p_finca_id)
$$;

create or replace function plan_max_usuarios(p_finca_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select l.max_usuarios from plan_limits l where l.plan = plan_efectivo(p_finca_id)
$$;

create or replace function plan_max_usuarios_editor(p_finca_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select l.max_usuarios_editor from plan_limits l where l.plan = plan_efectivo(p_finca_id)
$$;

create or replace function plan_max_fincas(p_finca_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select l.max_fincas from plan_limits l where l.plan = plan_efectivo(p_finca_id)
$$;

grant execute on function plan_max_animales(uuid)        to authenticated;
grant execute on function plan_max_usuarios(uuid)        to authenticated;
grant execute on function plan_max_usuarios_editor(uuid) to authenticated;
grant execute on function plan_max_fincas(uuid)          to authenticated;

create or replace function puede_agregar_animal(p_finca_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when plan_max_animales(p_finca_id) is null then true
    when (select count(*) from animales where finca_id = p_finca_id) < plan_max_animales(p_finca_id) then true
    else false
  end
$$;

create or replace function puede_agregar_miembro(p_finca_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select case
    when plan_max_usuarios(p_finca_id) is null then true
    when (select count(*) from finca_miembros where finca_id = p_finca_id and activo) < plan_max_usuarios(p_finca_id) then true
    else false
  end
$$;

grant execute on function puede_agregar_animal(uuid)  to authenticated;
grant execute on function puede_agregar_miembro(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 5. enforce_miembros_limit: ahora también respeta el sub-límite de editores
--    (Ranchero: solo 1 persona con rol distinto a 'viewer').
-- ---------------------------------------------------------------------------
create or replace function enforce_miembros_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cap_total int;
  cap_editor int;
  actuales_total int;
  actuales_editor int;
  plan_actual text;
begin
  plan_actual := plan_efectivo(new.finca_id);
  cap_total  := plan_max_usuarios(new.finca_id);
  cap_editor := plan_max_usuarios_editor(new.finca_id);

  if cap_total is not null then
    select count(*) into actuales_total
      from finca_miembros where finca_id = new.finca_id and activo;
    if actuales_total >= cap_total then
      raise exception 'Alcanzaste el límite de % personas del plan %. Cambia de plan para agregar más.', cap_total, plan_actual
        using errcode = 'P0001';
    end if;
  end if;

  if cap_editor is not null and new.rol <> 'viewer' then
    select count(*) into actuales_editor
      from finca_miembros where finca_id = new.finca_id and activo and rol <> 'viewer';
    if actuales_editor >= cap_editor then
      raise exception 'Tu plan % solo permite % persona(s) con permiso de edición — las demás deben ser "Solo lectura". Cambia de plan para agregar más editores.', plan_actual, cap_editor
        using errcode = 'P0001';
    end if;
  end if;

  return new;
end $$;

-- (el trigger ya existe desde 2026-09-22-user-profiles-y-planes.sql, solo
--  reemplazamos la función que ejecuta)

-- ---------------------------------------------------------------------------
-- 6. enforce_fincas_limit: cuántas fincas puede poseer un owner
-- ---------------------------------------------------------------------------
create or replace function enforce_fincas_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  plan_nueva text;
  cap int;
  actuales int;
begin
  -- La fila que se está insertando trae su propio plan/trial/pago; se
  -- calcula el "efectivo" en memoria porque todavía no tiene fila en la
  -- tabla (no se puede llamar plan_efectivo(new.id) antes del insert).
  plan_nueva := case
    when new.plan_pagado then new.plan
    when new.trial_ends_at is not null and new.trial_ends_at > now() then new.plan
    else 'ranchero'
  end;

  select max_fincas into cap from plan_limits where plan = plan_nueva;
  if cap is null then
    return new; -- ilimitado
  end if;

  select count(*) into actuales from fincas where owner_user_id = new.owner_user_id;
  if actuales >= cap then
    raise exception 'Ya tienes % finca(s) — el máximo del plan % es %. Cambia de plan para crear más.', actuales, plan_nueva, cap
      using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists trg_enforce_fincas_limit on fincas;
create trigger trg_enforce_fincas_limit
  before insert on fincas
  for each row execute function enforce_fincas_limit();

-- ---------------------------------------------------------------------------
-- 7. crear_finca: el usuario elige el plan a probar (30 días gratis)
--    IMPORTANTE: agregar un parámetro nuevo cambia la firma de la función.
--    Postgres trataría esto como un OVERLOAD, no un reemplazo, dejando la
--    versión vieja (8 parámetros) viva y ambigua. Hay que borrarla primero.
-- ---------------------------------------------------------------------------
drop function if exists crear_finca(text, text, text, int, text, text, text, text);

create or replace function crear_finca(
  p_nombre             text,
  p_timezone           text default 'America/Bogota',
  p_nombre_propietario text default null,
  p_tamano_aprox       int  default null,
  p_telefono           text default null,
  p_departamento       text default null,
  p_ciudad             text default null,
  p_referido_via       text default null,
  p_plan_elegido       text default 'ranchero'
) returns fincas
language plpgsql security definer set search_path = public as $$
declare
  uid_actual   uuid := auth.uid();
  email_actual text;
  nombre_final text;
  plan_valido  text;
  nueva        fincas;
  prop_id      text := 'p-' || replace(gen_random_uuid()::text, '-', '');
begin
  if uid_actual is null then
    raise exception 'No hay usuario autenticado';
  end if;

  select email into email_actual from auth.users where id = uid_actual;

  nombre_final := coalesce(nullif(trim(p_nombre_propietario), ''), split_part(email_actual, '@', 1));

  plan_valido := case
    when p_plan_elegido in ('ranchero', 'ganadero', 'hacienda') then p_plan_elegido
    else 'ranchero'
  end;

  insert into user_profiles (user_id, nombre, telefono, departamento, ciudad, referido_via)
  values (
    uid_actual,
    nombre_final,
    nullif(trim(p_telefono), ''),
    nullif(trim(p_departamento), ''),
    nullif(trim(p_ciudad), ''),
    nullif(trim(p_referido_via), '')
  )
  on conflict (user_id) do update
    set nombre       = coalesce(excluded.nombre,       user_profiles.nombre),
        telefono     = coalesce(excluded.telefono,     user_profiles.telefono),
        departamento = coalesce(excluded.departamento, user_profiles.departamento),
        ciudad       = coalesce(excluded.ciudad,       user_profiles.ciudad),
        referido_via = coalesce(excluded.referido_via, user_profiles.referido_via);

  insert into fincas (nombre, owner_user_id, plan, timezone, tamano_aprox, trial_ends_at)
  values (
    trim(p_nombre),
    uid_actual,
    plan_valido,
    coalesce(p_timezone, 'America/Bogota'),
    p_tamano_aprox,
    case when plan_valido = 'ranchero' then null else now() + interval '30 days' end
  )
  returning * into nueva;

  insert into propietarios (id, nombre, email, participacion_pct, auth_user_id, finca_id)
  values (
    prop_id,
    nombre_final,
    email_actual,
    100,
    uid_actual,
    nueva.id
  );

  return nueva;
end $$;

grant execute on function crear_finca(text, text, text, int, text, text, text, text, text) to authenticated;
