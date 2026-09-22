-- ============================================================================
--  Migrar Camila: camila@lasdelicias.co → camirincon@outlook.es
--
--  Contexto: Camila es propietaria (25%) de la finca "Las Delicias". Se
--  cambia el correo con el que entra a la app, sin perder ninguna data
--  (animales, gastos, tareas, historial). El propietario "Camila" queda
--  vinculado al nuevo auth.user, y el user viejo queda deshabilitado
--  (no se elimina para conservar historial en auth.users / auth.logs).
--
--  Requisito previo: el usuario camirincon@outlook.es debe existir en
--  Supabase Auth ANTES de correr este script. Crearlo desde el dashboard:
--    Authentication → Add user → Create new user → Auto Confirm.
--
--  Se corre desde el SQL Editor de Supabase (necesita permisos admin).
--  Es transaccional: si algo falla, no se aplica nada.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  old_uid uuid;
  new_uid uuid;
  n_prop int;
  n_mbr int;
  n_finca int;
BEGIN
  -- Lookup
  SELECT id INTO old_uid FROM auth.users WHERE lower(email) = 'camila@lasdelicias.co';
  SELECT id INTO new_uid FROM auth.users WHERE lower(email) = 'camirincon@outlook.es';

  IF old_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario VIEJO (camila@lasdelicias.co) no existe en auth.users. Nada que migrar.';
  END IF;
  IF new_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario NUEVO (camirincon@outlook.es) no existe. Créalo primero en Authentication → Add user.';
  END IF;
  IF old_uid = new_uid THEN
    RAISE EXCEPTION 'Los dos emails apuntan al mismo user_id. Nada que hacer.';
  END IF;

  RAISE NOTICE 'Viejo user_id: %', old_uid;
  RAISE NOTICE 'Nuevo user_id: %', new_uid;

  -- 1. Reasignar el vínculo propietario ↔ auth
  UPDATE propietarios SET auth_user_id = new_uid WHERE auth_user_id = old_uid;
  GET DIAGNOSTICS n_prop = ROW_COUNT;
  RAISE NOTICE 'propietarios reasignados: %', n_prop;

  -- 2. Reasignar la membresía a la(s) finca(s)
  --    (unique constraint (finca_id, user_id) impide colisión — si el
  --    nuevo user ya era miembro de la misma finca, la reasignación falla
  --    y toda la transacción se cae. Es lo que queremos: no borrar en
  --    silencio una membresía existente del nuevo user.)
  UPDATE finca_miembros SET user_id = new_uid WHERE user_id = old_uid;
  GET DIAGNOSTICS n_mbr = ROW_COUNT;
  RAISE NOTICE 'finca_miembros reasignados: %', n_mbr;

  -- 3. Si el user viejo era owner de alguna finca, transferir ownership
  UPDATE fincas SET owner_user_id = new_uid WHERE owner_user_id = old_uid;
  GET DIAGNOSTICS n_finca = ROW_COUNT;
  RAISE NOTICE 'fincas cuyo owner era el viejo (transferidas): %', n_finca;

  -- 4. Deshabilitar el user viejo (no borrar). Con banned_until en el
  --    futuro lejano Supabase Auth bloquea todo intento de login.
  UPDATE auth.users
     SET banned_until = 'infinity'::timestamptz,
         updated_at   = NOW()
   WHERE id = old_uid;
  RAISE NOTICE 'Usuario viejo deshabilitado (banned_until=infinity)';
END $$;

-- Verificación: mostrar el estado después
SELECT
  p.id           AS propietario_id,
  p.nombre       AS propietario,
  p.finca_id,
  p.auth_user_id,
  u.email        AS auth_email_actual
FROM propietarios p
LEFT JOIN auth.users u ON u.id = p.auth_user_id
WHERE p.auth_user_id IN (
  (SELECT id FROM auth.users WHERE lower(email) = 'camila@lasdelicias.co'),
  (SELECT id FROM auth.users WHERE lower(email) = 'camirincon@outlook.es')
);

SELECT
  id,
  email,
  banned_until,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE lower(email) IN ('camila@lasdelicias.co', 'camirincon@outlook.es')
ORDER BY email;

COMMIT;
