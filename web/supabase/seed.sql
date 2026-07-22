-- ============================================================================
--  Ganadería Las Delicias — Datos iniciales (seed)
--  Ejecutar DESPUÉS de schema.sql.
--  Idempotente: usa ON CONFLICT (id) DO NOTHING para no duplicar.
-- ============================================================================

-- ------------------ Propietarios --------------------------------------------
insert into propietarios (id, nombre, email, participacion_pct) values
  ('prop-orlando', 'Orlando', 'orlando@lasdelicias.co', 25),
  ('prop-camila',  'Camila',  'camila@lasdelicias.co',  25),
  ('prop-nicolas', 'Nicolas', 'nicolas@lasdelicias.co', 25),
  ('prop-rafael',  'Rafael',  'rafael@lasdelicias.co',  25)
on conflict (id) do nothing;

-- ------------------ Potreros ------------------------------------------------
insert into potreros (id, nombre, area_hectareas, capacidad, notas) values
  ('pot-1',          'Lote 1',       4, 6,
   'Lote actual. Se cambió el 09-jul-2026, cercado eléctrico instalado.'),
  ('pot-fin-finca',  'Fin de finca', 3, 5,
   'Primer lote donde estuvieron. Corriente eléctrica llevada hasta el fin de la finca.')
on conflict (id) do nothing;

-- ------------------ Animales ------------------------------------------------
insert into animales (id, nro_identificacion, nombre, sexo, raza, fecha_nacimiento, fecha_nacimiento_aprox, madre_nombre, padre_nombre, categoria, estado, potrero_id, propietario_id, notas) values
  ('an-nube',    '001', 'Nube',    'hembra', 'Sin registrar', '2024-06-01', true,  null,     null,        'novilla', 'activo', 'pot-1',         'prop-orlando', 'Estimación 2 años a junio 2026. Inseminada el 18-jun-2026 con semen de Urano.'),
  ('an-pandora', '002', 'Pandora', 'hembra', 'Sin registrar', '2024-12-28', false, 'Concha', 'Pregonero', 'novilla', 'activo', 'pot-1',         'prop-camila',  null),
  ('an-canela',  '003', 'Canela',  'hembra', 'Sin registrar', '2025-06-06', false, 'Muñeca', 'Rival',     'ternera', 'activo', 'pot-1',         'prop-nicolas', null),
  ('an-zeus',    '200', 'Zeus',    'macho',  'Sin registrar', '2025-06-24', false, 'Tarcia', 'Secret',    'ternero', 'activo', 'pot-1',         'prop-rafael',  null),
  ('an-luna',    '005', 'Luna',    'hembra', 'Sin registrar', '2025-01-01', true,  null,     null,        'ternera', 'activo', 'pot-fin-finca', 'prop-orlando', 'Aparece en el arriendo de 5 cabezas junto con Nube. Fecha de nacimiento y padres por confirmar.'),
  ('an-nuevi',   '201', 'Nuevi',   'hembra', 'Sin registrar', '2025-01-01', true,  null,     null,        'ternera', 'activo', 'pot-fin-finca', null,           'Nuevo ingreso al hato — completar datos (sexo, edad, padres, propietario).')
on conflict (id) do nothing;

-- ------------------ Sanidad -------------------------------------------------
insert into sanidad (id, animal_id, tipo, producto, dosis, fecha, costo, notas) values
  -- Vacunación 05-jun-2026
  ('san-v-nube',        'an-nube',    'vacuna',          'Aftosa',            null,  '2026-06-05', null,  null),
  ('san-v-pandora',     'an-pandora', 'vacuna',          'Aftosa',            null,  '2026-06-05', null,  null),
  ('san-v-canela',      'an-canela',  'vacuna',          'Brucelosis',        null,  '2026-06-05', null,  null),
  ('san-v-zeus',        'an-zeus',    'vacuna',          'Aftosa',            null,  '2026-06-05', null,  null),
  -- Purga 25-jun-2026
  ('san-p-nube',        'an-nube',    'desparasitacion', 'Purga',             null,  '2026-06-25', null,  null),
  ('san-p-pandora',     'an-pandora', 'desparasitacion', 'Purga',             null,  '2026-06-25', null,  null),
  ('san-p-canela',      'an-canela',  'desparasitacion', 'Purga',             null,  '2026-06-25', null,  null),
  ('san-p-zeus',        'an-zeus',    'desparasitacion', 'Purga',             null,  '2026-06-25', null,  null),
  -- Nube: sincronización
  ('san-nube-sinc',     'an-nube',    'tratamiento',     'Sincronización',    null,  '2026-06-15', 15000, 'Preparación para inseminación'),
  -- Fumigación 11-jul-2026
  ('san-m-nube',        'an-nube',    'tratamiento',     'Fumigación mosco',  null,  '2026-07-11', null,  null),
  ('san-m-pandora',     'an-pandora', 'tratamiento',     'Fumigación mosco',  null,  '2026-07-11', null,  null),
  ('san-m-canela',      'an-canela',  'tratamiento',     'Fumigación mosco',  null,  '2026-07-11', null,  null),
  ('san-m-zeus',        'an-zeus',    'tratamiento',     'Fumigación mosco',  null,  '2026-07-11', null,  null),
  -- Vitaminizado 14-jul-2026
  ('san-vit-nube',      'an-nube',    'tratamiento',     'Vitamina Over B',   '8 CC','2026-07-14', null,  null),
  ('san-vit-pandora',   'an-pandora', 'tratamiento',     'Vitamina Over B',   '8 CC','2026-07-14', null,  null),
  ('san-vit-canela',    'an-canela',  'tratamiento',     'Vitamina Over B',   '8 CC','2026-07-14', null,  null),
  ('san-vit-zeus',      'an-zeus',    'tratamiento',     'Vitamina Over B',   '8 CC','2026-07-14', null,  null),
  -- Pandora sarna
  ('san-pandora-sarna', 'an-pandora', 'tratamiento',     'Tratamiento sarna', null,  '2026-07-14', null,  'Ivermectina + crema')
on conflict (id) do nothing;

-- ------------------ Servicios reproductivos ---------------------------------
insert into servicios (id, hembra_id, macho_id_o_referencia, tipo, fecha_servicio, resultado, fecha_probable_parto, notas) values
  ('srv-nube-urano', 'an-nube', 'Semen Urano', 'inseminacion', '2026-06-18', 'pendiente', '2027-03-27', 'Inseminación con semen de Urano · $85.000')
on conflict (id) do nothing;

-- ------------------ Gastos --------------------------------------------------
insert into gastos (id, fecha, categoria, concepto, monto, proveedor, pagado_por, participantes, animal_id, notas) values
  ('gas-arr-orlando-5', '2026-07-15', 'servicios',      'Arriendo pasto 5 cab / 5 meses — Nube (Luna incl.)', 670000, 'Arriendo pasto', 'prop-orlando', null, null, '$67.000 mes/cabeza × 5 meses'),
  ('gas-arr-nicolas-5', '2026-07-15', 'servicios',      'Arriendo pasto 5 cab / 5 meses — Canela / Zeus',     670000, 'Arriendo pasto', 'prop-nicolas', null, null, '$67.000 mes/cabeza × 5 meses'),
  ('gas-arr-camila-5',  '2026-07-15', 'servicios',      'Arriendo pasto 5 cab / 5 meses — Pandora',           335000, 'Arriendo pasto', 'prop-camila',  null, null, '$67.000 mes/cabeza × 5 meses'),
  ('gas-arr-orlando-4', '2026-07-30', 'servicios',      'Arriendo pasto 4 cab — Nube',                          84000, 'Arriendo pasto', 'prop-orlando', null, null, '$84.000 mes/cabeza'),
  ('gas-arr-camila-4',  '2026-07-30', 'servicios',      'Arriendo pasto 4 cab — Pandora',                       84000, 'Arriendo pasto', 'prop-camila',  null, null, '$84.000 mes/cabeza'),
  ('gas-arr-nicolas-4', '2026-07-30', 'servicios',      'Arriendo pasto 4 cab — Canela',                        84000, 'Arriendo pasto', 'prop-nicolas', null, null, '$84.000 mes/cabeza'),
  ('gas-arr-rafael-4',  '2026-07-30', 'servicios',      'Arriendo pasto 4 cab — Zeus',                          84000, 'Arriendo pasto', 'prop-rafael',  null, null, '$84.000 mes/cabeza'),
  ('gas-var-concentrado','2026-07-11','alimentacion',   'Concentrado (Tulipán) + sal 10 kg + tratamiento mosco + 4 baldes',
                                                                                                              150000, 'Presupuestado $160.000 — real $150.000', null,
       array['prop-orlando','prop-camila','prop-nicolas','prop-rafael'], null, 'Recolectado igual entre los 4 socios'),
  ('gas-var-corriente','2026-07-11','infraestructura','Instalación cerca eléctrica',                            79000, '1 lb puntillas, 200 mt cinta, 1 pq aisladores', null,
       array['prop-orlando','prop-camila','prop-nicolas','prop-rafael'], null, 'Presupuesto $80.000'),
  ('gas-var-vitamina', '2026-07-14', 'sanidad',        'Vitamina Over B + jeringas',                            46500, 'Aplicado 8cc / cabeza', null,
       array['prop-orlando','prop-camila','prop-nicolas','prop-rafael'], null, null),
  ('gas-nube-sinc',    '2026-06-15', 'sanidad',        'Tratamiento sincronización — Nube',                     15000, null,             null, null, 'an-nube', 'Preparación para inseminación'),
  ('gas-nube-insem',   '2026-06-18', 'sanidad',        'Inseminación con semen de Urano — Nube',                85000, 'Semen Urano',    null, null, 'an-nube', null)
on conflict (id) do nothing;

-- ------------------ Tareas --------------------------------------------------
insert into tareas (id, titulo, descripcion, fecha, prioridad, categoria, completada, completada_fecha, animal_id, potrero_id, asignado_a_id) values
  ('tar-crono-0704',     'Suministro de agua y forraje',                    null,                                                                     '2026-07-04', 'media','alimentacion', true,  '2026-07-04T18:00:00Z'::timestamptz, null,          null,             'prop-orlando'),
  ('tar-crono-0707',     'Suministro de agua y forraje',                    null,                                                                     '2026-07-07', 'media','alimentacion', true,  '2026-07-07T18:00:00Z'::timestamptz, null,          null,             'prop-nicolas'),
  ('tar-crono-0709',     'Suministro de agua y forraje + cambio de lote',   'Cambio de lote, se mueve el agua y se pone corriente.',                  '2026-07-09', 'media','manejo',       true,  '2026-07-09T18:00:00Z'::timestamptz, null,          'pot-1',          'prop-orlando'),
  ('tar-crono-0711',     'Rotación de pasturas + cercado eléctrico',        'Se llevó la corriente hasta el fin de la finca primer lote. Inicio de concentrado 2 kg por ternero + sal. Fumigación contra el mosco. Se puso pasto en el lote actual.',
                                                                                                                                                      '2026-07-11', 'alta', 'manejo',       true,  '2026-07-11T18:00:00Z'::timestamptz, null,          'pot-fin-finca',  'prop-orlando'),
  ('tar-crono-0714-rot', 'Rotación + traslado agua + concentrado + sal',    'Inicio nuevo Lote 1.',                                                   '2026-07-14', 'alta', 'manejo',       true,  '2026-07-14T18:00:00Z'::timestamptz, null,          'pot-1',          'prop-orlando'),
  ('tar-crono-0714-vit', 'Vitaminizado + tratamiento a Pandora',            'Ivermectina + crema. Vitamina Over B 8 CC / cabeza.',                    '2026-07-14', 'alta', 'sanidad',      true,  '2026-07-14T18:00:00Z'::timestamptz, 'an-pandora',  null,             'prop-camila'),
  ('tar-crono-0717',     'Suministro de agua y forraje + concentrado',      null,                                                                     '2026-07-17', 'media','alimentacion', true,  '2026-07-17T18:00:00Z'::timestamptz, null,          null,             'prop-camila'),
  ('tar-crono-0721',     'Suministro de agua y forraje + concentrado',      null,                                                                     '2026-07-21', 'media','alimentacion', true,  '2026-07-21T12:00:00Z'::timestamptz, null,          null,             'prop-nicolas'),
  ('tar-rotar-lote1',    'Rotar potrero — mover a Fin de finca',            'El Lote 1 lleva casi un mes con las 4 cabezas. Revisar pasto antes de mover.', '2026-07-25', 'media','manejo',       false, null,                                null,          'pot-1',          null),
  ('tar-diag-nube',      'Diagnóstico de preñez — Nube',                    'Palpar / ecografía a los 45 días post-inseminación (18-jun).',          '2026-08-02', 'alta', 'reproduccion', false, null,                                'an-nube',     null,             null),
  ('tar-comprar-sal',    'Comprar sal mineralizada',                        'Quedan menos de 3 kg. Traer bulto nuevo la próxima vez.',                '2026-07-22', 'baja', 'alimentacion', false, null,                                null,          null,             null)
on conflict (id) do nothing;

-- ------------------ Insumos + movimientos -----------------------------------
insert into insumos (id, nombre, categoria, unidad, stock, minimo, costo_unitario, proveedor, notas) values
  ('ins-sal',         'Sal mineralizada',        'alimentacion',   'kg',    3,  10, 4500,  'Agroinsumos local', null),
  ('ins-concentrado', 'Concentrado Tulipán',     'alimentacion',   'bulto', 1,  2,  95000, null,               null),
  ('ins-vitamina',    'Vitamina Over B',         'sanidad',        'ml',    68, 50, 350,   null,               '8 CC por cabeza. Sirve para las 4 vacas.'),
  ('ins-cinta',       'Cinta eléctrica 200 m',   'infraestructura','rollo', 0,  1,  45000, null,               null)
on conflict (id) do nothing;

insert into movimientos_insumo (id, insumo_id, fecha, tipo, cantidad, costo_total, motivo, potrero_id) values
  ('mov-ini-sal', 'ins-sal',      '2026-07-11', 'entrada', 10,  45000, 'Compra inicial (10 kg junto con concentrado)', null),
  ('mov-uso-sal', 'ins-sal',      '2026-07-18', 'salida',  7,   null,  'Consumo en Lote 1 (semana)',                   'pot-1'),
  ('mov-ini-vit', 'ins-vitamina', '2026-07-14', 'entrada', 100, 35000, 'Compra Over B',                                null),
  ('mov-uso-vit', 'ins-vitamina', '2026-07-14', 'salida',  32,  null,  'Aplicado 8 CC × 4 cabezas',                    null)
on conflict (id) do nothing;
