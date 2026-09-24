-- ============================================================================
--  RumeApp — Fin de la prueba gratis de 30 días
--
--  Desde el 2026-09-24 las fincas nuevas arrancan siempre en Ranchero (gratis)
--  y sin trial_ends_at. Los planes pagos se activan solo al confirmar el pago,
--  y traen de regalo el Curso intensivo de ganadería digital.
--  Las fincas que ya estaban en prueba la conservan hasta que se venza.
--
--  Idempotente (misma firma de crear_finca: solo reemplaza el cuerpo).
-- ============================================================================

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

  -- Sin prueba gratis: toda finca nueva arranca en Ranchero. El plan que
  -- eligió (plan_valido) se activa cuando Rafael confirma el pago.
  insert into fincas (nombre, owner_user_id, plan, timezone, tamano_aprox, trial_ends_at)
  values (
    trim(p_nombre),
    uid_actual,
    'ranchero',
    coalesce(p_timezone, 'America/Bogota'),
    p_tamano_aprox,
    null
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
