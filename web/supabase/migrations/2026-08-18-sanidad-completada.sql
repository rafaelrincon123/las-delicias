-- Agrega estado "completada" a la tabla sanidad, para permitir marcar
-- eventos como programados / realizados desde la app (igual que tareas).
--
-- Ejecutar UNA sola vez en Supabase → SQL Editor.

alter table sanidad
  add column if not exists completada       boolean     not null default false,
  add column if not exists completada_fecha timestamptz;

-- Los registros previos se asumen realizados (son históricos): si su
-- fecha ya pasó, marcarlos como completados.
update sanidad
   set completada = true,
       completada_fecha = coalesce(completada_fecha, created_at)
 where completada = false
   and fecha < current_date;

comment on column sanidad.completada is
  'true = ya realizada; false = programada (aún no ejecutada).';
comment on column sanidad.completada_fecha is
  'Fecha/hora en que se marcó como realizada.';
