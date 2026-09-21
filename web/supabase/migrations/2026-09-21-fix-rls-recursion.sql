-- ============================================================================
--  Fix: recursión de RLS entre fincas y finca_miembros (causa HTTP 500)
--
--  El primer intento tenía policies que se referenciaban entre sí:
--    fincas_read  → select ... from finca_miembros ...
--    miembros_read → select ... from fincas ...
--  Postgres detecta el ciclo y aborta cualquier query.
--
--  Corrección: helpers SECURITY DEFINER que hacen el check sin re-entrar
--  al motor de RLS. Todas las policies llaman a esos helpers.
--
--  Idempotente.
-- ============================================================================

create or replace function is_finca_member(f_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from finca_miembros
     where finca_id = f_id
       and user_id  = auth.uid()
       and activo
  )
$$;

create or replace function is_finca_owner(f_id uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists(
    select 1 from fincas
     where id = f_id
       and owner_user_id = auth.uid()
  )
$$;

grant execute on function is_finca_member(uuid) to authenticated;
grant execute on function is_finca_owner(uuid)  to authenticated;

drop policy if exists "fincas_read"   on fincas;
drop policy if exists "fincas_insert" on fincas;
drop policy if exists "fincas_update" on fincas;
drop policy if exists "fincas_delete" on fincas;

create policy "fincas_read" on fincas
  for select to authenticated
  using (is_finca_member(id));

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
  using (user_id = auth.uid() or is_finca_owner(finca_id));

create policy "miembros_insert" on finca_miembros
  for insert to authenticated
  with check (is_finca_owner(finca_id));

create policy "miembros_update" on finca_miembros
  for update to authenticated
  using (is_finca_owner(finca_id))
  with check (is_finca_owner(finca_id));

create policy "miembros_delete" on finca_miembros
  for delete to authenticated
  using (is_finca_owner(finca_id));

do $$
declare t text;
begin
  foreach t in array array[
    'propietarios','potreros','animales','sanidad','servicios','partos',
    'pesajes','produccion_leche','gastos','ingresos','tareas','insumos',
    'movimientos_insumo'
  ] loop
    execute format('drop policy if exists "tenant_all_%s" on %I', t, t);
    execute format(
      'create policy "tenant_all_%s" on %I '
      'for all to authenticated '
      'using (is_finca_member(finca_id)) '
      'with check (is_finca_member(finca_id))',
      t, t
    );
  end loop;
end $$;
