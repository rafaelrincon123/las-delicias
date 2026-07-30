-- ============================================================================
--  Sincronización con Google Sheets (cronograma julio 2026)
--  Fecha: 2026-07-29
--
--  Aplica los cambios que faltaban del sheet oficial:
--   1. Multi-responsables en tareas del cronograma (9/7, 11/7, 14/7, 25/7).
--   2. Nueva tarea 25/7 "Suministro + se arregla poste de luz".
--   3. Insumos adicionales: jeringas, puntillas, aisladores, baldes.
--
--  Es idempotente — se puede correr varias veces sin duplicar ni romper
--  nada. Ejecuta esto DESPUÉS de la migración 2026-07-29-tareas-arrays.sql
--  (columnas animal_ids y asignado_a_ids).
-- ============================================================================

-- ------------------------------------------------------------------
--  1. TAREAS — reasignar responsables múltiples (según sheet oficial)
-- ------------------------------------------------------------------
update tareas set asignado_a_ids = array['prop-orlando']
  where id = 'tar-crono-0704';

update tareas set asignado_a_ids = array['prop-nicolas']
  where id = 'tar-crono-0707';

update tareas set asignado_a_ids = array['prop-orlando', 'prop-camila']
  where id = 'tar-crono-0709';

update tareas
  set asignado_a_ids = array['prop-orlando', 'prop-rafael', 'prop-camila'],
      animal_ids     = array['an-nube', 'an-pandora', 'an-canela', 'an-zeus']
  where id = 'tar-crono-0711';

update tareas set asignado_a_ids = array['prop-orlando', 'prop-camila']
  where id = 'tar-crono-0714-rot';

update tareas
  set asignado_a_ids = array['prop-orlando', 'prop-camila'],
      animal_ids     = array['an-nube', 'an-pandora', 'an-canela', 'an-zeus'],
      asignado_a_id  = 'prop-orlando'  -- estaba solo Camila; el sheet dice ambos
  where id = 'tar-crono-0714-vit';

update tareas set asignado_a_ids = array['prop-camila']
  where id = 'tar-crono-0717';

update tareas set asignado_a_ids = array['prop-nicolas']
  where id = 'tar-crono-0721';

-- Tareas pendientes que ya existían: setear animal_ids si aplica
update tareas set animal_ids = array['an-nube']
  where id = 'tar-diag-nube';

-- ------------------------------------------------------------------
--  2. TAREAS — nueva del 25/7 (upsert)
-- ------------------------------------------------------------------
insert into tareas (
  id, titulo, descripcion, fecha, prioridad, categoria,
  completada, completada_fecha,
  animal_id, animal_ids,
  potrero_id,
  asignado_a_id, asignado_a_ids
) values (
  'tar-crono-0725',
  'Suministro de agua y forraje + concentrado',
  'Se arregla poste de luz.',
  '2026-07-25', 'media', 'alimentacion',
  true, '2026-07-25T18:00:00Z'::timestamptz,
  null, '{}'::text[],
  null,
  'prop-orlando', array['prop-orlando', 'prop-camila']
)
on conflict (id) do update set
  titulo           = excluded.titulo,
  descripcion      = excluded.descripcion,
  fecha            = excluded.fecha,
  prioridad        = excluded.prioridad,
  categoria        = excluded.categoria,
  completada       = excluded.completada,
  completada_fecha = excluded.completada_fecha,
  asignado_a_id    = excluded.asignado_a_id,
  asignado_a_ids   = excluded.asignado_a_ids;

-- ------------------------------------------------------------------
--  3. INSUMOS — adicionales del sheet (upsert por id)
-- ------------------------------------------------------------------
insert into insumos (id, nombre, categoria, unidad, stock, minimo, costo_unitario, proveedor, notas) values
  ('ins-jeringas',   'Jeringas veterinarias', 'sanidad',        'un', 4, 6,  null, null, 'Compradas junto con la vitamina Over B (14-jul-2026).'),
  ('ins-puntillas',  'Puntillas 3"',          'infraestructura','kg', 0, 1,  null, null, 'Usadas en instalación de la cerca eléctrica.'),
  ('ins-aisladores', 'Aisladores eléctricos', 'infraestructura','un', 0, 20, null, null, '1 paquete usado en cerca eléctrica.'),
  ('ins-baldes',     'Baldes',                'otros',          'un', 4, 2,  null, null, '4 unidades compradas 11-jul-2026 para agua/sal.')
on conflict (id) do update set
  nombre         = excluded.nombre,
  categoria      = excluded.categoria,
  unidad         = excluded.unidad,
  stock          = excluded.stock,
  minimo         = excluded.minimo,
  costo_unitario = excluded.costo_unitario,
  proveedor      = excluded.proveedor,
  notas          = excluded.notas;

-- ------------------------------------------------------------------
--  Verificación rápida (opcional): descomenta para revisar
-- ------------------------------------------------------------------
-- select id, titulo, asignado_a_ids, animal_ids from tareas
--   where id like 'tar-crono-%' order by fecha;
-- select id, nombre, stock, minimo from insumos order by id;
