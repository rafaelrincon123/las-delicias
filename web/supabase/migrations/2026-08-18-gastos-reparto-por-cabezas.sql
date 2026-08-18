-- Agrega reparto por cabezas a gastos: se seleccionan animales y el gasto se
-- divide entre sus propietarios en proporción al número de cabezas.
--
-- Ejecutar UNA sola vez en Supabase → SQL Editor.

alter table gastos
  add column if not exists animal_ids  text[],
  add column if not exists reparto_por text;

comment on column gastos.animal_ids is
  'Animales involucrados en el gasto (usado con reparto_por = "cabezas").';
comment on column gastos.reparto_por is
  '"socios" (default): partes iguales entre participantes. "cabezas": proporcional al número de cabezas por propietario en animal_ids.';
