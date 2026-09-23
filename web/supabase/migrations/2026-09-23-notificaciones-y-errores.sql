-- ============================================================================
--  RumeApp — avisos por correo al admin + registro de errores de la app
--
--  Qué hace:
--    1. Tabla `errores_app`: el navegador registra aquí los errores que le
--       pasan a los usuarios (reemplaza a Sentry sin cuenta externa).
--    2. `comprobantes_pago.storage_path` pasa a ser opcional: una solicitud
--       de cambio de plan se registra aunque el cliente no suba comprobante.
--    3. Triggers que llaman a la Edge Function `notificar-admin` (vía pg_net,
--       asíncrono y después del commit) cuando:
--         - se crea una finca (alguien se afilia a cualquier plan),
--         - llega una solicitud de pago,
--         - se registra un error nuevo (máx. 1 correo por mensaje cada 6 h
--           y 20 al día, para no llenar la bandeja).
--
--  La URL y el secreto compartido viven en `privado.config` y se cargan a
--  mano (NO van en este repo, que es público):
--    insert into privado.config values
--      ('notify_url', 'https://<ref>.supabase.co/functions/v1/notificar-admin'),
--      ('notify_secret', '<mismo valor que el secret NOTIFY_SECRET de la función>')
--    on conflict (clave) do update set valor = excluded.valor;
--
--  Requiere antes 2026-09-23-comprobantes-pago.sql. Idempotente.
-- ============================================================================

create extension if not exists pg_net;

-- ---------------------------------------------------------------------------
-- Config privada (no expuesta por la API: schema fuera de "public")
-- ---------------------------------------------------------------------------
create schema if not exists privado;
revoke all on schema privado from public, anon, authenticated;

create table if not exists privado.config (
  clave text primary key,
  valor text not null
);

-- ---------------------------------------------------------------------------
-- 1. errores_app
-- ---------------------------------------------------------------------------
create table if not exists errores_app (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  user_id     uuid default auth.uid() references auth.users(id) on delete set null,
  mensaje     text not null check (length(mensaje) <= 1000),
  stack       text check (length(stack) <= 8000),
  url         text check (length(url) <= 1000),
  user_agent  text check (length(user_agent) <= 500)
);

create index if not exists idx_errores_app_created on errores_app(created_at desc);

alter table errores_app enable row level security;

-- Cualquiera (incluso sin sesión, p. ej. en la landing) puede REPORTAR un
-- error, pero nadie puede leerlos por la API: solo se ven en el Dashboard
-- y en los correos.
drop policy if exists "errores_app_insert" on errores_app;
create policy "errores_app_insert" on errores_app
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- 2. Solicitud de plan sin comprobante
-- ---------------------------------------------------------------------------
alter table comprobantes_pago alter column storage_path drop not null;

-- ---------------------------------------------------------------------------
-- 3. Notificaciones
-- ---------------------------------------------------------------------------
create or replace function privado.notificar_admin(p_tipo text, p_id text)
returns void
language plpgsql
security definer
set search_path = public, privado, extensions
as $$
declare
  v_url    text;
  v_secret text;
begin
  select valor into v_url    from privado.config where clave = 'notify_url';
  select valor into v_secret from privado.config where clave = 'notify_secret';
  if v_url is null or v_secret is null then
    return;
  end if;
  -- Solo se manda el tipo y el id; la función lee el resto con service_role
  -- cuando el request sale (después del commit, así ya existe todo).
  perform net.http_post(
    url     := v_url,
    body    := jsonb_build_object('tipo', p_tipo, 'id', p_id),
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-notify-secret', v_secret
    )
  );
exception when others then
  -- Un aviso que falla nunca debe impedir crear la finca o la solicitud.
  raise warning 'notificar_admin(%) falló: %', p_tipo, sqlerrm;
end;
$$;

create or replace function privado.tg_nueva_finca() returns trigger
language plpgsql security definer set search_path = public, privado as $$
begin
  perform privado.notificar_admin('nueva_finca', new.id::text);
  return null;
end;
$$;

create or replace function privado.tg_solicitud_pago() returns trigger
language plpgsql security definer set search_path = public, privado as $$
begin
  perform privado.notificar_admin('solicitud_pago', new.id::text);
  return null;
end;
$$;

create or replace function privado.tg_error_app() returns trigger
language plpgsql security definer set search_path = public, privado as $$
begin
  if exists (
    select 1 from errores_app
    where mensaje = new.mensaje and id <> new.id and created_at > now() - interval '6 hours'
  ) then
    return null;
  end if;
  if (select count(distinct mensaje) from errores_app where created_at > now() - interval '24 hours') > 20 then
    return null;
  end if;
  perform privado.notificar_admin('error', new.id::text);
  return null;
end;
$$;

drop trigger if exists trg_notificar_nueva_finca on fincas;
create trigger trg_notificar_nueva_finca
  after insert on fincas
  for each row execute function privado.tg_nueva_finca();

drop trigger if exists trg_notificar_solicitud_pago on comprobantes_pago;
create trigger trg_notificar_solicitud_pago
  after insert on comprobantes_pago
  for each row execute function privado.tg_solicitud_pago();

drop trigger if exists trg_notificar_error_app on errores_app;
create trigger trg_notificar_error_app
  after insert on errores_app
  for each row execute function privado.tg_error_app();
