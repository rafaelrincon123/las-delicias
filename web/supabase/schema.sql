-- ============================================================================
--  Ganadería Las Delicias — Schema Supabase (PostgreSQL)
--  Ejecutar en: Supabase → SQL Editor → New query → pegar todo → Run
-- ============================================================================

-- Extensiones útiles
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- ENUMs
-- ---------------------------------------------------------------------------
do $$ begin
  create type sexo_enum          as enum ('hembra', 'macho');
  create type estado_animal_enum as enum ('activo', 'vendido', 'muerto', 'descartado');
  create type categoria_animal_enum as enum ('ternero', 'ternera', 'novillo', 'novilla', 'vaca', 'toro');
  create type tipo_sanidad_enum  as enum ('vacuna', 'tratamiento', 'desparasitacion', 'revision');
  create type tipo_servicio_enum as enum ('monta_natural', 'inseminacion');
  create type resultado_servicio_enum as enum ('pendiente', 'prenada', 'vacia');
  create type tipo_pesaje_enum   as enum ('nacimiento', 'destete', 'periodico', 'venta');
  create type categoria_gasto_enum as enum ('alimentacion', 'sanidad', 'mano_de_obra', 'infraestructura', 'servicios', 'otros');
  create type tipo_ingreso_enum  as enum ('venta_animal', 'venta_leche', 'otros');
  create type prioridad_tarea_enum as enum ('alta', 'media', 'baja');
  create type categoria_tarea_enum as enum ('sanidad', 'alimentacion', 'manejo', 'reproduccion', 'infraestructura', 'otros');
  create type unidad_insumo_enum as enum ('kg', 'g', 'lt', 'ml', 'un', 'dosis', 'bulto', 'rollo');
  create type categoria_insumo_enum as enum ('alimentacion', 'sanidad', 'infraestructura', 'aseo', 'otros');
  create type tipo_movimiento_insumo_enum as enum ('entrada', 'salida', 'ajuste');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Propietarios (socios). id es text para preservar los IDs del seed actual.
-- auth_user_id enlaza con auth.users cuando el socio crea sesión en Supabase.
-- ---------------------------------------------------------------------------
create table if not exists propietarios (
  id                text primary key,
  nombre            text not null,
  email             text not null unique,
  participacion_pct numeric(5,2) not null default 25,
  auth_user_id      uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Potreros
-- ---------------------------------------------------------------------------
create table if not exists potreros (
  id              text primary key,
  nombre          text not null,
  area_hectareas  numeric(8,2) not null default 0,
  capacidad       int not null default 0,
  notas           text,
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Animales
-- ---------------------------------------------------------------------------
create table if not exists animales (
  id                       text primary key,
  nro_identificacion       text not null,
  nombre                   text,
  sexo                     sexo_enum not null,
  raza                     text not null default 'Sin registrar',
  fecha_nacimiento         date not null,
  fecha_nacimiento_aprox   boolean not null default false,
  madre_id                 text references animales(id) on delete set null,
  padre_id                 text references animales(id) on delete set null,
  madre_nombre             text,
  padre_nombre             text,
  categoria                categoria_animal_enum not null,
  estado                   estado_animal_enum not null default 'activo',
  potrero_id               text references potreros(id) on delete set null,
  propietario_id           text references propietarios(id) on delete set null,
  foto_url                 text,
  notas                    text,
  created_at               timestamptz not null default now()
);
create index if not exists idx_animales_potrero      on animales(potrero_id);
create index if not exists idx_animales_propietario  on animales(propietario_id);
create index if not exists idx_animales_estado       on animales(estado);

-- ---------------------------------------------------------------------------
-- Sanidad (vacunas / tratamientos / desparasitación / revisión)
-- ---------------------------------------------------------------------------
create table if not exists sanidad (
  id                    text primary key,
  animal_id             text not null references animales(id) on delete cascade,
  tipo                  tipo_sanidad_enum not null,
  producto              text not null,
  dosis                 text,
  fecha                 date not null,
  proximo_evento_fecha  date,
  veterinario           text,
  costo                 numeric(12,2),
  notas                 text,
  created_at            timestamptz not null default now()
);
create index if not exists idx_sanidad_animal on sanidad(animal_id);
create index if not exists idx_sanidad_fecha  on sanidad(fecha);

-- ---------------------------------------------------------------------------
-- Servicios reproductivos
-- ---------------------------------------------------------------------------
create table if not exists servicios (
  id                       text primary key,
  hembra_id                text not null references animales(id) on delete cascade,
  macho_id_o_referencia    text not null,
  tipo                     tipo_servicio_enum not null,
  fecha_servicio           date not null,
  fecha_diagnostico        date,
  resultado                resultado_servicio_enum not null default 'pendiente',
  fecha_probable_parto     date,
  notas                    text,
  created_at               timestamptz not null default now()
);
create index if not exists idx_servicios_hembra on servicios(hembra_id);

-- ---------------------------------------------------------------------------
-- Partos
-- ---------------------------------------------------------------------------
create table if not exists partos (
  id               text primary key,
  madre_id         text not null references animales(id) on delete cascade,
  fecha            date not null,
  ternero_id       text references animales(id) on delete set null,
  peso_ternero_kg  numeric(6,2),
  sexo_ternero     sexo_enum,
  complicaciones   text,
  notas            text,
  created_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pesajes
-- ---------------------------------------------------------------------------
create table if not exists pesajes (
  id         text primary key,
  animal_id  text not null references animales(id) on delete cascade,
  fecha      date not null,
  peso_kg    numeric(7,2) not null,
  tipo       tipo_pesaje_enum not null,
  notas      text,
  created_at timestamptz not null default now()
);
create index if not exists idx_pesajes_animal on pesajes(animal_id);

-- ---------------------------------------------------------------------------
-- Producción de leche
-- ---------------------------------------------------------------------------
create table if not exists produccion_leche (
  id             text primary key,
  animal_id      text not null references animales(id) on delete cascade,
  fecha          date not null,
  litros_manana  numeric(6,2) not null default 0,
  litros_tarde   numeric(6,2) not null default 0,
  notas          text,
  created_at     timestamptz not null default now()
);
create index if not exists idx_leche_animal on produccion_leche(animal_id);
create index if not exists idx_leche_fecha  on produccion_leche(fecha);

-- ---------------------------------------------------------------------------
-- Gastos
-- ---------------------------------------------------------------------------
create table if not exists gastos (
  id             text primary key,
  fecha          date not null,
  categoria      categoria_gasto_enum not null,
  concepto       text not null,
  monto          numeric(12,2) not null,
  proveedor      text,
  pagado_por     text references propietarios(id) on delete set null,
  participantes  text[],
  animal_id      text references animales(id) on delete set null,
  potrero_id     text references potreros(id) on delete set null,
  notas          text,
  created_at     timestamptz not null default now()
);
create index if not exists idx_gastos_fecha    on gastos(fecha);
create index if not exists idx_gastos_pagador  on gastos(pagado_por);

-- ---------------------------------------------------------------------------
-- Ingresos
-- ---------------------------------------------------------------------------
create table if not exists ingresos (
  id         text primary key,
  fecha      date not null,
  tipo       tipo_ingreso_enum not null,
  concepto   text not null,
  monto      numeric(12,2) not null,
  comprador  text,
  animal_id  text references animales(id) on delete set null,
  notas      text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ingresos_fecha on ingresos(fecha);

-- ---------------------------------------------------------------------------
-- Tareas
-- ---------------------------------------------------------------------------
create table if not exists tareas (
  id                text primary key,
  titulo            text not null,
  descripcion       text,
  fecha             date not null,
  prioridad         prioridad_tarea_enum not null default 'media',
  categoria         categoria_tarea_enum not null default 'otros',
  completada        boolean not null default false,
  completada_fecha  timestamptz,
  animal_id         text references animales(id) on delete set null,
  potrero_id        text references potreros(id) on delete set null,
  asignado_a_id     text references propietarios(id) on delete set null,
  created_at        timestamptz not null default now()
);
create index if not exists idx_tareas_fecha       on tareas(fecha);
create index if not exists idx_tareas_completada  on tareas(completada);
create index if not exists idx_tareas_asignado    on tareas(asignado_a_id);

-- ---------------------------------------------------------------------------
-- Insumos + Movimientos
-- ---------------------------------------------------------------------------
create table if not exists insumos (
  id              text primary key,
  nombre          text not null,
  categoria       categoria_insumo_enum not null,
  unidad          unidad_insumo_enum not null,
  stock           numeric(12,2) not null default 0,
  minimo          numeric(12,2) not null default 0,
  costo_unitario  numeric(12,2),
  proveedor       text,
  notas           text,
  created_at      timestamptz not null default now()
);

create table if not exists movimientos_insumo (
  id            text primary key,
  insumo_id     text not null references insumos(id) on delete cascade,
  fecha         date not null,
  tipo          tipo_movimiento_insumo_enum not null,
  cantidad      numeric(12,2) not null,
  costo_total   numeric(12,2),
  motivo        text,
  animal_id     text references animales(id) on delete set null,
  potrero_id    text references potreros(id) on delete set null,
  hecho_por_id  text references propietarios(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_mov_insumo on movimientos_insumo(insumo_id);

-- ============================================================================
--  Row Level Security
--  Modelo: cualquier usuario autenticado (los 4 socios) puede leer y escribir.
--  Refinar más adelante si se quiere restringir por socio.
-- ============================================================================
alter table propietarios       enable row level security;
alter table potreros           enable row level security;
alter table animales           enable row level security;
alter table sanidad            enable row level security;
alter table servicios          enable row level security;
alter table partos             enable row level security;
alter table pesajes            enable row level security;
alter table produccion_leche   enable row level security;
alter table gastos             enable row level security;
alter table ingresos           enable row level security;
alter table tareas             enable row level security;
alter table insumos            enable row level security;
alter table movimientos_insumo enable row level security;

-- Helper: política única "authenticated full access" para cada tabla.
do $$
declare t text;
begin
  foreach t in array array[
    'propietarios','potreros','animales','sanidad','servicios','partos',
    'pesajes','produccion_leche','gastos','ingresos','tareas','insumos',
    'movimientos_insumo'
  ] loop
    execute format('drop policy if exists "socios_all_%s" on %I', t, t);
    execute format(
      'create policy "socios_all_%s" on %I
         for all
         to authenticated
         using (true)
         with check (true)',
      t, t
    );
  end loop;
end $$;
