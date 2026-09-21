# MiFinca

App web multi-tenant para el control del hato de cualquier finca — animales, potreros, sanidad, reproducción, tareas, gastos e inventario. Cada ganadero se registra, crea su finca y la administra de forma aislada. Next.js 14 + Supabase (Postgres + Auth + Realtime + Storage).

> Los datos de la finca original (**Las Delicias**) siguen intactos: al aplicar la migración `2026-09-21-multi-tenant.sql`, todo lo existente queda dentro de una finca llamada "Las Delicias" cuyo owner es el usuario `rafael.rincong@gmail.com`.

## Estructura

- `web/` — app Next.js
- `web/supabase/` — SQL para crear el schema, cargar datos iniciales y migraciones (incluyendo la migración multi-tenant)

## Desarrollo local

```bash
cd web
npm install
cp .env.local.example .env.local   # edita con tus credenciales Supabase
npm run dev
```

Abre http://localhost:3000.

## Migración multi-tenant (una sola vez, en Supabase)

Después del `git pull` con este cambio:

1. En Supabase → SQL Editor, correr `web/supabase/migrations/2026-09-21-multi-tenant.sql`.
2. La migración es idempotente y protege los datos: crea la finca `Las Delicias` para el user `rafael.rincong@gmail.com`, hace backfill de todas las filas, y endurece RLS por `finca_id`.
3. Si ese usuario no existe todavía en `auth.users`, la migración lo avisará y no romperá nada — créalo y vuelve a correrla.

## Deploy

Vercel (recomendado). Variables de entorno:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
