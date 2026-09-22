-- ============================================================================
--  RumeApp — vincular un socio (propietario) a cualquier miembro del equipo
--
--  Hasta ahora `vincular_propietario_a_mi` solo dejaba a alguien vincularse
--  A SÍ MISMO. El owner/admin necesita poder vincular un socio a OTRA
--  persona del equipo (un empleado que ya creó desde /equipo).
--
--  También alinea reasignar_propietario / eliminar_propietario con el
--  modelo de roles de Fase 2: antes solo el owner podía usarlas, ahora
--  también el admin (mismo criterio que el resto de la app: admin = todo
--  excepto borrar la finca).
--
--  Idempotente.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Vincular un socio a un miembro del equipo (owner o admin).
--    Si ese user_id ya estaba vinculado a OTRO socio de la misma finca,
--    lo despega primero (un user solo puede ser "el mismo" que un socio).
-- ---------------------------------------------------------------------------
create or replace function vincular_propietario_a_miembro(
  p_propietario_id text,
  p_user_id uuid
) returns void
language plpgsql security definer set search_path = public as $$
declare
  f_id uuid;
begin
  select finca_id into f_id from propietarios where id = p_propietario_id;
  if f_id is null then
    raise exception 'Propietario no encontrado: %', p_propietario_id;
  end if;

  if not finca_role_es_admin(f_id) then
    raise exception 'Solo el owner o un admin pueden vincular socios a miembros del equipo';
  end if;

  if not exists (
    select 1 from finca_miembros
     where finca_id = f_id and user_id = p_user_id and activo
  ) then
    raise exception 'Esa persona no es miembro activo de esta finca';
  end if;

  update propietarios
     set auth_user_id = null
   where finca_id = f_id
     and auth_user_id = p_user_id
     and id <> p_propietario_id;

  update propietarios set auth_user_id = p_user_id where id = p_propietario_id;
end $$;

grant execute on function vincular_propietario_a_miembro(text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 2. Desvincular (quitar el auth_user_id sin asignar a otro).
-- ---------------------------------------------------------------------------
create or replace function desvincular_propietario(p_propietario_id text) returns void
language plpgsql security definer set search_path = public as $$
declare
  f_id uuid;
begin
  select finca_id into f_id from propietarios where id = p_propietario_id;
  if f_id is null then
    raise exception 'Propietario no encontrado: %', p_propietario_id;
  end if;
  if not finca_role_es_admin(f_id) then
    raise exception 'Solo el owner o un admin pueden desvincular socios';
  end if;
  update propietarios set auth_user_id = null where id = p_propietario_id;
end $$;

grant execute on function desvincular_propietario(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. vincular_propietario_a_mi: mismo saneamiento (despegar duplicados)
--    que la nueva función, para que el comportamiento sea consistente.
-- ---------------------------------------------------------------------------
create or replace function vincular_propietario_a_mi(p_id text) returns void
language plpgsql security definer set search_path = public as $$
declare
  f_id uuid;
begin
  select finca_id into f_id from propietarios where id = p_id;
  if f_id is null then
    raise exception 'Propietario no encontrado: %', p_id;
  end if;
  if not is_finca_member(f_id) then
    raise exception 'No eres miembro de esa finca';
  end if;

  update propietarios
     set auth_user_id = null
   where finca_id = f_id
     and auth_user_id = auth.uid()
     and id <> p_id;

  update propietarios set auth_user_id = auth.uid() where id = p_id;
end $$;

grant execute on function vincular_propietario_a_mi(text) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. reasignar_propietario / eliminar_propietario: admin también puede,
--    no solo owner (coherente con el resto de Fase 2).
-- ---------------------------------------------------------------------------
create or replace function reasignar_propietario(
  p_from text,
  p_to   text
) returns void
language plpgsql security definer set search_path = public as $$
declare
  f_id uuid;
  f_id_to uuid;
begin
  if p_from = p_to then
    raise exception 'Origen y destino son iguales';
  end if;

  select finca_id into f_id from propietarios where id = p_from;
  if f_id is null then
    raise exception 'Propietario origen no encontrado: %', p_from;
  end if;
  select finca_id into f_id_to from propietarios where id = p_to;
  if f_id_to is null then
    raise exception 'Propietario destino no encontrado: %', p_to;
  end if;
  if f_id <> f_id_to then
    raise exception 'Ambos propietarios deben estar en la misma finca';
  end if;

  if not finca_role_es_admin(f_id) then
    raise exception 'Solo el owner o un admin pueden reasignar propietarios';
  end if;

  update animales set propietario_id = p_to where propietario_id = p_from;

  update tareas set asignado_a_id = p_to where asignado_a_id = p_from;
  update tareas
     set asignado_a_ids = array_replace(asignado_a_ids, p_from, p_to)
   where p_from = any(asignado_a_ids);

  update movimientos_insumo set hecho_por_id = p_to where hecho_por_id = p_from;

  update gastos set pagado_por = p_to where pagado_por = p_from;
  update gastos
     set participantes = array_replace(participantes, p_from, p_to)
   where p_from = any(participantes);
  update gastos
     set pagado_por_ids = array_replace(pagado_por_ids, p_from, p_to)
   where p_from = any(pagado_por_ids);

  begin
    update ingresos set registrado_por = p_to where registrado_por = p_from;
  exception when undefined_column then null; end;
end $$;

grant execute on function reasignar_propietario(text, text) to authenticated;

create or replace function eliminar_propietario(p_id text) returns void
language plpgsql security definer set search_path = public as $$
declare
  f_id uuid;
  n int;
begin
  select finca_id into f_id from propietarios where id = p_id;
  if f_id is null then
    raise exception 'Propietario no encontrado: %', p_id;
  end if;
  if not finca_role_es_admin(f_id) then
    raise exception 'Solo el owner o un admin pueden eliminar socios';
  end if;

  select count(*) into n from animales where propietario_id = p_id;
  if n > 0 then raise exception 'Todavía tiene % animal(es) — reasigna primero', n; end if;
  select count(*) into n from gastos
   where pagado_por = p_id
      or p_id = any(participantes)
      or p_id = any(pagado_por_ids);
  if n > 0 then raise exception 'Todavía aparece en % gasto(s) — reasigna primero', n; end if;
  select count(*) into n from tareas
   where asignado_a_id = p_id
      or p_id = any(asignado_a_ids);
  if n > 0 then raise exception 'Todavía tiene % tarea(s) asignada(s) — reasigna primero', n; end if;

  delete from propietarios where id = p_id;
end $$;

grant execute on function eliminar_propietario(text) to authenticated;
