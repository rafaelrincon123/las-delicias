-- ============================================================================
--  RumeApp — Fase 2: Roles y permisos
--
--  Qué hace:
--    1. Restringe finca_miembros.rol a los 4 valores válidos.
--    2. Helper finca_role(finca_id) — el rol del usuario actual en esa finca.
--    3. Reescribe las policies de las 13 tablas de dominio: de "for all"
--       (cualquier miembro puede todo) a select/write/delete separados
--       según el rol:
--         viewer   → solo lectura
--         operario → lectura + escritura, NO borra
--         admin    → todo
--         owner    → todo
--    4. finca_miembros ahora también acepta admin (no solo owner) para
--       invitar / cambiar roles / desactivar miembros. Borrar la FINCA
--       sigue siendo exclusivo del owner (sin cambios en policies de fincas).
--
--  Idempotente. Se corre desde el SQL Editor de Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Restringir los valores válidos de rol
-- ---------------------------------------------------------------------------
alter table finca_miembros drop constraint if exists finca_miembros_rol_check;
alter table finca_miembros add constraint finca_miembros_rol_check
  check (rol in ('owner', 'admin', 'operario', 'viewer'));

-- ---------------------------------------------------------------------------
-- 2. Helper: rol del usuario actual en una finca (null si no es miembro)
-- ---------------------------------------------------------------------------
create or replace function finca_role(f_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select rol from finca_miembros
   where finca_id = f_id
     and user_id  = auth.uid()
     and activo
   limit 1
$$;

create or replace function finca_role_puede_editar(f_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select finca_role(f_id) in ('owner', 'admin', 'operario')
$$;

create or replace function finca_role_puede_borrar(f_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select finca_role(f_id) in ('owner', 'admin')
$$;

create or replace function finca_role_es_admin(f_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select is_finca_owner(f_id) or finca_role(f_id) = 'admin'
$$;

grant execute on function finca_role(uuid)              to authenticated;
grant execute on function finca_role_puede_editar(uuid) to authenticated;
grant execute on function finca_role_puede_borrar(uuid) to authenticated;
grant execute on function finca_role_es_admin(uuid)     to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Reescribir RLS de las 13 tablas de dominio: select/write/delete por rol
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'propietarios','potreros','animales','sanidad','servicios','partos',
    'pesajes','produccion_leche','gastos','ingresos','tareas','insumos',
    'movimientos_insumo'
  ] loop
    execute format('drop policy if exists "tenant_all_%s"    on %I', t, t);
    execute format('drop policy if exists "tenant_select_%s" on %I', t, t);
    execute format('drop policy if exists "tenant_write_%s"  on %I', t, t);
    execute format('drop policy if exists "tenant_delete_%s" on %I', t, t);

    -- Cualquier miembro activo (incluido viewer) puede leer.
    execute format(
      'create policy "tenant_select_%s" on %I '
      'for select to authenticated '
      'using (is_finca_member(finca_id))',
      t, t
    );

    -- Insert/update: owner, admin y operario (viewer queda afuera).
    execute format(
      'create policy "tenant_write_%s" on %I '
      'for insert to authenticated '
      'with check (finca_role_puede_editar(finca_id))',
      t, t
    );
    execute format(
      'create policy "tenant_update_%s" on %I '
      'for update to authenticated '
      'using (finca_role_puede_editar(finca_id)) '
      'with check (finca_role_puede_editar(finca_id))',
      t, t
    );

    -- Delete: solo owner y admin.
    execute format(
      'create policy "tenant_delete_%s" on %I '
      'for delete to authenticated '
      'using (finca_role_puede_borrar(finca_id))',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4. finca_miembros: admin también gestiona equipo (no solo owner).
--    Borrar la FINCA sigue siendo exclusivo del owner — no se toca esa policy.
-- ---------------------------------------------------------------------------
drop policy if exists "miembros_read"   on finca_miembros;
drop policy if exists "miembros_insert" on finca_miembros;
drop policy if exists "miembros_update" on finca_miembros;
drop policy if exists "miembros_delete" on finca_miembros;

create policy "miembros_read" on finca_miembros
  for select to authenticated
  using (user_id = auth.uid() or finca_role_es_admin(finca_id));

-- El insert normal lo hace la Edge Function con service_role (bypassa RLS).
-- Esta policy cubre el caso de que algún día se inserte desde el cliente
-- (p.ej. una futura invitación por email) — igual exige owner o admin.
create policy "miembros_insert" on finca_miembros
  for insert to authenticated
  with check (finca_role_es_admin(finca_id));

create policy "miembros_update" on finca_miembros
  for update to authenticated
  using (finca_role_es_admin(finca_id))
  with check (finca_role_es_admin(finca_id));

create policy "miembros_delete" on finca_miembros
  for delete to authenticated
  using (finca_role_es_admin(finca_id));

-- ---------------------------------------------------------------------------
-- 5. Protección del owner a nivel de base de datos: ni un admin ni ningún
--    bug de UI puede degradar, desactivar o borrar la fila del owner, ni
--    promover a otro miembro a 'owner' por esta vía (eso solo pasa una vez,
--    al crear la finca).
-- ---------------------------------------------------------------------------
create or replace function protect_owner_membership() returns trigger
language plpgsql as $$
begin
  if TG_OP = 'DELETE' then
    if old.rol = 'owner' then
      raise exception 'No se puede eliminar al owner de la finca.';
    end if;
    return old;
  end if;

  if old.rol = 'owner' and new.rol <> 'owner' then
    raise exception 'No se puede cambiar el rol del owner.';
  end if;
  if new.rol = 'owner' and old.rol <> 'owner' then
    raise exception 'No se puede promover a otro miembro a owner desde aquí.';
  end if;
  if old.rol = 'owner' and new.activo = false then
    raise exception 'No se puede desactivar al owner.';
  end if;
  return new;
end $$;

drop trigger if exists trg_protect_owner_membership on finca_miembros;
create trigger trg_protect_owner_membership
  before update or delete on finca_miembros
  for each row execute function protect_owner_membership();

-- ---------------------------------------------------------------------------
-- 6. listar_miembros_finca: el cliente no puede leer auth.users ni el
--    user_profiles de otra persona (RLS de user_profiles es own-row). Esta
--    RPC junta finca_miembros + auth.users + user_profiles para cualquier
--    miembro de la finca (incluido viewer, para que vea quién es el equipo).
-- ---------------------------------------------------------------------------
create or replace function listar_miembros_finca(p_finca_id uuid)
returns table (
  user_id      uuid,
  rol          text,
  activo       boolean,
  invitado_por uuid,
  created_at   timestamptz,
  nombre       text,
  email        text,
  telefono     text
)
language sql stable security definer set search_path = public as $$
  select
    fm.user_id,
    fm.rol,
    fm.activo,
    fm.invitado_por,
    fm.created_at,
    up.nombre,
    u.email,
    up.telefono
  from finca_miembros fm
  join auth.users u on u.id = fm.user_id
  left join user_profiles up on up.user_id = fm.user_id
  where fm.finca_id = p_finca_id
    and is_finca_member(p_finca_id)
  order by fm.created_at asc
$$;

grant execute on function listar_miembros_finca(uuid) to authenticated;
