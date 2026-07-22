-- Habilita Realtime en todas las tablas del proyecto.
-- Ejecutar UNA sola vez en Supabase → SQL Editor.

alter publication supabase_realtime add table
  propietarios,
  potreros,
  animales,
  sanidad,
  servicios,
  partos,
  pesajes,
  produccion_leche,
  gastos,
  ingresos,
  tareas,
  insumos,
  movimientos_insumo;
