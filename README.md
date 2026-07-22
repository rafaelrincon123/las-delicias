# Ganadería Las Delicias

App web para el control del hato de la finca Las Delicias — animales, potreros, sanidad, reproducción, tareas, gastos e inventario. Next.js 14 + Supabase.

## Estructura

- `web/` — app Next.js
- `web/supabase/` — SQL para crear el schema y cargar datos iniciales

## Desarrollo local

```bash
cd web
npm install
cp .env.local.example .env.local   # edita con tus credenciales Supabase
npm run dev
```

Abre http://localhost:3000.

## Deploy

Vercel (recomendado). Ver instrucciones en el flujo de setup — variables de entorno:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
