-- Agrega el campo pagado_por_ids a la tabla gastos.
-- Contiene los IDs de propietarios (participantes) que ya reembolsaron
-- su parte a quien puso la plata (pagado_por).
--
-- Ejecutar UNA sola vez en Supabase → SQL Editor.

alter table gastos
  add column if not exists pagado_por_ids text[] default '{}'::text[];

comment on column gastos.pagado_por_ids is
  'IDs de participantes que ya pagaron/reembolsaron su parte. '
  'El pagado_por cuenta como pagado por defecto si es participante.';
