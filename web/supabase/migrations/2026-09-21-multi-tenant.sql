-- ============================================================================
--  MiFinca — Fase 1: Multi-tenancy
--  Convierte la app de single-tenant (Las Delicias) a SaaS multi-finca.
--
--  Qué hace:
--    1. Crea `fincas` y `finca_miembros`.
--    2. Agrega `finca_id` a las 13 tablas de dominio (idempotente).
--    3. Migra todos los datos existentes a una finca llamada "Las Delicias",
--       cuyo owner es el usuario auth con email rafael.rincong@gmail.com.
--    4. Endurece RLS para aislar por `finca_id`.
--    5. Trigger que autocompleta `finca_id` en INSERTs si el cliente no lo manda.
--    6. RPC `crear_finca` para el wizard de onboarding.
--
--  Es idempotente: correrla dos veces no rompe nada.
--  Requiere que el usuario `rafael.rincong@gmail.com` YA exista en auth.users.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 1. Tablas de tenant
-- ---------------------------------------------------------------------------
create table if not exists fincas (
  id            uuid primary key default gen_random_uuid(),
  nombre        text not null,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  plan          text not null default 'ranchero',
  timezone      text not null default 'America/Bogota',
  created_at    timestamptz not null default now()
);

create table if not exists finca_miembros (
  id           uuid primary key default gen_random_uuid(),
  finca_id     uuid not null references fincas(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  rol          text not null default 'owner',
  activo       boolean not null default true,
  invitado_por uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  unique (finca_id, user_id)
);

create index if not exists idx_miembros_user on finca_miembros(user_id);
create index if not exists idx_miembros_finca on finca_miembros(finca_id);

-- ---------------------------------------------------------------------------
-- 2. Helper: primera finca activa del usuario (para autocompletar y wizard)
-- ---------------------------------------------------------------------------
create or replace function active_finca_id() returns uuid
language sql stable security definer set search_path = public as $$
  select fm.finca_id
    from finca_miembros fm
   where fm.user_id = auth.uid() and fm.activo
   order by fm.created_at asc
   limit 1
$$;

-- ---------------------------------------------------------------------------
-- 3. Agregar finca_id a cada tabla existente (idempotente)
-- ---------------------------------------------------------------------------
alter table animales           add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table potreros           add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table sanidad            add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table servicios          add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table partos             add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table pesajes            add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table produccion_leche   add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table gastos             add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table ingresos           add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table tareas             add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table insumos            add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table movimientos_insumo add column if not exists finca_id uuid references fincas(id) on delete cascade;
alter table propietarios       add column if not exists finca_id uuid references fincas(id) on delete cascade;

-- ---------------------------------------------------------------------------
-- 4. Migración de datos: todo lo existente va a la finca "Las Delicias"
-- ---------------------------------------------------------------------------
do $$
declare
  rafa_id uuid;
  ld_id   uuid;
begin
  select id into rafa_id
    from auth.users
   where lower(email) = 'rafael.rincong@gmail.com'
   limit 1;

  if rafa_id is null then
    raise notice
      'Usuario rafael.rincong@gmail.com no encontrado en auth.users. '
      'Crea el usuario en Supabase Auth y vuelve a correr esta migración.';
    return;
  end if;

  -- ¿Ya existe la finca? Si sí, la reutilizamos.
  select id into ld_id
    from fincas
   where nombre = 'Las Delicias' and owner_user_id = rafa_id
   limit 1;

  if ld_id is null then
    insert into fincas (nombre, owner_user_id, plan, timezone)
    values ('Las Delicias', rafa_id, 'hacienda', 'America/Bogota')
    returning id into ld_id;
  end if;

  -- Owner como miembro (el trigger de fincas también lo hace, pero por si acaso)
  insert into finca_miembros (finca_id, user_id, rol)
  values (ld_id, rafa_id, 'owner')
  on conflict (finca_id, user_id) do nothing;

  -- Backfill: filas sin finca_id apuntan a Las Delicias
  update animales           set finca_id = ld_id where finca_id is null;
  update potreros           set finca_id = ld_id where finca_id is null;
  update sanidad            set finca_id = ld_id where finca_id is null;
  update servicios          set finca_id = ld_id where finca_id is null;
  update partos             set finca_id = ld_id where finca_id is null;
  update pesajes            set finca_id = ld_id where finca_id is null;
  update produccion_leche   set finca_id = ld_id where finca_id is null;
  update gastos             set finca_id = ld_id where finca_id is null;
  update ingresos           set finca_id = ld_id where finca_id is null;
  update tareas             set finca_id = ld_id where finca_id is null;
  update insumos            set finca_id = ld_id where finca_id is null;
  update movimientos_insumo set finca_id = ld_id where finca_id is null;
  update propietarios       set finca_id = ld_id where finca_id is null;

  raise notice 'Migración datos existentes → finca Las Delicias (%) ok.', ld_id;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Endurecer: NOT NULL + índice por finca_id
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
  n bigint;
begin
  foreach t in array array[
    'animales','potreros','sanidad','servicios','partos','pesajes',
    'produccion_leche','gastos','ingresos','tareas','insumos',
    'movimientos_insumo','propietarios'
  ] loop
    execute format('select count(*) from %I where finca_id is null', t) into n;
    if n > 0 then
      raise notice 'Saltando NOT NULL en % — todavía hay % filas sin finca_id (¿faltó el usuario Rafael?).', t, n;
    else
      execute format('alter table %I alter column finca_id set not null', t);
    end if;
    execute format('create index if not exists idx_%s_finca_id on %I(finca_id)', t, t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 6. Trigger: si el cliente no manda finca_id en un INSERT, lo pone el server
-- ---------------------------------------------------------------------------
create or replace function set_default_finca_id() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.finca_id is null then
    new.finca_id := active_finca_id();
    if new.finca_id is null then
      raise exception 'El usuario no pertenece a ninguna finca activa (finca_id requerido).';
    end if;
  end if;
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'animales','potreros','sanidad','servicios','partos','pesajes',
    'produccion_leche','gastos','ingresos','tareas','insumos',
    'movimientos_insumo','propietarios'
  ] loop
    execute format('drop trigger if exists trg_%s_finca_id on %I', t, t);
    execute format(
      'create trigger trg_%s_finca_id before insert on %I '
      'for each row execute function set_default_finca_id()',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 7. Trigger: al crear una finca, el owner queda auto-agregado como miembro
-- ---------------------------------------------------------------------------
create or replace function auto_add_owner_as_member() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into finca_miembros (finca_id, user_id, rol)
  values (new.id, new.owner_user_id, 'owner')
  on conflict (finca_id, user_id) do nothing;
  return new;
end $$;

drop trigger if exists trg_fincas_auto_owner on fincas;
create trigger trg_fincas_auto_owner
  after insert on fincas
  for each row execute function auto_add_owner_as_member();

-- ---------------------------------------------------------------------------
-- 8. RPC de onboarding: crear finca + primer propietario en una sola llamada
--    Devuelve la fila de la finca creada.
-- ---------------------------------------------------------------------------
create or replace function crear_finca(
  p_nombre    text,
  p_timezone  text default 'America/Bogota',
  p_nombre_propietario text default null
) returns fincas
language plpgsql security definer set search_path = public as $$
declare
  uid_actual uuid := auth.uid();
  email_actual text;
  nueva      fincas;
  prop_id    text := 'p-' || replace(gen_random_uuid()::text, '-', '');
begin
  if uid_actual is null then
    raise exception 'No hay usuario autenticado';
  end if;

  select email into email_actual from auth.users where id = uid_actual;

  insert into fincas (nombre, owner_user_id, plan, timezone)
  values (trim(p_nombre), uid_actual, 'ranchero', coalesce(p_timezone, 'America/Bogota'))
  returning * into nueva;

  -- El trigger auto_add_owner_as_member ya insertó la membresía.
  -- Sembramos un propietario con el nombre pedido, 100% participación.
  insert into propietarios (id, nombre, email, participacion_pct, auth_user_id, finca_id)
  values (
    prop_id,
    coalesce(nullif(trim(p_nombre_propietario), ''), split_part(email_actual, '@', 1)),
    email_actual,
    100,
    uid_actual,
    nueva.id
  );

  return nueva;
end $$;

-- ---------------------------------------------------------------------------
-- 9. RLS: fincas y finca_miembros
-- ---------------------------------------------------------------------------
alter table fincas         enable row level security;
alter table finca_miembros enable row level security;

drop policy if exists "fincas_read"   on fincas;
drop policy if exists "fincas_insert" on fincas;
drop policy if exists "fincas_update" on fincas;
drop policy if exists "fincas_delete" on fincas;

create policy "fincas_read" on fincas
  for select to authenticated
  using (
    id in (select finca_id from finca_miembros where user_id = auth.uid() and activo)
  );

create policy "fincas_insert" on fincas
  for insert to authenticated
  with check (owner_user_id = auth.uid());

create policy "fincas_update" on fincas
  for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "fincas_delete" on fincas
  for delete to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists "miembros_read"   on finca_miembros;
drop policy if exists "miembros_insert" on finca_miembros;
drop policy if exists "miembros_update" on finca_miembros;
drop policy if exists "miembros_delete" on finca_miembros;

create policy "miembros_read" on finca_miembros
  for select to authenticated
  using (
    user_id = auth.uid()
    or finca_id in (select id from fincas where owner_user_id = auth.uid())
  );

create policy "miembros_insert" on finca_miembros
  for insert to authenticated
  with check (
    finca_id in (select id from fincas where owner_user_id = auth.uid())
  );

create policy "miembros_update" on finca_miembros
  for update to authenticated
  using (finca_id in (select id from fincas where owner_user_id = auth.uid()))
  with check (finca_id in (select id from fincas where owner_user_id = auth.uid()));

create policy "miembros_delete" on finca_miembros
  for delete to authenticated
  using (finca_id in (select id from fincas where owner_user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 10. RLS por tenant en las tablas de dominio.
--     Reemplaza las policies antiguas "socios_all_*" que daban acceso total.
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'propietarios','potreros','animales','sanidad','servicios','partos',
    'pesajes','produccion_leche','gastos','ingresos','tareas','insumos',
    'movimientos_insumo'
  ] loop
    execute format('drop policy if exists "socios_all_%s" on %I', t, t);
    execute format('drop policy if exists "tenant_all_%s"  on %I', t, t);
    execute format(
      'create policy "tenant_all_%s" on %I '
      'for all to authenticated '
      'using (finca_id in (select finca_id from finca_miembros where user_id = auth.uid() and activo)) '
      'with check (finca_id in (select finca_id from finca_miembros where user_id = auth.uid() and activo))',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 11. Realtime: incluir las nuevas tablas para que el cliente reciba cambios
-- ---------------------------------------------------------------------------
do $$
begin
  begin
    execute 'alter publication supabase_realtime add table fincas';
  exception when duplicate_object then null; end;
  begin
    execute 'alter publication supabase_realtime add table finca_miembros';
  exception when duplicate_object then null; end;
end $$;
