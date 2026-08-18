-- Agrega estado "completada" a la tabla servicios, para poder chulear
-- partos previstos como realizados (igual que tareas y sanidad).
--
-- Ejecutar UNA sola vez en Supabase → SQL Editor.

alter table servicios
  add column if not exists completada       boolean     not null default false,
  add column if not exists completada_fecha timestamptz;

-- Backfill: servicios cuya fecha probable de parto ya pasó se marcan
-- como completados (asumimos que el parto ocurrió).
update servicios
   set completada = true,
       completada_fecha = coalesce(completada_fecha, created_at)
 where completada = false
   and fecha_probable_parto is not null
   and fecha_probable_parto < current_date;

comment on column servicios.completada is
  'true = parto previsto ya ocurrió / servicio cerrado; false = pendiente.';
comment on column servicios.completada_fecha is
  'Fecha/hora en que se marcó como realizado.';
