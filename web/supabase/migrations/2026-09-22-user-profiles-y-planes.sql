-- ============================================================================
--  RumeApp — Fase 2/3 (parcial): user_profiles + tamano_aprox + planes
--
--  Qué hace:
--    1. Tabla `user_profiles` para guardar nombre, teléfono, ubicación y
--       cómo se enteró el usuario (datos que no son de auth pero sí del user).
--    2. Añade `tamano_aprox` (int) a `fincas` — cantidad de animales que el
--       user reporta al crear la finca (sirve para recomendar plan).
--    3. Extiende `crear_finca` para aceptar los nuevos campos y crear el
--       user_profile en el mismo paso.
--    4. Vista `plan_limits` con los límites por plan (ranchero/ganadero/hacienda).
--    5. Helpers `plan_of_finca(finca_id)` y `check_plan_limit(finca_id, resource)`.
--
--  Idempotente. Se corre desde el SQL Editor de Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. user_profiles: 1:1 con auth.users, datos personales
-- ---------------------------------------------------------------------------
create table if not exists user_profiles (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  nombre              text,
  telefono            text,        -- formato libre; el cliente envía con +57
  pais                text default 'CO',
  departamento        text,
  ciudad              text,
  referido_via        text,        -- 'referido' | 'google' | 'redes' | 'otro' | null
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_user_profiles_pais on user_profiles(pais);
create index if not exists idx_user_profiles_dep  on user_profiles(departamento);

alter table user_profiles enable row level security;

drop policy if exists "profiles_read_own"   on user_profiles;
drop policy if exists "profiles_upsert_own" on user_profiles;
drop policy if exists "profiles_update_own" on user_profiles;
drop policy if exists "profiles_delete_own" on user_profiles;

create policy "profiles_read_own" on user_profiles
  for select to authenticated
  using (user_id = auth.uid());

create policy "profiles_upsert_own" on user_profiles
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "profiles_update_own" on user_profiles
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "profiles_delete_own" on user_profiles
  for delete to authenticated
  using (user_id = auth.uid());

-- Trigger para mantener updated_at
create or replace function user_profiles_touch() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_user_profiles_touch on user_profiles;
create trigger trg_user_profiles_touch
  before update on user_profiles
  for each row execute function user_profiles_touch();

-- ---------------------------------------------------------------------------
-- 2. fincas.tamano_aprox — cantidad aprox de animales al momento de crear
-- ---------------------------------------------------------------------------
alter table fincas add column if not exists tamano_aprox int;

-- ---------------------------------------------------------------------------
-- 3. crear_finca extendida — acepta datos de perfil + tamano
-- ---------------------------------------------------------------------------
create or replace function crear_finca(
  p_nombre             text,
  p_timezone           text default 'America/Bogota',
  p_nombre_propietario text default null,
  p_tamano_aprox       int  default null,
  -- Datos de user_profile (opcionales; se guardan si vienen)
  p_telefono           text default null,
  p_departamento       text default null,
  p_ciudad             text default null,
  p_referido_via       text default null
) returns fincas
language plpgsql security definer set search_path = public as $$
declare
  uid_actual   uuid := auth.uid();
  email_actual text;
  nombre_final text;
  nueva        fincas;
  prop_id      text := 'p-' || replace(gen_random_uuid()::text, '-', '');
begin
  if uid_actual is null then
    raise exception 'No hay usuario autenticado';
  end if;

  select email into email_actual from auth.users where id = uid_actual;

  nombre_final := coalesce(nullif(trim(p_nombre_propietario), ''), split_part(email_actual, '@', 1));

  -- Upsert perfil del usuario con lo que venga
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

  -- Crear la finca
  insert into fincas (nombre, owner_user_id, plan, timezone, tamano_aprox)
  values (
    trim(p_nombre),
    uid_actual,
    'ranchero',
    coalesce(p_timezone, 'America/Bogota'),
    p_tamano_aprox
  )
  returning * into nueva;

  -- Trigger auto_add_owner_as_member ya insertó finca_miembros.
  -- Sembramos propietario con 100% participación.
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

grant execute on function crear_finca(text, text, text, int, text, text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Vista de límites por plan
-- ---------------------------------------------------------------------------
create or replace view plan_limits as
select 'ranchero'::text as plan, 15  as max_animales, 1   as max_usuarios union all
select 'ganadero'::text as plan, 200 as max_animales, 5   as max_usuarios union all
select 'hacienda'::text as plan, null::int as max_animales, null::int as max_usuarios;

-- ---------------------------------------------------------------------------
-- 5. Helpers para chequear plan y límite
-- ---------------------------------------------------------------------------
create or replace function plan_of_finca(p_finca_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select plan from fincas where id = p_finca_id
$$;

create or replace function plan_max_animales(p_finca_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select l.max_animales
    from fincas f
    join plan_limits l on l.plan = f.plan
   where f.id = p_finca_id
$$;

create or replace function plan_max_usuarios(p_finca_id uuid) returns int
language sql stable security definer set search_path = public as $$
  select l.max_usuarios
    from fincas f
    join plan_limits l on l.plan = f.plan
   where f.id = p_finca_id
$$;

-- Devuelve true si aún hay cupo para agregar UN animal más en la finca.
-- Hacienda (limit null) siempre devuelve true.
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

grant execute on function plan_of_finca(uuid)        to authenticated;
grant execute on function plan_max_animales(uuid)    to authenticated;
grant execute on function plan_max_usuarios(uuid)    to authenticated;
grant execute on function puede_agregar_animal(uuid) to authenticated;
grant execute on function puede_agregar_miembro(uuid) to authenticated;
grant select on plan_limits to authenticated;

-- ---------------------------------------------------------------------------
-- 6. Enforce limit al insertar animales (trigger)
--    Bloquea el insert si la finca ya llegó al tope de su plan.
-- ---------------------------------------------------------------------------
create or replace function enforce_animales_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cap int;
  actuales int;
  plan_actual text;
begin
  if new.finca_id is null then
    return new;  -- el trigger de finca_id se encarga; si sigue null, otro validator falla
  end if;

  cap := plan_max_animales(new.finca_id);
  if cap is null then
    return new;  -- Hacienda: ilimitado
  end if;

  select count(*) into actuales from animales where finca_id = new.finca_id;
  if actuales >= cap then
    select plan into plan_actual from fincas where id = new.finca_id;
    raise exception 'Alcanzaste el límite de % animales del plan %. Cambia de plan para agregar más.', cap, plan_actual
      using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists trg_enforce_animales_limit on animales;
create trigger trg_enforce_animales_limit
  before insert on animales
  for each row execute function enforce_animales_limit();

-- Enforce límite de miembros (invitados) también
create or replace function enforce_miembros_limit() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  cap int;
  actuales int;
  plan_actual text;
begin
  cap := plan_max_usuarios(new.finca_id);
  if cap is null then
    return new;
  end if;

  select count(*) into actuales
    from finca_miembros
   where finca_id = new.finca_id and activo;

  if actuales >= cap then
    select plan into plan_actual from fincas where id = new.finca_id;
    raise exception 'Alcanzaste el límite de % usuarios del plan %. Cambia de plan para invitar más.', cap, plan_actual
      using errcode = 'P0001';
  end if;

  return new;
end $$;

drop trigger if exists trg_enforce_miembros_limit on finca_miembros;
create trigger trg_enforce_miembros_limit
  before insert on finca_miembros
  for each row execute function enforce_miembros_limit();
