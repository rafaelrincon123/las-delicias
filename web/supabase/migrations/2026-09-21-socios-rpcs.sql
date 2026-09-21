-- Reasigna todo lo atado a un propietario (from) hacia otro (to) dentro
-- de la misma finca. Se corre como el usuario dueño de la finca; RLS
-- valida via is_finca_owner. Es SECURITY DEFINER para hacer los UPDATEs
-- sin depender de las policies tenant_all_*.
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

  -- Solo el owner de la finca puede reasignar
  if not is_finca_owner(f_id) then
    raise exception 'Solo el owner de la finca puede reasignar propietarios';
  end if;

  -- Animales: cambiar dueño
  update animales set propietario_id = p_to where propietario_id = p_from;

  -- Tareas: asignatario individual + array
  update tareas set asignado_a_id = p_to where asignado_a_id = p_from;
  update tareas
     set asignado_a_ids = array_replace(asignado_a_ids, p_from, p_to)
   where p_from = any(asignado_a_ids);

  -- Movimientos de insumo: quien lo hizo
  update movimientos_insumo set hecho_por_id = p_to where hecho_por_id = p_from;

  -- Gastos: pagado_por + arrays participantes / pagado_por_ids
  update gastos set pagado_por = p_to where pagado_por = p_from;
  update gastos
     set participantes = array_replace(participantes, p_from, p_to)
   where p_from = any(participantes);
  update gastos
     set pagado_por_ids = array_replace(pagado_por_ids, p_from, p_to)
   where p_from = any(pagado_por_ids);

  -- Ingresos: registrado_por (si la columna existe — tolerante)
  begin
    update ingresos set registrado_por = p_to where registrado_por = p_from;
  exception when undefined_column then null; end;
end $$;

grant execute on function reasignar_propietario(text, text) to authenticated;

-- Vincula el propietario dado con el auth.uid() actual. Útil cuando el
-- usuario quiere ser reconocido como socio X en Mi operación / Sidebar.
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
  update propietarios set auth_user_id = auth.uid() where id = p_id;
end $$;

grant execute on function vincular_propietario_a_mi(text) to authenticated;

-- Elimina un propietario. Falla si aún tiene animales/gastos/etc. asociados,
-- forzando a reasignar antes.
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
  if not is_finca_owner(f_id) then
    raise exception 'Solo el owner de la finca puede eliminar socios';
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
