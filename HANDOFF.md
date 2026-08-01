# Ganadería Las Delicias — Handoff (traspaso a otro computador)

Documento para retomar el proyecto desde otra máquina. Fecha: 2026-08-01.

---

## 1. Qué es

App web para el control de la finca **Las Delicias**: animales, potreros, sanidad, reproducción, tareas, gastos (con reparto entre socios), inventario, control de peso y producción.

- **Stack:** Next.js 14 (App Router) + TypeScript + Tailwind + Supabase (Postgres + Auth + Realtime + Storage).
- **Deploy:** Vercel (root directory apuntando a `web/`).
- **Repo:** https://github.com/rafaelrincon123/las-delicias
- **Rama principal:** `main`

---

## 2. Cómo levantar el proyecto en el nuevo computador

### 2.1 Requisitos
- Git
- Node.js 18+ (recomendado 20)
- npm
- Cuenta de GitHub con acceso al repo `rafaelrincon123/las-delicias`

### 2.2 Pasos

```bash
git clone https://github.com/rafaelrincon123/las-delicias.git
cd las-delicias/web
npm install
```

Crear `web/.env.local` con las credenciales de Supabase (ver sección 3):

```
NEXT_PUBLIC_SUPABASE_URL=https://tfluitgarqtdjdbxugmq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<pegar la anon key — ver sección 3>
```

Correr en local:

```bash
npm run dev
```

Abrir http://localhost:3000.

---

## 3. Credenciales (¡NO commitear!)

Las credenciales de Supabase que se usan hoy están en `web/.env.local` de este PC. Cópialas manualmente al nuevo equipo (por USB, gestor de contraseñas o similar). El archivo `.env.local` está en `.gitignore`, por eso no viaja con el repo.

- **Supabase URL:** `https://tfluitgarqtdjdbxugmq.supabase.co`
- **Supabase anon key:** copiar de `web/.env.local` en este PC (línea 2).
- **Dashboard Supabase:** https://supabase.com/dashboard/project/tfluitgarqtdjdbxugmq
- **Vercel:** las mismas dos variables ya están configuradas en el proyecto en producción; no hay que tocar nada allí para trabajar en local.

Si pierdes las keys, regenera la `anon key` desde Supabase → Project Settings → API y actualiza en Vercel + `.env.local`.

---

## 4. Estructura del repo

```
/
├── README.md
└── web/
    ├── package.json
    ├── next.config.mjs
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── public/
    │   └── logo.png
    ├── src/
    │   ├── app/                    # rutas Next.js (App Router)
    │   │   ├── page.tsx            # HOME — 4 tiles principales
    │   │   ├── layout.tsx
    │   │   ├── globals.css
    │   │   ├── animales/
    │   │   ├── hato/
    │   │   ├── potreros/
    │   │   ├── sanidad/
    │   │   ├── reproduccion/
    │   │   ├── produccion/
    │   │   ├── peso/               # Control de peso
    │   │   ├── tareas/             # multi-selección
    │   │   ├── gastos/             # reparto socios + deudas
    │   │   ├── inventario/
    │   │   ├── mi-operacion/
    │   │   └── panel/
    │   ├── components/
    │   │   ├── AuthGate.tsx        # gate de login
    │   │   ├── NavShell.tsx        # shell (header + sidebar + bottom nav)
    │   │   ├── Header.tsx, Sidebar.tsx, BottomNav.tsx
    │   │   ├── HomeArt.tsx         # ilustraciones a color del home
    │   │   ├── Modal.tsx, FormRow.tsx, EmptyState.tsx
    │   │   ├── StatCard.tsx, Sparkline.tsx, AreaChart.tsx
    │   │   ├── PastureMap.tsx, PhotoInput.tsx
    │   │   └── icons.tsx
    │   └── lib/
    │       ├── supabase.ts         # cliente
    │       ├── auth.ts, useAuth.ts # sesión
    │       ├── db.ts               # capa CRUD sobre Supabase
    │       ├── useDB.ts            # hook con Realtime
    │       ├── types.ts            # tipos del dominio
    │       ├── format.ts           # helpers fecha/número (locale)
    │       ├── participacion.ts    # % socios para gastos
    │       ├── storage.ts          # Supabase Storage (fotos)
    │       └── seed.ts             # datos iniciales
    └── supabase/
        ├── schema.sql              # crea tablas + RLS
        ├── seed.sql                # datos iniciales
        ├── realtime.sql            # habilita realtime en tablas
        └── migrations/
            ├── 2026-07-29-sync-sheet.sql
            └── 2026-07-30-gastos-pagado-por-ids.sql
```

---

## 5. Últimos cambios (historial reciente)

```
eaf7f07 feat(gastos): marcar quien ya pago su parte y ver deudas entre socios
1fe04e3 feat(home): 4 tiles iguales con ilustraciones a color
eb168c2 fix: fechas locales + refresh en tiempo real, home a 4 tiles
add814a data: sincronizar con Google Sheets (cronograma julio 2026)
c8c597a feat(home): tile con icono centrado y estilo mas moderno
0fd59c9 feat(home): tiles estilo app movil moderna (Revolut/Robinhood)
8d89821 feat: home solo tiles + tareas con multi-seleccion
6ce1245 feat: nueva sección Control de peso
116f291 feat: sincronización en tiempo real vía Supabase Realtime
d4db950 fix: renombrar Logo.png → logo.png para case-sensitivity
de8d212 fix(auth): loop infinito en pantalla de carga
54ce861 fix(build): TS target + reproduccion categoria typing
83a162f fix(lint): unused imports and prefer-const
e0caa77 Initial commit: Ganadería Las Delicias con Supabase backend
```

**Estado actual del working tree:** solo `.claude/settings.local.json` modificado (config local de Claude Code, no crítico).

---

## 6. Funcionalidades clave que ya funcionan

- **Auth:** login por Supabase Auth. `AuthGate` protege toda la app.
- **Realtime:** cambios en cualquier dispositivo se reflejan en vivo (sin recargar) vía `useDB.ts` + `realtime.sql`.
- **Home:** 4 tiles iguales con ilustraciones a color (`HomeArt.tsx`), estilo app móvil moderna.
- **Hato / animales:** CRUD, categorías, potrero asignado, fotos vía Storage.
- **Potreros:** con `PastureMap`.
- **Sanidad, Reproducción, Producción:** eventos por animal.
- **Peso:** historial y sparkline.
- **Tareas:** multi-selección para marcar varias hechas a la vez.
- **Gastos:** reparto por % de participación entre socios, marcar quién pagó su parte, cálculo automático de deudas entre socios.
- **Inventario:** insumos con stock.

---

## 7. Datos importantes en Supabase

- Schema completo en `web/supabase/schema.sql`.
- Datos semilla en `web/supabase/seed.sql`.
- Realtime habilitado en las tablas críticas via `web/supabase/realtime.sql`.
- Migraciones aplicadas hasta la fecha están en `web/supabase/migrations/` — la última es `2026-07-30-gastos-pagado-por-ids.sql`.

**Si arrancas un proyecto Supabase nuevo desde cero**, ejecuta en el SQL editor en este orden:
1. `schema.sql`
2. `seed.sql`
3. `realtime.sql`
4. Todos los archivos de `migrations/` en orden de fecha.

Pero si sigues usando el mismo proyecto (`tfluitgarqtdjdbxugmq`), no toques nada — los datos ya están.

---

## 8. Deploy

- Está en Vercel, root directory = `web/`.
- Cada push a `main` dispara un deploy automático.
- Variables de entorno en Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` ya configuradas.

---

## 9. Comandos útiles

```bash
# desarrollo
npm run dev

# build local (para probar antes de push)
npm run build

# lint
npm run lint

# ver estado
git status
git log --oneline -20
```

---

## 10. Tips para retomar

1. Clona → `npm install` → copia `.env.local` → `npm run dev`. Debería funcionar en 5 minutos.
2. Si algo del schema Supabase cambió, revisa `web/supabase/migrations/` — sirve como bitácora.
3. La lógica de reparto entre socios vive en `src/lib/participacion.ts` y se usa en `src/app/gastos/page.tsx`.
4. Los tipos de dominio (`Animal`, `Potrero`, `SanidadEvento`, etc.) están en `src/lib/types.ts`.
5. Toda la capa de datos pasa por `src/lib/db.ts` (CRUD) + `src/lib/useDB.ts` (hook con Realtime). Si agregas una tabla nueva, replica el patrón allí.

---

## 11. Qué NO viaja en el repo (traer aparte)

- `web/.env.local` — credenciales Supabase.
- `web/node_modules/` — se regenera con `npm install`.
- Cualquier foto local no subida a Supabase Storage.

---

Listo para trabajar desde el otro PC.
