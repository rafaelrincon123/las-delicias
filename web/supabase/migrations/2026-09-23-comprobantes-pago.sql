-- ============================================================================
--  RumeApp — Storage para comprobantes de pago (flujo manual)
--
--  Mientras se integra un procesador de pagos real (Wompi/PayU), el cambio
--  de plan se sigue procesando a mano: el cliente transfiere a la cuenta
--  de Rafael, sube el comprobante desde /plan, y la app arma un correo con
--  un link al comprobante para que Rafael lo revise y active el plan.
--
--  Bucket privado (no público) — cada finca solo puede subir/ver sus
--  propios comprobantes; Rafael los ve porque es owner de cada finca o
--  porque abre el link firmado que llega al correo.
--
--  Idempotente.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('comprobantes-pago', 'comprobantes-pago', false)
on conflict (id) do nothing;

drop policy if exists "comprobantes_insert_propia_finca" on storage.objects;
drop policy if exists "comprobantes_select_propia_finca" on storage.objects;

-- La ruta de cada archivo debe empezar con "<finca_id>/" — se valida que
-- quien sube sea miembro de esa finca (storage.foldername(name)[1] es el
-- primer segmento de la ruta, o sea el finca_id).
create policy "comprobantes_insert_propia_finca" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'comprobantes-pago'
    and is_finca_member((storage.foldername(name))[1]::uuid)
  );

create policy "comprobantes_select_propia_finca" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'comprobantes-pago'
    and is_finca_member((storage.foldername(name))[1]::uuid)
  );

-- Tabla ligera de auditoría: qué comprobante corresponde a qué solicitud
-- de cambio de plan. No reemplaza el proceso manual (Rafael sigue
-- activando el plan a mano desde el Dashboard) — solo deja rastro de
-- quién subió qué y cuándo, por si hay que revisar despues.
create table if not exists comprobantes_pago (
  id            uuid primary key default gen_random_uuid(),
  finca_id      uuid not null references fincas(id) on delete cascade,
  subido_por    uuid not null references auth.users(id) on delete cascade,
  plan_solicitado text not null check (plan_solicitado in ('ganadero', 'hacienda')),
  storage_path  text not null,
  estado        text not null default 'pendiente' check (estado in ('pendiente', 'aprobado', 'rechazado')),
  notas         text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_comprobantes_finca on comprobantes_pago(finca_id);

alter table comprobantes_pago enable row level security;

drop policy if exists "comprobantes_pago_insert" on comprobantes_pago;
drop policy if exists "comprobantes_pago_select" on comprobantes_pago;

create policy "comprobantes_pago_insert" on comprobantes_pago
  for insert to authenticated
  with check (is_finca_member(finca_id) and subido_por = auth.uid());

create policy "comprobantes_pago_select" on comprobantes_pago
  for select to authenticated
  using (is_finca_member(finca_id));
